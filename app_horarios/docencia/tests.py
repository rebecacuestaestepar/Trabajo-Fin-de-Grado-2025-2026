from django.test import TestCase
from django.http import Http404
from docencia.models import Grado, Asignaturas, Grupo, Docente, Imparte
from docencia.services import (
    GradoService, lista_mini_grados,
    AsignaturaService, lista_mini_asignaturas,
    GrupoService, lista_mini_grupos,
    DocenteService, lista_mini_docentes,
    ImparteService
)

class GradoServiceTests(TestCase):
    def setUp(self):
        self.grado = Grado.objects.create(
            idgrado='596', nombre='Grado en Ingeniería Informática',
            abreviatura='GII', coordinador='Álvar Arnaiz'
        )

    def test_list(self):
        Grado.objects.create(idgrado='589', nombre='Doble Grado', abreviatura='DOB')
        resultados = GradoService.list()
        self.assertEqual(resultados.count(), 2)
        self.assertEqual(resultados.first().idgrado, '589')

    def test_retrieve_success(self):
        grado = GradoService.retrieve('596')
        self.assertEqual(grado.nombre, 'Grado en Ingeniería Informática')

    def test_retrieve_404(self):
        with self.assertRaises(Http404):
            GradoService.retrieve('INVENTADO')

    def test_create(self):
        datos = {'idgrado': '689', 'nombre': 'Electrónica', 'abreviatura': 'GEE'}
        grado = GradoService.create(datos)
        self.assertEqual(Grado.objects.count(), 2)
        self.assertEqual(grado.idgrado, '689')

    def test_update(self):
        datos = {'coordinador': 'Nuevo Coord', 'abreviatura': 'INFO'}
        grado = GradoService.update('596', datos)
        self.assertEqual(grado.coordinador, 'Nuevo Coord')
        self.assertEqual(grado.abreviatura, 'INFO')

    def test_delete(self):
        GradoService.delete('596')
        self.assertEqual(Grado.objects.count(), 0)

    def test_lista_mini_grados(self):
        resultados = lista_mini_grados()
        self.assertEqual(len(resultados), 1)
        self.assertEqual(resultados[0]['nombre'], 'Grado en Ingeniería Informática')
        self.assertIn('idgrado', resultados[0])


class AsignaturaServiceTests(TestCase):
    def setUp(self):
        self.grado = Grado.objects.create(idgrado='589', nombre='Doble Grado', abreviatura='DOB')
        self.asignatura = Asignaturas.objects.create(
            idasignatura='8797', nombre='Álgebra', abreviatura='ALG',
            curso_grado=1, semestre_academico=1, ects=6, grado_id=self.grado, tipo='O'
        )

    def test_list(self):
        resultados = AsignaturaService.list()
        self.assertEqual(resultados.count(), 1)
        self.assertEqual(resultados.first().idasignatura, '8797')

    def test_retrieve_success(self):
        asignatura = AsignaturaService.retrieve('8797')
        self.assertEqual(asignatura.nombre, 'Álgebra')

    def test_retrieve_404(self):
        with self.assertRaises(Http404):
            AsignaturaService.retrieve('9999')

    def test_create(self):
        datos = {
            'idasignatura': '8798', 'nombre': 'Física', 'curso_grado': 1,
            'semestre_academico': 1, 'ects': 6, 'grado_id': self.grado, 'tipo': 'O'
        }
        asignatura = AsignaturaService.create(datos)
        self.assertEqual(Asignaturas.objects.count(), 2)
        self.assertEqual(asignatura.idasignatura, '8798')

    def test_update(self):
        datos = {'nombre': 'Álgebra Avanzada', 'ects': 9}
        asignatura = AsignaturaService.update('8797', datos)
        self.assertEqual(asignatura.nombre, 'Álgebra Avanzada')
        self.assertEqual(asignatura.ects, 9)

    def test_delete(self):
        AsignaturaService.delete('8797')
        self.assertEqual(Asignaturas.objects.count(), 0)

    def test_lista_mini_asignaturas(self):
        resultados = lista_mini_asignaturas()
        self.assertEqual(len(resultados), 1)
        self.assertEqual(resultados[0]['grado_abreviatura'], 'DOB')
        self.assertEqual(resultados[0]['nombre'], 'Álgebra')


class GrupoServiceTests(TestCase):
    def setUp(self):
        self.grado = Grado.objects.create(idgrado='596', nombre='Info', abreviatura='GII')
        self.asignatura = Asignaturas.objects.create(
            idasignatura='8797', nombre='Álgebra', curso_grado=1,
            semestre_academico=1, ects=6, grado_id=self.grado
        )
        self.grupo = Grupo.objects.create(nombre='A01', id_asignatura=self.asignatura)

    def test_list(self):
        self.assertEqual(GrupoService.list().count(), 1)

    def test_retrieve_success(self):
        grupo = GrupoService.retrieve(self.grupo.grupoid)
        self.assertEqual(grupo.nombre, 'A01')

    def test_retrieve_404(self):
        with self.assertRaises(Http404):
            GrupoService.retrieve(999)

    def test_create(self):
        datos = {'nombre': 'A02', 'id_asignatura': self.asignatura}
        grupo = GrupoService.create(datos)
        self.assertEqual(Grupo.objects.count(), 2)
        self.assertEqual(grupo.nombre, 'A02')

    def test_update(self):
        datos = {'nombre': 'B01'}
        grupo = GrupoService.update(self.grupo.grupoid, datos)
        self.assertEqual(grupo.nombre, 'B01')

    def test_delete(self):
        GrupoService.delete(self.grupo.grupoid)
        self.assertEqual(Grupo.objects.count(), 0)

    def test_lista_mini_grupos(self):
        resultados = lista_mini_grupos()
        self.assertEqual(len(resultados), 1)
        self.assertEqual(resultados[0]['nombre'], 'A01')


class DocenteServiceTests(TestCase):
    def setUp(self):
        self.docente = Docente.objects.create(
            nombre='Juan', apellidos='Pérez', correo='juan@ubu.es'
        )

    def test_list(self):
        self.assertEqual(DocenteService.list().count(), 1)

    def test_retrieve_success(self):
        docente = DocenteService.retrieve(self.docente.codigo)
        self.assertEqual(docente.nombre, 'Juan')

    def test_retrieve_404(self):
        with self.assertRaises(Http404):
            DocenteService.retrieve(999)

    def test_create(self):
        datos = {'nombre': 'Ana', 'apellidos': 'Gómez', 'correo': 'ana@ubu.es'}
        docente = DocenteService.create(datos)
        self.assertEqual(Docente.objects.count(), 2)
        self.assertEqual(docente.nombre, 'Ana')

    def test_update(self):
        datos = {'apellidos': 'Sánchez'}
        docente = DocenteService.update(self.docente.codigo, datos)
        self.assertEqual(docente.apellidos, 'Sánchez')

    def test_delete(self):
        DocenteService.delete(self.docente.codigo)
        self.assertEqual(Docente.objects.count(), 0)

    def test_lista_mini_docentes(self):
        resultados = lista_mini_docentes()
        self.assertEqual(len(resultados), 1)
        self.assertEqual(resultados[0]['nombre'], 'Juan')
        self.assertEqual(resultados[0]['apellidos'], 'Pérez')


class ImparteServiceTests(TestCase):
    def setUp(self):
        self.grado = Grado.objects.create(idgrado='GII', nombre='Info', abreviatura='GII')
        self.asignatura = Asignaturas.objects.create(
            idasignatura='8797', nombre='Álgebra', curso_grado=1,
            semestre_academico=1, ects=6, grado_id=self.grado
        )
        self.docente = Docente.objects.create(
            nombre='Juan', apellidos='Pérez', correo='juan@ubu.es'
        )
        self.imparte = Imparte.objects.create(
            codigo_docente=self.docente, id_asignatura=self.asignatura
        )

    def test_list(self):
        resultados = ImparteService.list()
        self.assertEqual(len(resultados), 1)
        self.assertEqual(resultados[0]['docente_nombre'], 'Juan')
        self.assertEqual(resultados[0]['asignatura_nombre'], 'Álgebra')
        self.assertEqual(resultados[0]['grado_abreviatura'], 'GII')

    def test_retrieve_success(self):
        imparte = ImparteService.retrieve(self.imparte.id)
        self.assertEqual(imparte.codigo_docente, self.docente)

    def test_retrieve_404(self):
        with self.assertRaises(Http404):
            ImparteService.retrieve(999)

    def test_create(self):
        docente2 = Docente.objects.create(nombre='Ana', apellidos='S', correo='a@u.es')
        datos = {'codigo_docente': docente2, 'id_asignatura': self.asignatura}
        imparte = ImparteService.create(datos)
        self.assertEqual(Imparte.objects.count(), 2)
        self.assertEqual(imparte.codigo_docente.nombre, 'Ana')

    def test_update(self):
        docente2 = Docente.objects.create(nombre='Ana', apellidos='S', correo='a@u.es')
        datos = {'codigo_docente': docente2}
        imparte = ImparteService.update(self.imparte.id, datos)
        self.assertEqual(imparte.codigo_docente.nombre, 'Ana')

    def test_delete(self):
        ImparteService.delete(self.imparte.id)
        self.assertEqual(Imparte.objects.count(), 0)