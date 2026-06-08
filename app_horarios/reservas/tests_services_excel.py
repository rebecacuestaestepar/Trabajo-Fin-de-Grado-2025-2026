from django.test import TestCase
from datetime import date
from .excel_parser import Clase
from .services_excel import generar_reservas_periodicas
from calendario.models import Curso, Semestre, Dia, Lectivo, Festivo, CambioDocencia
from docencia.models import Grado, Asignaturas, Grupo
from aulas.models import Aula
from reservas.models import Reserva, ReservaPeriodica

class GeneradorReservasTests(TestCase):

    def setUp(self):
        # 1. Calendario
        self.curso = Curso.objects.create(idcurso="2025-2026", fecha_inicio=date(2025, 9, 1), fecha_fin=date(2026, 7, 31))
        
        # Semestre 1 (Asignaturas impares)
        self.semestre1 = Semestre.objects.create(
            idsemestre="S1", curso_id=self.curso, numero=1, 
            fecha_inicio=date(2025, 9, 8), fecha_fin=date(2025, 9, 14)
        )
        # Semestre 2 (Asignaturas pares)
        self.semestre2 = Semestre.objects.create(
            idsemestre="S2", curso_id=self.curso, numero=2, 
            fecha_inicio=date(2026, 2, 1), fecha_fin=date(2026, 2, 7)
        )

        # Días de la semana del Semestre 1 (Septiembre)
        self.lunes_lectivo = Dia.objects.create(dia=date(2025, 9, 8), id_semestre=self.semestre1, dia_semana=1)
        Lectivo.objects.create(id_dia=self.lunes_lectivo)

        self.martes_festivo = Dia.objects.create(dia=date(2025, 9, 9), id_semestre=self.semestre1, dia_semana=2)
        Festivo.objects.create(id_dia=self.martes_festivo, nombre="Fiesta", alcance="LOCAL")

        self.miercoles_cambio = Dia.objects.create(dia=date(2025, 9, 10), id_semestre=self.semestre1, dia_semana=3)
        CambioDocencia.objects.create(id_dia=self.miercoles_cambio, sustituye_dia=1) # El miércoles funcionará como un lunes

        # 2. Infraestructura y Docencia
        self.aula = Aula.objects.create(nombre="51-A1", capacidad=50) # Coincide con limpiar_nombre_aula("Aula 51"-A1)
        self.grado = Grado.objects.create(idgrado="GII", nombre="Info", abreviatura="GII")
        
        # Asignatura de Semestre 1 (impar)
        self.asignatura = Asignaturas.objects.create(
            idasignatura="8797", nombre="Álgebra", abreviatura="ALG",
            curso_grado=1, semestre_academico=1, ects=6, grado_id=self.grado
        )

    def test_generar_reservas_flujo_normal_y_creacion_de_grupos(self):
        # Simulamos que el parser leyó esta clase del Excel
        clase_excel = Clase(
            asig="ALG", cod_asig="8797", grupo="1", aula="Aula 51-A1", 
            hora_inicio="09:00:00", hora_fin="11:00:00", dia="LUNES", tipo="T"
        )

        # Ejecutamos la función
        generar_reservas_periodicas([clase_excel], "2025-2026")

        # Comprobaciones
        # 1. ¿Marcó el curso como cargado?
        self.curso.refresh_from_db()
        self.assertTrue(self.curso.horario_cargado)

        # 2. ¿Creó el Grupo que no existía?
        grupo_bd = Grupo.objects.filter(id_asignatura=self.asignatura, nombre="1").first()
        self.assertIsNotNone(grupo_bd, "Debería haber creado el grupo '1'")

        # 3. Comprueba que creó la reserva el lunes 8 de septiembre (día lectivo) con la hora correcta
        reserva_lunes = Reserva.objects.filter(id_dia=self.lunes_lectivo).first()
        self.assertIsNotNone(reserva_lunes)
        self.assertEqual(str(reserva_lunes.hora_inicio), "09:00:00")

        # 4. ¿Ignoró el festivo y procesó el Cambio de Docencia?
        # En nuestro setup, el miércoles 10 sustituye al Lunes. Debería haber una reserva el miércoles.
        reserva_cambio = Reserva.objects.filter(id_dia=self.miercoles_cambio).first()
        self.assertIsNotNone(reserva_cambio, "No creó reserva en el día con Cambio de Docencia")

    def test_generar_reservas_ignora_aula_inexistente(self):
        # Clase con un aula que no existe en la base de datos
        clase_fantasma = Clase(
            asig="ALG", cod_asig="8797", grupo="1", aula="Aula Inexistente", 
            hora_inicio="09:00:00", hora_fin="11:00:00", dia="LUNES", tipo="T"
        )
        
        generar_reservas_periodicas([clase_fantasma], "2025-2026")
        
        # No debió crear ninguna reserva
        self.assertEqual(Reserva.objects.count(), 0)