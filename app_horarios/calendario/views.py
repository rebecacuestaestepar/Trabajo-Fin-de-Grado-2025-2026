from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from calendario.services import generar_calendario_academico, modificar_tipo_dia, obtener_dias_curso
from .serializers import CargarCalendarioSerializer
from .models import Curso

import traceback

class CargarCalendarioAPIView(APIView):
    def post(self, request, *args, **kwargs):
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
    def get(self, request, id_curso, *args, **kwargs):
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
    def post(self, request, *args, **kwargs):
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
