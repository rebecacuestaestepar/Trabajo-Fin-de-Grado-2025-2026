from django.test import TestCase
from django.db import IntegrityError
from django.core.exceptions import ValidationError
from docencia.models import Grado, Asignaturas, Docente, Imparte, Grupo
from aulas.models import Aula
from calendario.models import Dia, Lectivo, Curso, Semestre, Festivo, Examen, Tfg, CambioDocencia
from reservas.models import ReservaPeriodica, ReservaPuntual, Reserva

class BaseDatosDocenciaTests(TestCase):

    def setUp(self):
        self.grado_ii = Grado.objects.create(
            idgrado='189',
            nombre='Grado en Ingeniería Informática',
            abreviatura='GII',
            coordinador='Juan Gómez'
        )

        self.docente_jose = Docente.objects.create(
            nombre='José',
            apellidos='López Martínez',
            correo='jlopez@ubu.es',
            telefono='123456789'
        )

        self.asignatura_algebra = Asignaturas.objects.create(
            idasignatura='9687',
            nombre='Álgebra Lineal',
            abreviatura='ALGEBRA',
            curso_grado=1,
            semestre_academico=1,
            ects=6,
            grado_id=self.grado_ii,
            tipo='O',
            horas_practicas=2
        )

    def test_creacion_grado_y_str(self):
        self.assertEqual(str(self.grado_ii), 'Grado en Ingeniería Informática')

    def test_asignatura_ects_no_negativos(self):
        asignatura_invalida = Asignaturas(
            idasignatura='1234',
            nombre='Asignatura Inválida',
            abreviatura='INV',
            curso_grado=1,
            semestre_academico=1,
            ects=-5, # Valor de ECTS > 0
            grado_id=self.grado_ii,
            tipo='O',
            horas_practicas=2
        )

        with self.assertRaises((ValidationError, IntegrityError)):
            asignatura_invalida.full_clean()
            asignatura_invalida.save()

    def test_asignatura_ects_no_cero(self):
        asignatura_invalida = Asignaturas(
            idasignatura='1234',
            nombre='Asignatura Inválida',
            abreviatura='INV',
            curso_grado=1,
            semestre_academico=1,
            ects=0, # Valor de ECTS no puede ser cero
            grado_id=self.grado_ii,
            tipo='O',
            horas_practicas=2
        )

        with self.assertRaises((ValidationError, IntegrityError)):
            asignatura_invalida.full_clean()
            asignatura_invalida.save()

    def test_asignatura_curso_grado_fuera_de_rango(self):
        asignatura_invalida = Asignaturas(
            idasignatura='5678',
            nombre='Asignatura Inválida',
            abreviatura='INV',
            curso_grado=7, # Valor de curso_grado fuera del rango permitido (1-6)
            semestre_academico=1,
            ects=6,
            grado_id=self.grado_ii,
            tipo='O',
            horas_practicas=2
        )

        with self.assertRaises((ValidationError, IntegrityError)):
            asignatura_invalida.full_clean()
            asignatura_invalida.save()
