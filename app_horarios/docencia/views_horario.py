from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from docencia.serializers import HorarioSerializer, CursoSerializer, GradoSerializer
from docencia.services_horario import mover_serie_reservas, obtener_semestres_por_grado, obtener_asignaturas_por_grado_y_semestre, validar_restricciones_movimiento, obtener_cursos_con_horario, obtener_grados_con_horario
from calendario.models import Curso
from reservas.excel_parser import parsear_horario_excel
from reservas.services_excel import generar_reservas_periodicas, validar_horario_cargado
import traceback

from rest_framework.permissions import IsAuthenticated

class ValidarHorarioCargadoView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id_curso):
        if not request.user.has_perm("reservas.view_reservaperiodica"):
            return Response({'error': 'No tienes permiso para consultar los horarios.'}, status=403)
        try:
            horario_cargado, num_reservas = validar_horario_cargado(id_curso)
            return Response({'horario_cargado': horario_cargado, 'num_reservas': num_reservas}, status=200)
        except Exception as e:
            traceback.print_exc()
            return Response({'error': str(e)}, status=404)
        
class ObtenerNumeroClasesView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        if not request.user.has_perm("reservas.view_reservaperiodica"):
            return Response({'error': 'No tienes permiso para consultar las clases extraídas.'}, status=403)
        fichero = request.FILES.get('fichero')

        if not fichero:
            return Response({'error': 'No se ha proporcionado ningún fichero'}, status=400)

        try:
            clases = parsear_horario_excel(fichero)
            num_clases = len(clases)
            return Response({'num_clases': num_clases}, status=200)
        except Exception as e:
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)

class CargarHorarioExcelView(APIView):
    permission_classes = [IsAuthenticated]
    parser_clases = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        if not request.user.has_perms(["reservas.add_reservaperiodica", "reservas.add_reserva"]):
            return Response({'error': 'No tienes permiso para cargar horarios.'}, status=403)
        fichero = request.FILES.get('fichero')
        curso = request.data.get('id_curso')

        if not fichero:
            return Response({'error': 'No se ha proporcionado ningún fichero'}, status=400)
        
        if not curso:
            return Response({'error': 'No se ha proporcionado el curso'}, status=400)
        
        try:
            clases = parsear_horario_excel(fichero)

            generar_reservas_periodicas(clases, curso)

            return Response({'message': 'Horario cargado y reservas generadas correctamente'}, status=200)
        except Exception as e:
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)
        
class ListaHorariosView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        if not request.user.has_perm("reservas.view_reservaperiodica"):
            return Response({'error': 'No tienes permiso para consultar los horarios.'}, status=403)
        horarios_cargados = obtener_cursos_con_horario()

        serializer = CursoSerializer(horarios_cargados, many=True)

        return Response(serializer.data, status=200)
    
class GradosPorCursoView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id_curso):
        if not request.user.has_perm("reservas.view_reservaperiodica"):
            return Response({'error': 'No tienes permiso para consultar los horarios.'}, status=403)
        curso = Curso.objects.filter(idcurso=id_curso).first()
        if not curso:
            return Response({'error': 'Curso no encontrado'}, status=404)
        
        grados_con_clases  = obtener_grados_con_horario(curso)

        serializer = GradoSerializer(grados_con_clases, many=True)

        return Response(serializer.data, status=200)

class ObtenerCursosView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
        if not (request.user.has_perm("reservas.add_reservaperiodica") or request.user.has_perm("calendario.view_curso")):
            return Response({'error': 'No tienes permiso para consultar los cursos.'}, status=403)
        cursos = Curso.objects.all().values('idcurso').order_by('-idcurso')
        return Response(cursos, status=200)
    
class SemestresPorGradoView(APIView):
    def get(self, request, id_grado, *args, **kwargs):
        if not (request.user.has_perm("reservas.change_reservaperiodica") or request.user.has_perm("reservas.view_reservaperiodica")):
            return Response({'error': 'No tienes permiso para consultar los semestres.'}, status=403)
        try:
            semestres = obtener_semestres_por_grado(id_grado)
            return Response({'semestres': semestres}, status=200)
        except Exception as e:
            traceback.print_exc()
            return Response({'error': str(e)}, status=404)


class ObtenerAsignaturasPorGradoYSemestreView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id_grado, id_semestre, *args, **kwargs):
        if not (request.user.has_perm("reservas.change_reservaperiodica") or request.user.has_perm("reservas.view_reservaperiodica")):
            return Response({'error': 'No tienes permiso para consultar las asignaturas.'}, status=403)
        id_curso = request.query_params.get('id_curso')

        if not id_curso:
            return Response({'error': 'No se ha proporcionado el ID del curso'}, status=400)

        try:
            reservas = obtener_asignaturas_por_grado_y_semestre(id_curso, id_grado, int(id_semestre))
            return Response(reservas, status=200)
        except Exception as e:
            traceback.print_exc()
            return Response({'error': str(e)}, status=404)

class ValidarRestriccionesView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        if not request.user.has_perm("reservas.change_reservaperiodica"):
            return Response({'error': 'No tienes permiso para validar las restricciones.'}, status=403)
        id_curso = request.data.get('id_curso')
        semestre_num = request.data.get('semestre_num')
        id_grado = request.data.get('id_grado')
        datos_movimiento = request.data.get('datos_movimiento')

        resultado = validar_restricciones_movimiento(id_curso, int(semestre_num), id_grado, datos_movimiento)
        return Response(resultado, status=200)
        

class MoverSerieReservasView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        if not request.user.has_perm("reservas.change_reservaperiodica"):
            return Response({'error': 'No tienes permiso para mover series de reservas.'}, status=403)
        id_curso = request.data.get('id_curso')
        semestre_num = request.data.get('semestre_num')
        datos_movimiento = request.data.get('datos_movimiento')

        if not id_curso or not semestre_num or not datos_movimiento:
            return Response({'error': 'Faltan parámetros requeridos'}, status=400)

        try:
            resultado = mover_serie_reservas(id_curso, int(semestre_num), datos_movimiento)
            return Response(resultado, status=200)
        except Exception as e:
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)