from django.test import TestCase
from unittest.mock import patch
from datetime import date, time
from docencia.models import Grado, Asignaturas, Grupo
from aulas.models import Aula
from calendario.models import Curso, Semestre, Dia
from reservas.models import Reserva, ReservaPeriodica

from docencia.services_horario import (
    obtener_cursos_con_horario,
    obtener_grados_con_horario,
    obtener_semestres_por_grado,
    obtener_asignaturas_por_grado_y_semestre,
    validar_restricciones_movimiento,
    mover_serie_reservas
)

class HorarioServicesTests(TestCase):

    def setUp(self):
        # 1. Calendario
        self.curso = Curso.objects.create(
            idcurso="2025-2026", fecha_inicio=date(2025, 9, 1), fecha_fin=date(2026, 7, 31),
            horario_cargado=True
        )
        self.curso_sin_horario = Curso.objects.create(
            idcurso="2026-2027", fecha_inicio=date(2026, 9, 1), fecha_fin=date(2027, 7, 31),
            horario_cargado=False
        )
        self.semestre1 = Semestre.objects.create(
            idsemestre="S1", curso_id=self.curso, numero=1, 
            fecha_inicio=date(2025, 9, 8), fecha_fin=date(2026, 1, 31)
        )
        self.dia = Dia.objects.create(dia=date(2025, 9, 8), id_semestre=self.semestre1, dia_semana=1)

        # 2. Docencia
        self.grado = Grado.objects.create(idgrado="281", nombre="Ing Informática", abreviatura="GII")
        self.asignatura = Asignaturas.objects.create(
            idasignatura="8797", nombre="Álgebra", abreviatura="ALG",
            curso_grado=1, semestre_academico=1, ects=6, grado_id=self.grado
        )
        self.grupo = Grupo.objects.create(nombre="A1", id_asignatura=self.asignatura)

        # 3. Reservas
        self.aula = Aula.objects.create(nombre="A-01", capacidad=50)
        self.reserva = Reserva.objects.create(
            id_aula=self.aula, id_dia=self.dia, estado='A', tipo='R',
            hora_inicio=time(9, 0), hora_fin=time(11, 0)
        )
        self.rp = ReservaPeriodica.objects.create(
            id_reserva=self.reserva, id_grupo=self.grupo, dia_semana=1,
            fecha_inicio=self.semestre1.fecha_inicio, fecha_fin=self.semestre1.fecha_fin,
            intervalo_semanas=1
        )

        # Firma válida para reutilizar en los tests
        # Formato: asignatura_id | grupo_id | old_dia | old_hi | old_hf | aula_id
        self.firma_valida = f"8797|{self.grupo.grupoid}|1|09:00:00|11:00:00|{self.aula.id}"

    # ==========================================
    # TESTS LECTURA BÁSICA
    # ==========================================
    def test_obtener_cursos_con_horario(self):
        cursos = obtener_cursos_con_horario()
        self.assertEqual(cursos.count(), 1)
        self.assertEqual(cursos.first().idcurso, "2025-2026")

    def test_obtener_grados_con_horario(self):
        grados = obtener_grados_con_horario(self.curso)
        self.assertEqual(grados.count(), 1)
        self.assertEqual(grados.first().idgrado, "281")

    def test_obtener_semestres_por_grado(self):
        semestres = obtener_semestres_por_grado("281")
        self.assertIn(1, semestres)

    # ==========================================
    # TESTS OBTENER ASIGNATURAS POR GRADO Y SEMESTRE
    # ==========================================
    def test_obtener_asignaturas_grado_semestre_no_existe(self):
        # Solicitamos un semestre que no está en la BD (ej. semestre 2 de este curso)
        resultado = obtener_asignaturas_por_grado_y_semestre("2025-2026", "281", 2)
        self.assertEqual(resultado, [])

    def test_obtener_asignaturas_grado_semestre_exito_y_duplicados(self):
        # Creamos una reserva periódica exacta a la del setUp para forzar que pase por 
        # la lógica de "if distint not in vistos" y no la añada dos veces.
        reserva2 = Reserva.objects.create(
            id_aula=self.aula, id_dia=self.dia, estado='A', tipo='R',
            hora_inicio=time(9, 0), hora_fin=time(11, 0)
        )
        ReservaPeriodica.objects.create(
            id_reserva=reserva2, id_grupo=self.grupo, dia_semana=1,
            fecha_inicio=self.semestre1.fecha_inicio, fecha_fin=self.semestre1.fecha_fin,
            intervalo_semanas=1
        )

        # Semestre 1 (impar) -> busca numero=1
        resultado = obtener_asignaturas_por_grado_y_semestre("2025-2026", "281", 1)
        
        # Aunque hay 2 reservas idénticas, debe devolver 1 solo diccionario único
        self.assertEqual(len(resultado), 1)
        self.assertEqual(resultado[0]['asignatura_nombre'], "Álgebra")
        self.assertEqual(resultado[0]['aula_nombre'], "A-01")


    # ==========================================
    # TESTS VALIDAR RESTRICCIONES
    # ==========================================
    def test_validar_restricciones_firma_invalida(self):
        datos = {"firma_serie": "firma_rota", "nuevo_dia": 2, "nueva_hora_inicio": "10:00", "nueva_hora_fin": "12:00"}
        res = validar_restricciones_movimiento("2025-2026", 1, "281", datos)
        self.assertFalse(res['exito'])
        self.assertIn("Firma del evento inválida.", res['motivos'])

    def test_validar_restricciones_semestre_no_existe(self):
        datos = {"firma_serie": self.firma_valida, "nuevo_dia": 2, "nueva_hora_inicio": "10:00", "nueva_hora_fin": "12:00"}
        res = validar_restricciones_movimiento("INVENTADO", 1, "281", datos)
        self.assertFalse(res['exito'])
        self.assertIn("No se encontró el semestre académico.", res['motivos'])

    @patch('docencia.services_horario.validar_solapamiento_grupos')
    @patch('docencia.services_horario.validar_ocupacion_aula')
    def test_validar_restricciones_fallan_ambas(self, mock_aula, mock_grupos):
        # Simulamos que ambas validaciones externas fallan
        mock_aula.return_value = (False, "Aula ocupada")
        mock_grupos.return_value = (False, "Grupo solapado")

        datos = {"firma_serie": self.firma_valida, "nuevo_dia": 2, "nueva_hora_inicio": "10:00", "nueva_hora_fin": "12:00"}
        res = validar_restricciones_movimiento("2025-2026", 1, "281", datos)
        
        self.assertFalse(res['valido'])
        self.assertEqual(len(res['motivos']), 2)
        self.assertIn("Aula ocupada", res['motivos'])

    @patch('docencia.services_horario.validar_solapamiento_grupos')
    @patch('docencia.services_horario.validar_ocupacion_aula')
    def test_validar_restricciones_exito(self, mock_aula, mock_grupos):
        # Simulamos que ambas validaciones externas son exitosas
        mock_aula.return_value = (True, "")
        mock_grupos.return_value = (True, "")

        datos = {"firma_serie": self.firma_valida, "nuevo_dia": 2, "nueva_hora_inicio": "10:00", "nueva_hora_fin": "12:00"}
        res = validar_restricciones_movimiento("2025-2026", 1, "281", datos)
        
        self.assertTrue(res['valido'])
        self.assertEqual(len(res['motivos']), 0)


    # ==========================================
    # TESTS MOVER SERIE RESERVAS
    # ==========================================
    def test_mover_serie_firma_invalida(self):
        datos = {"firma_serie": "firma_rota", "nuevo_dia": 2, "nueva_hora_inicio": "10:00", "nueva_hora_fin": "12:00"}
        res = mover_serie_reservas("2025-2026", 1, datos)
        self.assertFalse(res['exito'])
        self.assertEqual(res['mensaje'], "Firma inválida.")

    def test_mover_serie_semestre_no_existe(self):
        datos = {"firma_serie": self.firma_valida, "nuevo_dia": 2, "nueva_hora_inicio": "10:00", "nueva_hora_fin": "12:00"}
        res = mover_serie_reservas("INVENTADO", 1, datos)
        self.assertFalse(res['exito'])
        self.assertEqual(res['mensaje'], "Semestre no encontrado.")

    def test_mover_serie_sin_reservas_actuales(self):
        # Cambiamos un dato de la firma para que el filter() no encuentre nada
        firma_vacia = f"9999|{self.grupo.grupoid}|1|09:00:00|11:00:00|{self.aula.id}"
        datos = {"firma_serie": firma_vacia, "nuevo_dia": 2, "nueva_hora_inicio": "10:00", "nueva_hora_fin": "12:00"}
        res = mover_serie_reservas("2025-2026", 1, datos)
        self.assertFalse(res['exito'])
        self.assertEqual(res['mensaje'], "No se encontraron las reservas a mover.")

    @patch('docencia.services_horario.calcular_nuevas_fechas')
    def test_mover_serie_exito(self, mock_nuevas_fechas):
        # Simulamos que la función devuelve la fecha de hoy
        mock_nuevas_fechas.return_value = [date(2025, 9, 9)]

        datos = {
            "firma_serie": self.firma_valida, 
            "nuevo_dia": 2, 
            "nueva_hora_inicio": "10:00:00", 
            "nueva_hora_fin": "12:00:00"
        }
        # Por lo tanto, comprobaremos el impacto en la Base de Datos.
        mover_serie_reservas("2025-2026", 1, datos)
        
        # 1. Comprobar que la Reserva Periodica cambió de dia
        self.rp.refresh_from_db()
        self.assertEqual(self.rp.dia_semana, 2)

        # 2. Comprobar que la Reserva física actualizó su hora y fecha
        self.reserva.refresh_from_db()
        if hasattr(self.reserva, 'fecha'):
            self.assertEqual(self.reserva.id_dia_id, date(2025, 9, 9))
        
        self.assertEqual(str(self.reserva.hora_inicio), "10:00:00")
        self.assertEqual(str(self.reserva.hora_fin), "12:00:00")