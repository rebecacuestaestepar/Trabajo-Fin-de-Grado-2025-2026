from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response

from docencia.services_periodicas import crear_reserva_periodica, obtener_asignaturas_por_grado_curso_semestre, obtener_aulas_libres, obtener_cursos_grado, obtener_datos_reserva_periodica, obtener_grados, obtener_grupos_asignatura, obtener_semestres_por_grado_semestre, reserva_desde_horario_grado
import traceback

class ObtenerGradosView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            grados = obtener_grados()
            return Response({'grados': grados}, status=200)
        except Exception as e:
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)
        
class ObtenerCursosGradoView(APIView):
    def get(self, request, id_grado, *args, **kwargs):
        try:
            cursos = obtener_cursos_grado(id_grado)
            return Response({'cursos': cursos}, status=200)
        except Exception as e:
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)
        
class ObtenerSemestresPorGradoView(APIView):
    def get(self, request, id_grado, curso_grado, *args, **kwargs):
        try:
            semestres = obtener_semestres_por_grado_semestre(id_grado, curso_grado)
            return Response({'semestres': semestres}, status=200)
        except Exception as e:
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)
        
class ObtenerAsignaturasPorGradoCursoSemestreView(APIView):
    def get(self, request, id_grado, curso_grado, semestre, *args, **kwargs):

        try:
            asignaturas = obtener_asignaturas_por_grado_curso_semestre(curso_grado, id_grado, semestre)
            return Response({'asignaturas': asignaturas}, status=200)
        except Exception as e:
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)
        
class ObtenerGruposAsignaturaView(APIView):
    def get(self, request, id_asignatura, *args, **kwargs):
        try:
            grupos = obtener_grupos_asignatura(id_asignatura)
            return Response({'grupos': grupos}, status=200)
        except Exception as e:
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)
        
class ObtenerAulasLibresView(APIView):
    def get(self, request, *args, **kwargs):
        dia_semana = request.query_params.get('dia_semana')
        hora_inicio = request.query_params.get('hora_inicio')
        hora_fin = request.query_params.get('hora_fin')

        if not dia_semana or not hora_inicio or not hora_fin:
            return Response({'error': 'Faltan parámetros requeridos'}, status=400)

        try:
            aulas_libres = obtener_aulas_libres(dia_semana, hora_inicio, hora_fin)
            return Response({'aulas_libres': aulas_libres}, status=200)
        except Exception as e:
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)

class CrearReservaPeriodicaView(APIView):
    def post(self, request, *args, **kwargs):
        id_curso = request.data.get('id_curso')
        semestre_num = request.data.get('semestre_num')
        datos_reserva = request.data.get('datos_reserva')

        if not id_curso or not semestre_num or not datos_reserva:
            return Response({'error': 'Faltan parámetros requeridos'}, status=400)

        try:
            resultado = crear_reserva_periodica(id_curso, int(semestre_num), datos_reserva)
            return Response(resultado, status=200)
        except Exception as e:
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)
        
class ObtenerDatosReservaPeriodicaView(APIView):
    def get(self, request, id_reserva, *args, **kwargs):
        try:
            reserva = obtener_datos_reserva_periodica(id_reserva)
            return Response({'reserva': reserva}, status=200)
        except Exception as e:
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)

class ReservaDesdeHorarioAsignaturasView(APIView):
    def get(self, request, id_grado, semestre, *args, **kwargs):
        try:
            resultado = reserva_desde_horario_grado(id_grado, semestre)
            return Response(resultado, status=200)
        except Exception as e:
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)