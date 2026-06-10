import os
import re
from django.conf import settings
from django.test.runner import DiscoverRunner
from django.db import connection

class RawSQLTestRunner(DiscoverRunner):

    def setup_databases(self, **kwargs):
        """
        Configura las bases de datos temporales de prueba, inyectando el esquema 
        crudo contenido en el volcado SQL corporativo de la aplicación.
        """

        # Permitimos que Django cree la base de datos de pruebas base
        config = super().setup_databases(**kwargs)
        
        # Localización unificada del script SQL usando Pathlib de forma limpia
        ruta_sql = os.path.join(settings.BASE_DIR.parent, 'BaseDeDatosHorario.sql')

        print(f"\n[TestRunner] Buscando script SQL en: {ruta_sql}")

        if not os.path.exists(ruta_sql):
            raise FileNotFoundError(f"¡No se encontró el archivo SQL! Ruta buscada: {ruta_sql}")

        # Leemos el archivo
        with open(ruta_sql, 'r', encoding='utf-8') as f:
            sql_script = f.read()

        # Evitamos el problemas de mayúsculas y minúsculas
        sql_script = sql_script.lower()

        # Eliminamos comentarios multilínea y de una sola línea para evitar problemas al ejecutar
        sql_script = re.sub(r'/\*.*?\*/', '', sql_script, flags=re.DOTALL)
        sql_script = re.sub(r'--.*', '', sql_script)

        # Ejecutamos las consultas
        with connection.cursor() as cursor:
            # Separamos por ';' para ejecutar línea a línea
            for statement in sql_script.split(';'):
                clean_statement = statement.strip()
                if clean_statement:
                    try:
                        cursor.execute(clean_statement)
                    except Exception as e:
                        print(f"Error ejecutando: {clean_statement[:50]}...")
                        raise e

        print("[TestRunner] ¡Tablas creadas con éxito en test_horario_db!\n")
        return config