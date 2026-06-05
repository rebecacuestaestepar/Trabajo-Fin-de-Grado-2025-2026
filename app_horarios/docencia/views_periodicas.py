from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response

from docencia.services_periodicas import crear_reserva_periodica, eliminar_reserva_periodica, obtener_asignaturas_por_grado_curso_semestre, obtener_aulas_libres, obtener_cursos_grado, obtener_datos_reserva_periodica, obtener_grados, obtener_grupos_asignatura, obtener_semestres_por_grado_semestre, reserva_desde_horario_grado, eliminar_reserva_periodica
import traceback

from rest_framework.permissions import IsAuthenticated

class ObtenerGradosView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
        if not (request.user.has_perm("reservas.view_reservaperiodica") or request.user.has_perm("reservas.change_reservaperiodica")):
            return Response({'error': 'No tienes permiso para consultar los grados.'}, status=403)
        try:
            grados = obtener_grados()
            return Response({'grados': grados}, status=200)
        except Exception as e:
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)
        
class ObtenerCursosGradoView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id_grado, *args, **kwargs):
        if not (request.user.has_perm("reservas.change_reservaperiodica") or request.user.has_perm("reservas.view_reservaperiodica")):
            return Response({'error': 'No tienes permiso para consultar los cursos.'}, status=403)
        try:
            cursos = obtener_cursos_grado(id_grado)
            return Response({'cursos': cursos}, status=200)
        except Exception as e:
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)
        
class ObtenerSemestresPorGradoView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id_grado, curso_grado, *args, **kwargs):
        if not (request.user.has_perm("reservas.change_reservaperiodica") or request.user.has_perm("reservas.view_reservaperiodica")):
            return Response({'error': 'No tienes permiso para consultar los semestres.'}, status=403)
        try:
            semestres = obtener_semestres_por_grado_semestre(id_grado, curso_grado)
            return Response({'semestres': semestres}, status=200)
        except Exception as e:
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)
        
class ObtenerAsignaturasPorGradoCursoSemestreView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id_grado, curso_grado, semestre, *args, **kwargs):
        if not (request.user.has_perm("reservas.change_reservaperiodica") or request.user.has_perm("reservas.view_reservaperiodica")):
            return Response({'error': 'No tienes permiso para consultar las asignaturas.'}, status=403)

        try:
            asignaturas = obtener_asignaturas_por_grado_curso_semestre(curso_grado, id_grado, semestre)
            return Response({'asignaturas': asignaturas}, status=200)
        except Exception as e:
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)
        
class ObtenerGruposAsignaturaView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id_asignatura, *args, **kwargs):
        if not (request.user.has_perm("reservas.change_reservaperiodica") or request.user.has_perm("reservas.view_reservaperiodica")):
            return Response({'error': 'No tienes permiso para consultar los grupos.'}, status=403)
        try:
            grupos = obtener_grupos_asignatura(id_asignatura)
            return Response({'grupos': grupos}, status=200)
        except Exception as e:
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)
        
class ObtenerAulasLibresView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
        if not (request.user.has_perm("reservas.change_reservaperiodica") or request.user.has_perm("reservas.view_reservaperiodica")):
            return Response({'error': 'No tienes permiso para consultar las aulas libres.'}, status=403)
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
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        if not request.user.has_perm("reservas.add_reservaperiodica"):
            return Response({'error': 'No tienes permiso para crear reservas periódicas.'}, status=403)
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
    permission_classes = [IsAuthenticated]
    def get(self, request, id_reserva, *args, **kwargs):
        if not request.user.has_perm("reservas.view_reservaperiodica"):
            return Response({'error': 'No tienes permiso para consultar los datos de la reserva periódica.'}, status=403)
        try:
            reserva = obtener_datos_reserva_periodica(id_reserva)
            return Response({'reserva': reserva}, status=200)
        except Exception as e:
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)

class ReservaDesdeHorarioAsignaturasView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id_grado, semestre, *args, **kwargs):
        if not request.user.has_perm("reservas.add_reservaperiodica"):
            return Response({'error': 'No tienes permiso para crear reservas periódicas.'}, status=403)
        try:
            resultado = reserva_desde_horario_grado(id_grado, semestre)
            return Response(resultado, status=200)
        except Exception as e:
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)
        
class EliminarReservaPeriodicaView(APIView):
    """
    Vista para eliminar una serie de reservas periódicas mediante su firma.
    """
    permission_classes = [IsAuthenticated]
    def post(self, request):
        if not request.user.has_perm("reservas.delete_reservaperiodica"):
            return Response({'error': 'No tienes permiso para eliminar reservas periódicas.'}, status=403)
        curso_academico = request.data.get('curso_academico')
        semestre_num = request.data.get('semestre_num')
        firma_serie = request.data.get('firma_serie')

        if not all([curso_academico, semestre_num, firma_serie]):
            return Response(
                {
                    "exito": False,
                    "estado": "error",
                    "mensaje": "Faltan parámetros obligatorios (curso_academico, semestre_num, firma_serie).",
                },
                status=400
            )

        try:
            resultado = eliminar_reserva_periodica(
                id_curso=curso_academico,
                semestre_num=int(semestre_num),
                firma_serie=str(firma_serie)
            )
        except ValueError:
            traceback.print_exc()
            return Response(
                {
                    "exito": False,
                    "estado": "error",
                    "mensaje": "Los tipos de datos enviados no son válidos."
                },
                status=400
            )

        if resultado.get("exito"):
            return Response(resultado, status=200)
        else:
            traceback.print_exc()
            return Response(resultado, status=400)
    