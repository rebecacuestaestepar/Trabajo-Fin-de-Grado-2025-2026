from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from docencia.serializers import HorarioSerializer
from docencia.services import obtener_semestres_por_grado, obtener_asignaturas_por_grado_y_semestre
from calendario.models import Curso
from reservas.excel_parser import parsear_horario_excel
from reservas.services_excel import generar_reservas_periodicas
import traceback

# Create your views here.
class CargarHorarioExcelView(APIView):
    parser_clases = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
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

class ObtenerCursosView(APIView):
    def get(self, request, *args, **kwargs):
        cursos = Curso.objects.all().values('idcurso').order_by('-idcurso')
        return Response(cursos, status=200)
    
class SemestresPorGradoView(APIView):
    def get(self, request, *args, **kwargs):
        id_grado = request.query_params.get('id_grado')

        if not id_grado:
            return Response({'error': 'No se ha proporcionado el ID del grado'}, status=400)

        try:
            semestres = obtener_semestres_por_grado(id_grado)
            return Response({'semestres': semestres}, status=200)
        except Exception as e:
            traceback.print_exc()
            return Response({'error': str(e)}, status=404)


class ObtenerAsignaturasPorGradoYSemestreView(APIView):
    def get(self, request, *args, **kwargs):
        id_curso = request.query_params.get('id_curso')
        id_grado = request.query_params.get('id_grado')
        semestre_academico = request.query_params.get('semestre_academico')

        if not id_curso or not id_grado or not semestre_academico:
            return Response({'error': 'Faltan parámetros requeridos'}, status=400)

        try:
            reservas = obtener_asignaturas_por_grado_y_semestre(id_curso, id_grado, int(semestre_academico))
            serializer = HorarioSerializer(reservas, many=True)
            return Response(serializer.data, status=200)
        except Exception as e:
            traceback.print_exc()
            return Response({'error': str(e)}, status=404)