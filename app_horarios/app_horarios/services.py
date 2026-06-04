import io
import re
import pandas as pd
from typing import List, Dict, Set
from django.db import connection, transaction

# Mapeo de entidades lógicas a tablas físicas
ENTIDADES = {
    "roles": ["auth_group", "auth_group_permissions"],
    "usuarios": ["usuarios", "usuarios_groups"],
    "aulas": ["AULA"],
    "grados": ["GRADO"],
    "asignaturas": ["ASIGNATURAS"],
    "grupos": ["GRUPO"],
    "docentes": ["DOCENTE"],
    "responsables": ["RESPONSABLE"],
    "asignaciones": ["IMPARTE"],
    "cursos": ["CURSO"],
    "semestres": ["SEMESTRE"],
    "dias": ["DIA"],
    "lectivos": ["LECTIVO"],
    "festivos": ["FESTIVO"],
    "cambiosDocencia": ["CAMBIO_DOCENCIA"],
    "tfg": ["TFG"],
    "examenes": ["EXAMEN"],
    "reservas": ["RESERVA"],
    "reservas_periodicas": ["RESERVA_PERIODICA"],
    "reservas_puntuales": ["RESERVA_PUNTUAL"],
}

def _resolver_tablas(parametro_entidad: str) -> List[str]:
    """
    Traduce el parámetro recibido desde la URL o el frontend en una lista de tablas reales.
    Si se pide "all", devuelve todas las tablas registradas. Si se piden entidades 
    específicas separadas por comas, busca sus tablas correspondientes.
    """
    # Si viene vacío o es "all", recopilamos todas las tablas del diccionario global ENTIDADES
    if not parametro_entidad or parametro_entidad.strip().lower() == "all":
        tablas = []
        for lista_tablas in ENTIDADES.values():
            tablas.extend(lista_tablas)
        return list(set(tablas))

# Si vienen entidades concretas, separamos por comas y extraemos sus tablas
    entidades_solicitadas = [e.strip().lower() for e in parametro_entidad.split(",")]
    tablas = []
    for entidad in entidades_solicitadas:
        if entidad in ENTIDADES:
            tablas.extend(ENTIDADES[entidad])
    return tablas

def _obtener_dependencias_fk(tablas: List[str]) -> Dict[str, Set[str]]:
    """
    Inspecciona la base de datos real para descubrir las relaciones (claves foráneas)
    entre las tablas solicitadas. 
    Devuelve un diccionario donde la clave es una tabla y el valor es un conjunto (set) 
    con las tablas de las que depende (es decir, a las que apunta su FK).
    """
    dependencias: Dict[str, Set[str]] = {t: set() for t in tablas}
    conjunto_tablas = set(tablas)
    
    with connection.cursor() as cursor:
        for tabla in tablas:
            restricciones = connection.introspection.get_constraints(cursor, tabla)
            for _, info_restriccion in restricciones.items():
                clave_foranea = info_restriccion.get("foreign_key")

                # Si la restricción es una FK y apunta a una tabla que nos interesa exportar/importar
                if clave_foranea and clave_foranea[0] in conjunto_tablas:
                    dependencias[tabla].add(clave_foranea[0])
    return dependencias

def _orden_topologico(dependencias: Dict[str, Set[str]]) -> List[str]:
    """
    Ordena las tablas de forma que ninguna tabla se inserte antes que sus dependencias.
    Implementa un algoritmo clásico de "Ordenación Topológica".
    """
    restantes = {t: set(d) for t, d in dependencias.items()}
    resultado: List[str] = []
    
    while restantes:
        listos = [t for t, d in restantes.items() if not d]
        if not listos:
            # Si hay un ciclo, ordenamos alfabéticamente lo que queda para no bloquear
            resultado.extend(sorted(restantes.keys()))
            break
            
        listos.sort() # Las ordenamos alfabéticamente para consistencia
        resultado.extend(listos)
        
        # Eliminamos las tablas procesadas del diccionario de "restantes"
        for t in listos:
            restantes.pop(t, None)
        # Actualizamos las tablas que quedaban quitando la dependencia que ya hemos procesado
        for t in restantes:
            restantes[t].difference_update(listos)
            
    return resultado

def _obtener_columnas_tabla(tabla: str) -> List[str]:
    """
    Devuelve una lista con los nombres exactos de las columnas que tiene 
    una tabla física en la base de datos.
    """
    with connection.cursor() as cursor:
        descripcion = connection.introspection.get_table_description(cursor, tabla)
    return [columna.name for columna in descripcion]

def _identificador_sql(nombre: str) -> str:
    """
    Filtro de seguridad vital. Valida que el nombre de una tabla o columna solo
    contenga letras, números o barras bajas. Previene ataques de inyección SQL.
    """
    if not re.match(r"^[A-Za-z_][A-Za-z0-9_]*$", nombre):
        raise ValueError(f"Nombre inválido: {nombre}")
    return nombre

def _normalizar_bool(x):
    """
    Limpia e interpreta valores que provienen de Excel y que deberían ser booleanos (True/False).
    Maneja diferentes formatos escritos por usuarios humanos (sí, yes, 1, 0, etc.).
    """
    if pd.isna(x): return None
    if isinstance(x, bool): return x
    s = str(x).strip().lower()
    if s in {"true", "1", "yes", "y", "si", "sí"}: return True
    if s in {"false", "0", "no", "n"}: return False
    return x

def _a_valor_bd(v):
    """
    Convierte los tipos de datos nulos de Pandas/Numpy (NaN, NaT, pd.NA) 
    a un objeto 'None' nativo de Python para que Django/SQL los guarde como 'NULL' correctamente.
    """
    if v is None or pd.isna(v) or (isinstance(v, float) and pd.isna(v)):
        return None
    return v


def servicio_exportar_base_datos(parametro_entidad: str) -> io.BytesIO:
    """Genera un Excel en memoria con los datos de las tablas solicitadas."""
    tablas_objetivo = _resolver_tablas(parametro_entidad)
    dependencias = _obtener_dependencias_fk(tablas_objetivo)
    orden_exportacion = _orden_topologico(dependencias)

    buffer_memoria = io.BytesIO()
    with pd.ExcelWriter(buffer_memoria, engine="openpyxl") as escritor:
        for tabla in orden_exportacion:
            with connection.cursor() as cursor:
                cursor.execute(f"SELECT * FROM {_identificador_sql(tabla)};")
                columnas = [col[0] for col in cursor.description]
                filas = cursor.fetchall()

            df = pd.DataFrame(filas, columns=columnas)
            df.to_excel(escritor, sheet_name=tabla, index=False)

    buffer_memoria.seek(0)
    return buffer_memoria


def servicio_plantilla_base_datos(parametro_entidad: str) -> io.BytesIO:
    """Genera un Excel vacío solo con las cabeceras/columnas de las tablas."""
    tablas_objetivo = _resolver_tablas(parametro_entidad)
    dependencias = _obtener_dependencias_fk(tablas_objetivo)
    orden_exportacion = _orden_topologico(dependencias)

    buffer_memoria = io.BytesIO()
    with pd.ExcelWriter(buffer_memoria, engine="openpyxl") as escritor:
        for tabla in orden_exportacion:
            columnas = _obtener_columnas_tabla(tabla)
            df = pd.DataFrame(columns=columnas)
            df.to_excel(escritor, sheet_name=tabla, index=False)

    buffer_memoria.seek(0)
    return buffer_memoria


def servicio_importar_base_datos(archivo_obj, parametro_entidad: str) -> None:
    """Procesa el Excel, vacía las tablas correspondientes e inserta los nuevos datos."""
    tablas_objetivo = _resolver_tablas(parametro_entidad)
    excel = pd.ExcelFile(archivo_obj)
    nombres_hojas = set(excel.sheet_names)

    dependencias = _obtener_dependencias_fk(tablas_objetivo)
    orden_insercion = _orden_topologico(dependencias)
    orden_borrado = list(reversed(orden_insercion))

    tablas_en_excel = [t for t in orden_insercion if t in nombres_hojas]

    with transaction.atomic():
        with connection.cursor() as cursor:
            try:
                cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")
                
                # 1) Borrado secuencial (Hijas primero)
                for tabla in orden_borrado:
                    if tabla in nombres_hojas:
                        cursor.execute(f"DELETE FROM {_identificador_sql(tabla)};")
                
                # 2) Inserción (Padres primero)
                for tabla in tablas_en_excel:
                    df = excel.parse(tabla)
                    df = df.replace({pd.NA: None}).where(pd.notnull(df), None)

                    if df.empty:
                        continue

                    columnas_bd = _obtener_columnas_tabla(tabla)
                    columnas_excel = list(df.columns)

                    desconocidas = [c for c in columnas_excel if c not in columnas_bd]
                    if desconocidas:
                        raise ValueError(f"Columnas no existentes en la BD para la hoja '{tabla}': {desconocidas}")

                    campos_booleanos = {"ALTAVOCES", "PROYECTOR", "CAMARAS", "ENCHUFES", 
                                        "IS_ACTIVE", "IS_STAFF", "IS_SUPERUSER"}
                    
                    for columna in columnas_excel:
                        if columna.upper() in campos_booleanos:
                            df[columna] = df[columna].map(_normalizar_bool)

                    columnas_sql = ", ".join(_identificador_sql(c) for c in columnas_excel)
                    marcadores = ", ".join(["%s"] * len(columnas_excel))
                    sql = f"INSERT INTO {_identificador_sql(tabla)} ({columnas_sql}) VALUES ({marcadores})"

                    filas = [tuple(_a_valor_bd(registro[c]) for c in columnas_excel) for registro in df.to_dict('records')]
                    cursor.executemany(sql, filas)

            finally:
                cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")