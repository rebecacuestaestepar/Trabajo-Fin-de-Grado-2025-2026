from django.test import TestCase
from decimal import Decimal
from datetime import date, time, timedelta
from docencia.models import Grado, Asignaturas, Grupo, Docente
from aulas.models import Aula
from calendario.models import Curso, Semestre, Dia, Lectivo, CambioDocencia
from reservas.models import Reserva, ReservaPeriodica
from .services_periodicas import (
    obtener_grados, obtener_cursos_grado, obtener_semestres_por_grado_semestre,
    obtener_asignaturas_por_grado_curso_semestre, obtener_grupos_asignatura,
    obtener_aulas_libres, crear_reserva_periodica, obtener_datos_reserva_periodica,
    reserva_desde_horario_grado, eliminar_reserva_periodica
)

class ReservasPeriodicasDocenciaServicesTests(TestCase):

    def setUp(self):
        # 1. Configuración de Aulas
        self.aula1 = Aula.objects.create(nombre="A1", capacidad=50, num_ordenadores=0)
        self.aula_cero = Aula.objects.create(nombre="Aula 0", capacidad=0, num_ordenadores=0) # Para testear la exclusión
        
        # 2. Configuración de Docencia
        self.grado = Grado.objects.create(idgrado="123", nombre="Grado Test", abreviatura="GT")
        self.asignatura = Asignaturas.objects.create(
            idasignatura="TEST_A", nombre="Asig Test", abreviatura="AT",
            curso_grado=1, semestre_academico=1, ects=6, grado_id=self.grado
        )
        self.grupo = Grupo.objects.create(nombre="G1", id_asignatura=self.asignatura)

        # 3. Configuración de Calendario
        self.curso = Curso.objects.create(
            idcurso="2025-2026", fecha_inicio=date(2025, 9, 1), fecha_fin=date(2026, 7, 31)
        )
        self.semestre1 = Semestre.objects.create(
            idsemestre="S1", curso_id=self.curso, numero=1, 
            fecha_inicio=date(2025, 9, 8), fecha_fin=date(2025, 9, 10) # Semestre corto para testear rápido
        )
        self.semestre2 = Semestre.objects.create(
            idsemestre="S2", curso_id=self.curso, numero=2, 
            fecha_inicio=date(2026, 2, 1), fecha_fin=date(2026, 2, 5)
        )

        # Días del semestre 1
        self.dia1 = Dia.objects.create(dia=date(2025, 9, 8), id_semestre=self.semestre1, dia_semana=1) # Lunes
        self.dia2 = Dia.objects.create(dia=date(2025, 9, 9), id_semestre=self.semestre1, dia_semana=2) # Martes
        self.dia3 = Dia.objects.create(dia=date(2025, 9, 10), id_semestre=self.semestre1, dia_semana=3) # Miércoles

        # Lectivos (Lunes y Miércoles son lectivos, Martes no)
        Lectivo.objects.create(id_dia=self.dia1)
        Lectivo.objects.create(id_dia=self.dia3)

        # Cambio de docencia: El martes actuará como si fuera un lunes (1)
        CambioDocencia.objects.create(id_dia=self.dia2, sustituye_dia=1)

    def test_obtener_grados(self):
        grados = obtener_grados()
        self.assertTrue(any(g['idgrado'] == '123' for g in grados))

    def test_obtener_cursos_grado(self):
        cursos = obtener_cursos_grado('123')
        self.assertIn(1, cursos)

    def test_obtener_semestres_por_grado_semestre(self):
        semestres = obtener_semestres_por_grado_semestre('123', 1)
        self.assertIn(1, semestres)

    def test_obtener_asignaturas_por_grado_curso_semestre(self):
        asignaturas = obtener_asignaturas_por_grado_curso_semestre(1, '123', 1)
        self.assertTrue(any(a['idasignatura'] == 'TEST_A' for a in asignaturas))

    def test_obtener_grupos_asignatura(self):
        grupos = obtener_grupos_asignatura('TEST_A')
        self.assertTrue(any(g['nombre'] == 'G1' for g in grupos))

    def test_obtener_aulas_libres(self):
        # Creamos una reserva para ocupar aula1 el Lunes de 10 a 12
        reserva = Reserva.objects.create(
            id_aula=self.aula1, id_dia=self.dia1, estado='A', tipo='R',
            hora_inicio=time(10, 0), hora_fin=time(12, 0)
        )
        ReservaPeriodica.objects.create(
            id_reserva=reserva, id_grupo=self.grupo, dia_semana=1,
            fecha_inicio=date(2025, 9, 8), fecha_fin=date(2025, 9, 10), intervalo_semanas=1
        )

        aulas = obtener_aulas_libres(1, time(10, 30), time(11, 30)) # Solapa
        nombres_aulas = [a['nombre'] for a in aulas]
        
        # Aula 1 no debe estar porque está ocupada
        self.assertNotIn("A1", nombres_aulas)
        # Aula 0 no debe estar porque se excluye explícitamente en la query
        self.assertNotIn("Aula 0", nombres_aulas)

    def test_crear_reserva_periodica_semestre_impar(self):
        # Prueba creando para el semestre 1 (impar). Debería usar Lunes (dia 1).
        # Hay un día lectivo normal el Lunes, y un martes que sustituye al lunes.
        datos = {
            'dia_semana': 1,
            'id_grupo': self.grupo.grupoid,
            'id_aula': "A1",
            'hora_inicio': time(9, 0),
            'hora_fin': time(11, 0)
        }
        crear_reserva_periodica("2025-2026", 1, datos)
        
        # Deberían haberse creado 2 reservas físicas: una el día 8 (Lunes lectivo) y otra el día 9 (Martes sustituye a lunes)
        reservas_creadas = ReservaPeriodica.objects.filter(id_grupo=self.grupo)
        self.assertEqual(reservas_creadas.count(), 2)

    def test_crear_reserva_periodica_semestre_par(self):
        # Prueba la rama del if semestre_num % 2 == 1 para forzar semestre 2
        datos = {
            'dia_semana': 2,
            'id_grupo': self.grupo.grupoid,
            'id_aula': "A1",
            'hora_inicio': time(9, 0),
            'hora_fin': time(11, 0)
        }
        crear_reserva_periodica("2025-2026", 2, datos)
        # Como no hay días configurados para el semestre 2 en el setUp que coincidan, 
        # solo verificamos que no lance error y pase por la lógica correcta.
        reservas_creadas = ReservaPeriodica.objects.filter(id_grupo=self.grupo)
        self.assertEqual(reservas_creadas.count(), 0)

    def test_obtener_datos_reserva_periodica_exito(self):
        reserva = Reserva.objects.create(
            id_aula=self.aula1, id_dia=self.dia1, estado='A', tipo='R',
            hora_inicio=time(10, 0), hora_fin=time(12, 0)
        )
        rp = ReservaPeriodica.objects.create(
            id_reserva=reserva, id_grupo=self.grupo, dia_semana=1,
            fecha_inicio=self.semestre1.fecha_inicio, fecha_fin=self.semestre1.fecha_fin, intervalo_semanas=1
        )
        
        datos = obtener_datos_reserva_periodica(reserva.pk)
        
        self.assertIsNotNone(datos)
        self.assertEqual(datos['aula'], "A1")
        self.assertEqual(datos['curso_academico'], "2025-2026")
        self.assertEqual(datos['hora_inicio'], "10:00")

    def test_obtener_datos_reserva_periodica_no_existe(self):
        datos = obtener_datos_reserva_periodica(99999)
        self.assertIsNone(datos)

    def test_reserva_desde_horario_grado(self):
        datos = reserva_desde_horario_grado('123', 1)
        self.assertEqual(datos['grado']['nombre'], "Grado Test")
        self.assertEqual(datos['curso'], 1)
        self.assertEqual(len(datos['asignaturas']), 1)

    def test_eliminar_reserva_periodica_firma_invalida(self):
        resultado = eliminar_reserva_periodica("2025-2026", 1, "firma_mala")
        self.assertFalse(resultado['exito'])
        self.assertEqual(resultado['mensaje'], "Firma inválida.")

    def test_eliminar_reserva_periodica_semestre_no_encontrado(self):
        firma = f"TEST_A|{self.grupo.grupoid}|1|10:00:00|12:00:00|{self.aula1.id}"
        resultado = eliminar_reserva_periodica("INVENTADO", 1, firma)
        self.assertFalse(resultado['exito'])
        self.assertEqual(resultado['mensaje'], "Semestre no encontrado.")

    def test_eliminar_reserva_periodica_reservas_no_existen(self):
        firma = f"TEST_A|{self.grupo.grupoid}|1|10:00:00|12:00:00|{self.aula1.id}"
        resultado = eliminar_reserva_periodica("2025-2026", 1, firma)
        self.assertFalse(resultado['exito'])
        self.assertEqual(resultado['mensaje'], "No se encontraron las reservas a eliminar.")

    def test_eliminar_reserva_periodica_exito(self):
        reserva = Reserva.objects.create(
            id_aula=self.aula1, id_dia=self.dia1, estado='A', tipo='R',
            hora_inicio=time(10, 0), hora_fin=time(12, 0)
        )
        rp = ReservaPeriodica.objects.create(
            id_reserva=reserva, id_grupo=self.grupo, dia_semana=1,
            fecha_inicio=self.semestre1.fecha_inicio, fecha_fin=self.semestre1.fecha_fin, intervalo_semanas=1
        )
        
        firma = f"TEST_A|{self.grupo.grupoid}|1|10:00:00|12:00:00|{self.aula1.id}"
        resultado = eliminar_reserva_periodica("2025-2026", 1, firma) # 1 impar => Semestre 1
        
        self.assertTrue(resultado['exito'])
        # Verificar que se borró la reserva física de la BD
        self.assertFalse(Reserva.objects.filter(pk=reserva.pk).exists())
        self.assertFalse(ReservaPeriodica.objects.filter(pk=rp.pk).exists())

    def test_eliminar_reserva_periodica_semestre_par(self):
        # Verifica la lógica de asignación a semestre=2 si el semestre_num es par
        # Creamos una firma con datos falsos solo para pasar la validación y testear el fallo posterior
        firma = f"TEST_A|{self.grupo.grupoid}|1|10:00:00|12:00:00|{self.aula1.id}"
        resultado = eliminar_reserva_periodica("2025-2026", 2, firma) # 2 par => Semestre 2
        # Fallará en "No se encontraron las reservas", pero sabemos que pasó la lógica de semestre
        self.assertFalse(resultado['exito'])