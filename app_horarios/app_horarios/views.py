from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializer import CursoSerializer, GradoSerializer
from .services import obtener_grados_con_horario, obtener_cursos_con_horario
from calendario.models import Curso

class ListaHorariosView(APIView):
    def get(self, request):
        horarios_cargados = obtener_cursos_con_horario()

        # datos = []

        # for h in horarios_cargados:
        #     datos.append({
        #         'idcurso': h.idcurso,
        #         'horario_cargado': h.horario_cargado
        #     })
        serializer = CursoSerializer(horarios_cargados, many=True)

        return Response(serializer.data, status=200)
    
class GradorPorCursoView(APIView):
    def get(self, request, id_curso):
        curso = Curso.objects.filter(idcurso=id_curso).first()
        if not curso:
            return Response({'error': 'Curso no encontrado'}, status=404)
        
        grados_con_clases  = obtener_grados_con_horario(curso)

        serializer = GradoSerializer(grados_con_clases, many=True)

        return Response(serializer.data, status=200)
