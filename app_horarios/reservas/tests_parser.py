from django.test import TestCase
from datetime import date
# Cambia 'tu_app' por la ruta real donde tengas tu parser y models
from .excel_parser import clasificar_celda, Clase
from .limpiar_nombres_aulas import limpiar_nombre_aula

class AnalizadorLexicoTests(TestCase):

    def test_clasificar_celda_vacia(self):
        tipo, valor = clasificar_celda(None)
        self.assertEqual(tipo, "VACIA")
        self.assertIsNone(valor)

    def test_clasificar_celda_palabras_clave(self):
        # Comienzo de tabla
        self.assertEqual(clasificar_celda("Hora")[0], "COMIENZO_TABLA")
        self.assertEqual(clasificar_celda(" hOrA  ")[0], "COMIENZO_TABLA") # Prueba espacios y mayúsculas
        
        # Comienzo tabla asignaturas
        self.assertEqual(clasificar_celda("Nombre Abreviado")[0], "COMIENZO_TABLA_ASIGNATURAS")
        
        # Columna Código
        self.assertEqual(clasificar_celda("Codigo")[0], "COL_CODIGO")

    def test_clasificar_celda_dias_semana(self):
        tipo, valor = clasificar_celda("lunes")
        self.assertEqual(tipo, "DIA_SEMANA")
        self.assertEqual(valor, "LUNES")

    def test_clasificar_celda_tramo_horario(self):
        tipo, valor = clasificar_celda("09:00 - 11:00")
        self.assertEqual(tipo, "TRAMO_HORARIO")
        self.assertEqual(valor, "09:00 - 11:00")

    def test_clasificar_celda_grupos(self):
        # Grupo Teórico (1 o 2 dígitos)
        self.assertEqual(clasificar_celda("1")[0], "GRUPO_TEORICO")
        self.assertEqual(clasificar_celda("80")[0], "GRUPO_TEORICO")
        
        # Grupo Práctico (3 dígitos, a veces entre paréntesis)
        self.assertEqual(clasificar_celda("801")[0], "GRUPO_PRACTICO")
        tipo, valor = clasificar_celda("(101)")
        self.assertEqual(tipo, "GRUPO_PRACTICO")
        self.assertEqual(valor, "101") # Comprueba que le quita los paréntesis

    def test_clasificar_celda_aula(self):
        self.assertEqual(clasificar_celda("Aula 101")[0], "AULA")
        self.assertEqual(clasificar_celda("Lab de redes")[0], "AULA")
        self.assertEqual(clasificar_celda("Sala de reuniones")[0], "AULA")

    def test_clasificar_celda_codigo_asignatura(self):
        self.assertEqual(clasificar_celda("8797")[0], "CODIGO_ASIG")
        self.assertEqual(clasificar_celda("8797-E")[0], "CODIGO_ASIG")

    def test_clasificar_celda_abrev_asignatura(self):
        self.assertEqual(clasificar_celda("ALG")[0], "ABREV_ASIG")
        self.assertEqual(clasificar_celda("F.FISICOS")[0], "ABREV_ASIG")

    def test_limpiar_nombre_aula(self):
        # Casos vacíos
        self.assertEqual(limpiar_nombre_aula(None), "")
        
        # Quitar prefijo "Aula " pero no "Aula Empresa"
        self.assertEqual(limpiar_nombre_aula("Aula 101"), "101")
        self.assertEqual(limpiar_nombre_aula("Aula Empresa"), "Aula Empresa")
        
        # Transformar Inf en Informática
        self.assertEqual(limpiar_nombre_aula("Inf. 1"), "Informática 1")
        
        # Laboratorios
        self.assertEqual(limpiar_nombre_aula("Lab. Química"), "Laboratorio Química")
        self.assertEqual(limpiar_nombre_aula("Lab 12-A1"), "Lab 12-A1")

    def test_clase_repr(self):
        clase = Clase("Álgebra", "8797", "1", "101", "09:00", "11:00", "LUNES", "T")
        representacion = repr(clase)
        self.assertIn("[LUNES | 09:00-11:00] T - Álgebra", representacion)