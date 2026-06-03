from datetime import timedelta, datetime, date
from django.utils import timezone
from django.utils.timezone import now
from rest_framework.views import APIView, PermissionDenied
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.generics import ListAPIView


from aulas.services import AulaService, lista_mini_aulas, obtener_aulas_menu
from aulas.models import Aula
from calendario.models import Dia
from aulas.serializers import AulaDisponibleRequestSerializer, AulaMenuSerializer, AulaMiniSerializer, AulaSerializer
from reservas.services import (
    aulas_disponibles_en_fecha_hora,
    aula_disponible_en_varias_fechas,
)

from rest_framework.permissions import IsAuthenticated, DjangoModelPermissions

class AulaViewSet(viewsets.ViewSet):
    """
    ViewSet para gestionar las operaciones CRUD de las aulas. Permite listar, recuperar, crear, actualizar y eliminar aulas.
    Requiere permisos de autenticación y permisos específicos de modelo para cada acción.
    """
    # Comprueba permisos
    permission_classes = [IsAuthenticated, DjangoModelPermissions]
    # Se define el QuerySet real para que DjangoModelPermissions evalúe correctamente los permisos
    queryset = Aula.objects.none()
    def list(self, request):
        """
        Lista todas las aulas con todos los campos. Requiere permiso "aulas.view_aula".
        """
        aulas = AulaService.list()
        serializer = AulaSerializer(aulas, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        """
        Recupera los detalles de un aula específico por su ID. Requiere permiso "aulas.view_aula".
        """
        aula = AulaService.retrieve(pk)
        serializer = AulaSerializer(aula)
        return Response(serializer.data)

    def create(self, request):
        """
        Crea un nuevo aula con los datos proporcionados. Requiere permiso "aulas.add_aula".
        """
        serializer = AulaSerializer(data=request.data)
        if serializer.is_valid():
            nueva_aula = AulaService.create(serializer.validated_data)
            return Response(AulaSerializer(nueva_aula).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        """
        Actualiza un aula existente con los datos proporcionados. Requiere permiso "aulas.change_aula".
        """
        serializer = AulaSerializer(data=request.data)
        if serializer.is_valid():
            aula_actualizada = AulaService.update(pk, serializer.validated_data)
            return Response(AulaSerializer(aula_actualizada).data)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        """
        Elimina un aula existente. Requiere permiso "aulas.delete_aula".
        """
        AulaService.destroy(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)

class ListaMiniAulasAPIView(APIView):
    """
    Devuele una lista de aulas solo con el id y con el nombre.
    """
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
        aulas = lista_mini_aulas()
        return Response(aulas, status=200)


class ListaAulasAPIView(ListAPIView):
    """
    Devuelve una lista de aulas con su id y nombre, ordenadas por nombre. Permite filtrar por campus mediante el parámetro de consulta "campus".
    Requiere permiso "aulas.view_ocupacion_aula" para poder acceder.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = AulaMenuSerializer
    def get_queryset(self):
        if not self.request.user.has_perm("aulas.view_ocupacion_aula"):
            raise PermissionDenied("No tienes permiso para consultar las aulas.")
        
        campus = self.request.query_params.get('campus')
        
        try:
            queryset = obtener_aulas_menu(campus)
        except Exception as e:
            raise PermissionDenied(f"Error al obtener las aulas para el menú: {str(e)}")
            
        return queryset

