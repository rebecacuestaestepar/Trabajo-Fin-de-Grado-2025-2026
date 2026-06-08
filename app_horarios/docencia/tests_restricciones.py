from django.test import TestCase
from datetime import date, time
from docencia.models import Grado, Asignaturas, Grupo
from aulas.models import Aula
from calendario.models import Dia
from reservas.models import Reserva, ReservaPeriodica

from .restricciones import validar_ocupacion_aula, validar_solapamiento_grupos

class RestriccionesServicesTests(TestCase):

    def setUp(self):
        # 1. Calendario básico
        self.dia = Dia.objects.create(dia=date(2025, 9, 8), dia_semana=1)
        
        # 2. Datos de docencia
        self.grado = Grado.objects.create(idgrado="187", nombre="Ing Informática", abreviatura="GII")
        self.asignatura = Asignaturas.objects.create(
            idasignatura="8797", nombre="Álgebra", abreviatura="ALG",
            curso_grado=1, semestre_academico=1, ects=6, grado_id=self.grado
        )
        self.grupo = Grupo.objects.create(nombre="101", id_asignatura=self.asignatura)
        
        # 3. Datos de reservas
        self.aula = Aula.objects.create(nombre="51-A1", capacidad=50)
        
        # Fechas de semestre simuladas
        self.f_inicio_sem = date(2025, 9, 1)
        self.f_fin_sem = date(2026, 1, 31)

        # RESERVA BASE PARA LOS TESTS
        # Esta reserva ocupa el aula "51-A1" con el grupo "101" 
        # Los LUNES (dia_semana=1) de 09:00 a 11:00
        self.reserva = Reserva.objects.create(
            id_aula=self.aula, id_dia=self.dia, estado='A', tipo='R',
            hora_inicio=time(9, 0), hora_fin=time(11, 0)
        )
        self.rp = ReservaPeriodica.objects.create(
            id_reserva=self.reserva, id_grupo=self.grupo, dia_semana=1,
            fecha_inicio=self.f_inicio_sem, fecha_fin=self.f_fin_sem,
            intervalo_semanas=1
        )

    # ==========================================
    # TESTS PARA: validar_ocupacion_aula
    # ==========================================
    def test_aula_sin_aula_o_none(self):
        # Caso 1: String "Sin aula"
        valido, msg = validar_ocupacion_aula(
            "Sin aula", time(9, 0), time(11, 0), [], 1, self.f_inicio_sem, self.f_fin_sem
        )
        self.assertTrue(valido)
        self.assertEqual(msg, "")

        # Caso 2: None
        valido_none, msg_none = validar_ocupacion_aula(
            None, time(9, 0), time(11, 0), [], 1, self.f_inicio_sem, self.f_fin_sem
        )
        self.assertTrue(valido_none)

    def test_aula_ocupada_conflicto(self):
        # Intento de reserva en horario solapado (10:00 a 12:00 choca con 09:00 a 11:00)
        valido, msg = validar_ocupacion_aula(
            self.aula.id, time(10, 0), time(12, 0), [], 1, self.f_inicio_sem, self.f_fin_sem
        )
        self.assertFalse(valido)
        self.assertEqual(msg, "El aula seleccionada ya está ocupada en ese horario.")

    def test_aula_ocupada_pero_excluida(self):
        # Mismo solapamiento, pero excluyendo la reserva conflictiva (Ej: al editar)
        valido, msg = validar_ocupacion_aula(
            self.aula.id, time(10, 0), time(12, 0), [self.reserva.idreserva], 1, self.f_inicio_sem, self.f_fin_sem
        )
        self.assertTrue(valido)
        self.assertEqual(msg, "")

    def test_aula_libre_por_horario(self):
        # Horario diferente en el mismo día (11:00 a 13:00 NO choca con 09:00 a 11:00)
        valido, msg = validar_ocupacion_aula(
            self.aula.id, time(11, 0), time(13, 0), [], 1, self.f_inicio_sem, self.f_fin_sem
        )
        self.assertTrue(valido)
        self.assertEqual(msg, "")

    def test_aula_libre_por_dia(self):
        # Mismo horario conflictivo pero diferente día (Martes = 2)
        valido, msg = validar_ocupacion_aula(
            self.aula.id, time(9, 0), time(11, 0), [], 2, self.f_inicio_sem, self.f_fin_sem
        )
        self.assertTrue(valido)
        self.assertEqual(msg, "")


    # ==========================================
    # TESTS PARA: validar_solapamiento_grupos
    # ==========================================
    def test_grupo_solapado_conflicto(self):
        # Intento de añadirle clase al grupo 101 cuando ya tiene clase (solapa de 09:30 a 10:30)
        valido, msg = validar_solapamiento_grupos(
            "187", 1, "101", time(9, 30), time(10, 30), 1, [], self.f_inicio_sem, self.f_fin_sem
        )
        self.assertFalse(valido)
        self.assertEqual(msg, "El grupo '101' ya tiene otra docencia en este horario.")

    def test_grupo_solapado_pero_excluido(self):
        # Mismo caso de conflicto, pero excluyendo la reserva original
        valido, msg = validar_solapamiento_grupos(
            "187", 1, "101", time(9, 30), time(10, 30), 1, [self.reserva.idreserva], self.f_inicio_sem, self.f_fin_sem
        )
        self.assertTrue(valido)
        self.assertEqual(msg, "")

    def test_grupo_libre_por_horario(self):
        # Horario diferente para el grupo 101
        valido, msg = validar_solapamiento_grupos(
            "187", 1, "101", time(15, 0), time(17, 0), 1, [], self.f_inicio_sem, self.f_fin_sem
        )
        self.assertTrue(valido)
        self.assertEqual(msg, "")

    def test_grupo_libre_no_coincide_semestre_o_grado(self):
        # Si la validación se dispara para otro semestre (ej. Semestre 2) o grupo, no debe detectar conflicto
        valido, msg = validar_solapamiento_grupos(
            "187", 2, "101", time(9, 0), time(11, 0), 1, [], self.f_inicio_sem, self.f_fin_sem
        )
        self.assertTrue(valido)
        self.assertEqual(msg, "")