from .restricciones import validar_ocupacion_aula, validar_solapamiento_grupos
from docencia.models import Asignaturas, Grado
from calendario.models import CambioDocencia, Curso, Dia, Lectivo, Semestre
from reservas.models import Reserva, ReservaPeriodica
from datetime import timedelta
from django.db import transaction
from .utils import calcular_nuevas_fechas

def obtener_cursos_con_horario():
    """Obtiene los cursos académicos que tienen el horario cargado, ordenados de forma descendente por su identificador."""
    return Curso.objects.filter(horario_cargado=True).order_by('-idcurso')

def obtener_grados_con_horario(curso):
    """Obtiene los grados académicos que tienen asignaturas con grupos que a su vez tienen reservas periódicas dentro del rango de fechas del curso académico dado."""
    return Grado.objects.filter(
        asignaturas__grupo__reservaperiodica__fecha_inicio__gte=curso.fecha_inicio,
        asignaturas__grupo__reservaperiodica__fecha_inicio__lte=curso.fecha_fin
    ).distinct().order_by('nombre')

def obtener_semestres_por_grado(id_grado):
    """Obtiene los semestres académicos disponibles para un grado específico, basándose en las asignaturas que pertenecen a ese grado."""
    semestres = (
        Asignaturas.objects.filter(grado_id=id_grado)
        .values_list('semestre_academico', flat=True)
        .distinct()
        .order_by('semestre_academico')
    )

    return [int(semestre) for semestre in semestres if semestre is not None]


def obtener_asignaturas_por_grado_y_semestre(id_curso, id_grado, semestre_academico):
    """Obtiene las reservas periódicas de docencia para un grado y semestre académico específicos, dentro del rango de fechas del curso académico dado. Devuelve una lista de diccionarios con información relevante de cada reserva."""

    semestre = 2
    if semestre_academico % 2 == 1:
        semestre = 1

    semestre_obj = Semestre.objects.filter(curso_id=id_curso, numero=semestre).first()

    if not semestre_obj:
        return []
    
    reservas = ReservaPeriodica.objects.select_related(
        'id_reserva',
        'id_reserva__id_aula',
        'id_grupo',
        'id_grupo__id_asignatura',
    ).filter(
        id_grupo__id_asignatura__grado_id=id_grado,
        id_grupo__id_asignatura__semestre_academico=semestre_academico,
        fecha_inicio__gte=semestre_obj.fecha_inicio,
        fecha_fin__lte=semestre_obj.fecha_fin,
    )

    reservas_unicas = []
    vistos = set()

    for r in reservas:
        asignatura_nombre = r.id_grupo.id_asignatura.nombre
        asignatura_id = r.id_grupo.id_asignatura.idasignatura
        asignatura_abreviatura = r.id_grupo.id_asignatura.abreviatura
        grupo_id = r.id_grupo.grupoid
        aula_id = r.id_reserva.id_aula.id if r.id_reserva.id_aula else "Sin aula"
        dia_semana = r.dia_semana
        hora_inicio = r.id_reserva.hora_inicio.strftime("%H:%M")
        hora_fin = r.id_reserva.hora_fin.strftime("%H:%M")
        grupo_nombre = r.id_grupo.nombre
        aula_nombre = r.id_reserva.id_aula.nombre if r.id_reserva.id_aula else "Sin aula"

        distint = f"{asignatura_id}|{grupo_id}|{dia_semana}|{hora_inicio}|{hora_fin}|{aula_id}"

        if distint not in vistos:
            vistos.add(distint)
            reserva_dict = {
                "id_reserva": r.id_reserva.idreserva,
                "asignatura_id": asignatura_id,
                "asignatura_nombre": asignatura_nombre,
                "asignatura_abreviatura": asignatura_abreviatura,
                "grupo_id": grupo_id,
                "grupo_nombre": grupo_nombre,
                "aula_id": aula_id,
                "aula_nombre": aula_nombre,
                "dia_semana": dia_semana,
                "hora_inicio": hora_inicio,
                "hora_fin": hora_fin,
                "distint": distint
            }
            reservas_unicas.append(reserva_dict)

    return reservas_unicas

def validar_restricciones_movimiento(id_curso, semestre_num, id_grado, datos_movimiento):
    """Valida las restricciones para mover una serie de reservas periódicas de docencia, verificando la ocupación del aula y el solapamiento de grupos en el nuevo horario propuesto."""
    distint = datos_movimiento['firma_serie']
    nuevo_dia = datos_movimiento['nuevo_dia']
    n_inicio = datos_movimiento['nueva_hora_inicio']
    n_fin = datos_movimiento['nueva_hora_fin']

    try:
        asignatura_id, grupo_id, old_dia, old_hi, old_hf, aula_id = distint.split('|')
    except ValueError:
        return {"exito": False, "motivos": ["Firma del evento inválida."]}
    
    semestre_real = 1 if semestre_num % 2 == 1 else 2
    semestre_obj = Semestre.objects.filter(curso_id=id_curso, numero=semestre_real).first()

    if not semestre_obj:
        return {"exito": False, "motivos": ["No se encontró el semestre académico."]}
    
    reservas_actuales = ReservaPeriodica.objects.filter(
        id_grupo__id_asignatura__idasignatura=asignatura_id,
        id_grupo__grupoid=grupo_id,
        dia_semana=old_dia,
        id_reserva__hora_inicio=old_hi
    )
    
    ids_excluir = list(reservas_actuales.values_list('id_reserva_id', flat=True))

    nombre_grupo = reservas_actuales.first().id_grupo.nombre

    motivos_bloqueo = []

    aula_ok, msg_aula = validar_ocupacion_aula(
        aula_id, n_inicio, n_fin, ids_excluir, nuevo_dia, semestre_obj.fecha_inicio, semestre_obj.fecha_fin
    )
    if not aula_ok: motivos_bloqueo.append(msg_aula)

    grupos_ok, msg_grupos = validar_solapamiento_grupos(
        id_grado, semestre_num, nombre_grupo, n_inicio, n_fin, nuevo_dia, ids_excluir, semestre_obj.fecha_inicio, semestre_obj.fecha_fin
    )
    if not grupos_ok: motivos_bloqueo.append(msg_grupos)

    return {"valido": len(motivos_bloqueo) == 0, "motivos": motivos_bloqueo}



def mover_serie_reservas(id_curso, semestre_num, datos_movimiento):
    """Realiza el movimiento de una serie de reservas periódicas de docencia a un nuevo horario, actualizando las fechas y horas de las reservas afectadas. Se asume que las restricciones ya han sido validadas antes de llamar a esta función."""
    distint = datos_movimiento['firma_serie']
    nuevo_dia = datos_movimiento['nuevo_dia']
    n_inicio = datos_movimiento['nueva_hora_inicio']
    n_fin = datos_movimiento['nueva_hora_fin']

    with transaction.atomic():

        try:
            asignatura_id, grupo_id, old_dia, old_hi, old_hf, aula_id = distint.split('|')
        except ValueError:
            return {"exito": False, "estado": "error", "mensaje": "Firma inválida."}
        
        semestre = 2
        if semestre_num % 2 == 1:
            semestre = 1

        semestre_obj = Semestre.objects.filter(curso_id=id_curso, numero=semestre).first()

        if not semestre_obj:
            return {"exito": False, "estado": "error", "mensaje": "Semestre no encontrado."}

        reservas_actuales = ReservaPeriodica.objects.select_related(
            'id_reserva',
            'id_grupo',
            'id_grupo__id_asignatura',
            'id_reserva__id_aula',
        ).filter(
            id_grupo__id_asignatura__idasignatura=asignatura_id,
            id_grupo__grupoid=grupo_id,
            dia_semana=old_dia,
            id_reserva__hora_inicio=old_hi,
            id_reserva__hora_fin=old_hf,
            fecha_inicio__gte=semestre_obj.fecha_inicio,
            fecha_fin__lte=semestre_obj.fecha_fin,
        )

        if not reservas_actuales.exists():
            return {"exito": False, "estado": "error", "mensaje": "No se encontraron las reservas a mover."}

        aula = reservas_actuales.first().id_reserva.id_aula
        ids_reservas_originales = [r.id_reserva.idreserva for r in reservas_actuales]

        fecha_inicio_semestre = semestre_obj.fecha_inicio
        fecha_fin_semestre = semestre_obj.fecha_fin

        dia_actual = fecha_inicio_semestre

        nuevas_fechas = calcular_nuevas_fechas(semestre_obj, nuevo_dia, int(old_dia), reservas_actuales)

        reservas_actuales.update(dia_semana=nuevo_dia)

        for id_reserva, nueva_fecha in zip(ids_reservas_originales, nuevas_fechas):
            reserva = Reserva.objects.get(idreserva=id_reserva)
            reserva.fecha = nueva_fecha
            reserva.hora_inicio = n_inicio
            reserva.hora_fin = n_fin
            reserva.save()



