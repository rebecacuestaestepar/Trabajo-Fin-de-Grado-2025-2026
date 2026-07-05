from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from calendario.services import generar_calendario_academico, modificar_tipo_dia, obtener_dias_curso, eliminar_curso
from .serializers import CargarCalendarioSerializer
from .models import Curso

import traceback

from rest_framework.permissions import IsAuthenticated

class CargarCalendarioAPIView(APIView):
    """
    Vista para cargar el calendario académico de un curso. Recibe las fechas de inicio y fin del curso, así como las fechas de los semestres y los días festivos. Valida que el usuario tenga permisos para cargar el calendario académico antes de generar el calendario utilizando la función generar_calendario_academico.
    """
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        if not request.user.has_perm("calendario.add_curso"):
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
    """
    Vista para obtener el calendario académico de un curso específico. Valida que el usuario tenga permisos para consultar el calendario del curso antes de obtener los días del curso utilizando la función obtener_dias_curso."""
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
    """
    Vista para modificar el tipo de un día específico en el calendario académico. Recibe las fechas y el nuevo tipo de día (lectivo, festivo, examen o cambio de docencia). Valida que el usuario tenga permisos para modificar el calendario antes de realizar la modificación utilizando la función modificar_tipo_dia.
    """
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
        
class EliminarCalendarioCursoAPIView(APIView):
    """
    Vista para eliminar el calendario académico de un curso específico, y eliminar el curso. Valida que el usuario tenga permisos para eliminar el calendario antes de realizar la eliminación.
    """
    permission_classes = [IsAuthenticated]
    def delete(self, request, id_curso, *args, **kwargs):
        if not request.user.has_perm("calendario.delete_curso"):
            return Response({'error': 'No tienes permiso para eliminar el calendario académico.'}, status=403)
        try:
            eliminar_curso(id_curso)

            return Response({"message": "Calendario académico y curso eliminados correctamente"}, status=status.HTTP_200_OK)
        except Exception as e:
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Create your views here.
