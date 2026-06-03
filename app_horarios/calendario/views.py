from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from calendario.services import generar_calendario_academico, modificar_tipo_dia, obtener_dias_curso
from .serializers import CargarCalendarioSerializer
from .models import Curso

import traceback

from rest_framework.permissions import IsAuthenticated

class CargarCalendarioAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        if not request.user.has_perm("calendario.add_calendario"):
            return Response({'error': 'No tienes permiso para cargar el calendario académico.'}, status=403)
        serializer = CargarCalendarioSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            datos = serializer.validated_data
            generar_calendario_academico(datos)
            return Response({"message": "Calendario académico generado correctamente"}, status=status.HTTP_200_OK)
        except Exception as e:
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class ObtenerCalendarioCursoAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id_curso, *args, **kwargs):
        if not request.user.has_perm("calendario.view_curso"):
            return Response({'error': 'No tienes permiso para consultar el calendario del curso.'}, status=403)
        try: 
            curso = get_object_or_404(Curso, idcurso=id_curso)

            datos_calendario = obtener_dias_curso(curso)

            return Response({
                "fecha_inicio": curso.fecha_inicio,
                "fecha_fin": curso.fecha_fin,
                "dias": datos_calendario
            }, status=status.HTTP_200_OK)

        except Exception as e:
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class ModificarDiaCalendarioAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        if not request.user.has_perms(["calendario.change_curso", "calendario.change_dia", "calendario.change_cambiodocencia", "calendario.change_tfg", "calendario.change_lectivo", "calendario.change_festivo", "calendario.change_examen"]):
            return Response({'error': 'No tienes permiso para modificar el calendario.'}, status=403)
        try:
            datos = request.data

            if 'fechas' not in datos or 'tipo' not in datos:
                return Response({"error": "Faltan campos obligatorios: fechas y tipo"}, status=status.HTTP_400_BAD_REQUEST)
            
            modificar_tipo_dia(datos)

            return Response({"message": "Día actualizado correctamente"}, status=status.HTTP_200_OK)
        except Exception as e:
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Create your views here.
