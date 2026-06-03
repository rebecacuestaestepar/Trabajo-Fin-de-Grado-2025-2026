# from django.shortcuts import render
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from .serializer import CursoSerializer, GradoSerializer
# from .services import obtener_grados_con_horario, obtener_cursos_con_horario
# from calendario.models import Curso

# from rest_framework.permissions import IsAuthenticated

# class ListaHorariosView(APIView):
#     permission_classes = [IsAuthenticated]
#     def get(self, request):
#         if not request.user.has_perm("reservas.view_reservaperiodica"):
#             return Response({'error': 'No tienes permiso para consultar los horarios.'}, status=403)
#         horarios_cargados = obtener_cursos_con_horario()

#         serializer = CursoSerializer(horarios_cargados, many=True)

#         return Response(serializer.data, status=200)
    
# class GradorPorCursoView(APIView):
#     permission_classes = [IsAuthenticated]
#     def get(self, request, id_curso):
#         if not request.user.has_perm("reservas.view_reservaperiodica"):
#             return Response({'error': 'No tienes permiso para consultar los horarios.'}, status=403)
#         curso = Curso.objects.filter(idcurso=id_curso).first()
#         if not curso:
#             return Response({'error': 'Curso no encontrado'}, status=404)
        
#         grados_con_clases  = obtener_grados_con_horario(curso)

#         serializer = GradoSerializer(grados_con_clases, many=True)

#         return Response(serializer.data, status=200)
