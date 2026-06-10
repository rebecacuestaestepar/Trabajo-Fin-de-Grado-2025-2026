from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Docente, Grado, Grupo, Asignaturas, Imparte

from .serializers import GrupoSerializer, DocenteSerializer, GradoSerializer
from docencia.serializers import AsignaturaSerializer, ImparteSerializer

from .services import GradoService, AsignaturaService, GrupoService, DocenteService, lista_mini_asignaturas, lista_mini_docentes, lista_mini_grados, lista_mini_grupos, ImparteService

from rest_framework.permissions import IsAuthenticated, DjangoModelPermissions

import traceback

# Create your views here.
class GradoViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, DjangoModelPermissions]
    queryset = Grado.objects.none()
    
    def list(self, request):
        """Obtiene la lista de todos los grados académicos disponibles, ordenados por su identificador. Valida que el usuario tenga permisos para consultar los grados, y devuelve una respuesta con la información de cada grado en formato JSON."""
        grados = GradoService.list()
        serializer = GradoSerializer(grados, many=True)
        return Response(serializer.data, status=200)

    def retrieve(self, request, pk=None):
        """Obtiene un grado académico específico por su identificador. Valida que el usuario tenga permisos para consultar los grados, y que el grado proporcionado exista. Devuelve una respuesta con la información del grado en formato JSON, o un mensaje de error si ocurre algún problema durante el proceso."""
        grado = GradoService.retrieve(pk)
        serializer = GradoSerializer(grado)
        return Response(serializer.data, status=200)

    def create(self, request):
        """Crea un nuevo grado académico con los datos proporcionados. Valida que el usuario tenga permisos para crear grados, y que se hayan proporcionado los parámetros necesarios para crear el grado. Devuelve una respuesta con la información del grado recién creado en formato JSON, o un mensaje de error si ocurre algún problema durante el proceso."""
        datos_grado = request.data
        grado = GradoService.create(datos_grado)
        serializer = GradoSerializer(grado)
        return Response(serializer.data, status=201)

    def update(self, request, pk=None):
        """Actualiza un grado académico existente con los datos proporcionados. Valida que el usuario tenga permisos para actualizar grados, y que se hayan proporcionado los parámetros necesarios para actualizar el grado. Devuelve una respuesta con la información del grado actualizado en formato JSON, o un mensaje de error si ocurre algún problema durante el proceso."""
        datos_actualizados = request.data
        grado = GradoService.update(pk, datos_actualizados)
        serializer = GradoSerializer(grado)
        return Response(serializer.data, status=200)

    def destroy(self, request, pk=None):
        """Elimina un grado académico específico por su identificador. Valida que el usuario tenga permisos para eliminar grados, y que el grado proporcionado exista. Devuelve una respuesta con el estado de la operación."""
        GradoService.delete(pk)
        return Response(status=204)

class ListaMiniGradosView(APIView):
    """Obtiene una lista de diccionarios con el identificador y nombre de cada grado académico, ordenados por nombre. Valida que el usuario tenga permisos para consultar los grados, y devuelve una respuesta con la información de cada grado en formato JSON."""
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
        grados = lista_mini_grados()
        return Response(grados, status=200)
    
class AsignaturaViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, DjangoModelPermissions]
    queryset = Asignaturas.objects.none()

    def list(self, request):
        """Obtiene la lista de todas las asignaturas disponibles. Valida que el usuario tenga permisos para consultar las asignaturas, y devuelve una respuesta con la información de cada asignatura en formato JSON."""
        asignaturas = AsignaturaService.list()
        serializer = AsignaturaSerializer(asignaturas, many=True)
        return Response(serializer.data, status=200)

    def retrieve(self, request, pk=None):
        """Obtiene una asignatura específica por su identificador. Valida que el usuario tenga permisos para consultar las asignaturas, y que la asignatura proporcionada exista. Devuelve una respuesta con la información de la asignatura en formato JSON, o un mensaje de error si ocurre algún problema durante el proceso."""
        asignatura = AsignaturaService.retrieve(pk)
        serializer = AsignaturaSerializer(asignatura)
        return Response(serializer.data, status=200)

    def create(self, request):
        """Crea una nueva asignatura con los datos proporcionados. Valida que el usuario tenga permisos para crear asignaturas, y que se hayan proporcionado los parámetros necesarios para crear la asignatura. Devuelve una respuesta con la información de la asignatura recién creada en formato JSON, o un mensaje de error si ocurre algún problema durante el proceso."""
        datos_asignatura = request.data
        asignatura = AsignaturaService.create(datos_asignatura)
        serializer = AsignaturaSerializer(asignatura)
        return Response(serializer.data, status=201)

    def update(self, request, pk=None):
        """Actualiza una asignatura existente con los datos proporcionados. Valida que el usuario tenga permisos para actualizar asignaturas, y que se hayan proporcionado los parámetros necesarios para actualizar la asignatura. Devuelve una respuesta con la información de la asignatura actualizada en formato JSON, o un mensaje de error si ocurre algún problema durante el proceso."""
        datos_actualizados = request.data
        asignatura = AsignaturaService.update(pk, datos_actualizados)
        serializer = AsignaturaSerializer(asignatura)
        return Response(serializer.data, status=200)

    def destroy(self, request, pk=None):
        """Elimina una asignatura específica por su identificador. Valida que el usuario tenga permisos para eliminar asignaturas, y que la asignatura proporcionada exista. Devuelve una respuesta con el estado de la operación."""
        AsignaturaService.delete(pk)
        return Response(status=204)

class ListaMiniAsignaturasView(APIView):
    """Obtiene una lista de diccionarios con el identificador, el nombre y la abreviatura del grado al que corresponde la asignatura de cada asignatura, ordenados por el nombre del grado y luego por el nombre de la asignatura. Valida que el usuario tenga permisos para consultar las asignaturas, y devuelve una respuesta con la información de cada asignatura en formato JSON."""
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
        asignaturas = lista_mini_asignaturas()
        return Response(asignaturas, status=200)

class GrupoViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, DjangoModelPermissions]
    queryset = Grupo.objects.none()

    def list(self, request):
        """Obtiene la lista de todos los grupos disponibles. Valida que el usuario tenga permisos para consultar los grupos, y devuelve una respuesta con la información de cada grupo en formato JSON."""
        grupos = GrupoService.list()
        serializer = GrupoSerializer(grupos, many=True)
        return Response(serializer.data, status=200)
    
    def retrieve(self, request, pk=None):
        """Obtiene un grupo específico por su identificador. Valida que el usuario tenga permisos para consultar los grupos, y que el grupo proporcionado exista. Devuelve una respuesta con la información del grupo en formato JSON, o un mensaje de error si ocurre algún problema durante el proceso."""
        grupo = GrupoService.retrieve(pk)
        serializer = GrupoSerializer(grupo)
        return Response(serializer.data, status=200)
    
    def create(self, request):
        """Crea un nuevo grupo con los datos proporcionados. Valida que el usuario tenga permisos para crear grupos, y que se hayan proporcionado los parámetros necesarios para crear el grupo. Devuelve una respuesta con la información del grupo recién creado en formato JSON, o un mensaje de error si ocurre algún problema durante el proceso."""
        datos_grupo = request.data
        grupo = GrupoService.create(datos_grupo)
        serializer = GrupoSerializer(grupo)
        return Response(serializer.data, status=201)
    
    def update(self, request, pk=None):
        """Actualiza un grupo existente con los datos proporcionados. Valida que el usuario tenga permisos para actualizar grupos, y que se hayan proporcionado los parámetros necesarios para actualizar el grupo. Devuelve una respuesta con la información del grupo actualizado en formato JSON, o un mensaje de error si ocurre algún problema durante el proceso."""
        datos_actualizados = request.data
        grupo = GrupoService.update(pk, datos_actualizados)
        serializer = GrupoSerializer(grupo)
        return Response(serializer.data, status=200)
    
    def destroy(self, request, pk=None):
        """Elimina un grupo específico por su identificador. Valida que el usuario tenga permisos para eliminar grupos, y que el grupo proporcionado exista. Devuelve una respuesta con el estado de la operación."""
        GrupoService.delete(pk)
        return Response(status=204)

class ListaMiniGruposView(APIView):
    """Obtiene una lista de grupos con el identificador y el nombre de cada grupo. Valida que el usuario tenga permisos para consultar los grupos, y devuelve una respuesta con la información de cada grupo en formato JSON."""
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
            grupos = lista_mini_grupos()
            return Response(grupos, status=200)

class DocenteViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, DjangoModelPermissions]
    queryset = Docente.objects.none()
    def list(self, request):
        """Obtiene la lista de todos los docentes disponibles. Valida que el usuario tenga permisos para consultar los docentes, y devuelve una respuesta con la información de cada docente en formato JSON."""
        docentes = DocenteService.list()
        serializer = DocenteSerializer(docentes, many=True)
        return Response(serializer.data, status=200)

    def retrieve(self, request, pk=None):
        """Obtiene un docente específico por su identificador. Valida que el usuario tenga permisos para consultar los docentes, y que el docente proporcionado exista. Devuelve una respuesta con la información del docente en formato JSON, o un mensaje de error si ocurre algún problema durante el proceso."""
        docente = DocenteService.retrieve(pk)
        serializer = DocenteSerializer(docente)
        return Response(serializer.data, status=200)
    
    def create(self, request):
        """Crea un nuevo docente con los datos proporcionados. Valida que el usuario tenga permisos para crear docentes, y que se hayan proporcionado los parámetros necesarios para crear el docente. Devuelve una respuesta con la información del docente recién creado en formato JSON, o un mensaje de error si ocurre algún problema durante el proceso."""
        datos_docente = request.data
        docente = DocenteService.create(datos_docente)
        serializer = DocenteSerializer(docente)
        return Response(serializer.data, status=201)
    
    def update(self, request, pk=None):
        """Actualiza un docente existente con los datos proporcionados. Valida que el usuario tenga permisos para actualizar docentes, y que se hayan proporcionado los parámetros necesarios para actualizar el docente. Devuelve una respuesta con la información del docente actualizado en formato JSON, o un mensaje de error si ocurre algún problema durante el proceso."""
        datos_actualizados = request.data
        docente = DocenteService.update(pk, datos_actualizados)
        serializer = DocenteSerializer(docente)
        return Response(serializer.data, status=200)

    def destroy(self, request, pk=None):
        DocenteService.delete(pk)
        return Response(status=204)

class ListaMiniDocentesView(APIView):
    """Obtiene una lista de diccionarios con el código y el nombre de cada docente, ordenados por nombre. Valida que el usuario tenga permisos para consultar los docentes, y devuelve una respuesta con la información de cada docente en formato JSON."""
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
        docentes = lista_mini_docentes()
        return Response(docentes, status=200)
    
class ImparteViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, DjangoModelPermissions]
    queryset = Imparte.objects.none()

    def list(self, request):
        """Obtiene la lista de todas las relaciones de docencia disponibles. Valida que el usuario tenga permisos para consultar las relaciones de docencia, y devuelve una respuesta con la información de cada relación en formato JSON."""
        datos_imparte = ImparteService.list()
        return Response(datos_imparte, status=200)
    
    def retrieve(self, request, pk=None):
        """Obtiene una relación de docencia específica por su identificador. Valida que el usuario tenga permisos para consultar las relaciones de docencia, y que la relación proporcionada exista. Devuelve una respuesta con la información de la relación en formato JSON, o un mensaje de error si ocurre algún problema durante el proceso."""
        imparte = ImparteService.retrieve(pk)
        serializer = ImparteSerializer(imparte)
        return Response(serializer.data, status=200)
    
    def create(self, request):
        """Crea una nueva relación de docencia con los datos proporcionados. Valida que el usuario tenga permisos para crear relaciones de docencia, y que se hayan proporcionado los parámetros necesarios para crear la relación. Devuelve una respuesta con la información de la relación recién creada en formato JSON, o un mensaje de error si ocurre algún problema durante el proceso."""
        datos_imparte = request.data
        imparte = ImparteService.create(datos_imparte)
        serializer = ImparteSerializer(imparte)
        return Response(serializer.data, status=201)
    
    def update(self, request, pk=None):
        """Actualiza una relación de docencia existente con los datos proporcionados. Valida que el usuario tenga permisos para actualizar relaciones de docencia, y que se hayan proporcionado los parámetros necesarios para actualizar la relación. Devuelve una respuesta con la información de la relación actualizada en formato JSON, o un mensaje de error si ocurre algún problema durante el proceso."""
        datos_actualizados = request.data
        imparte = ImparteService.update(pk, datos_actualizados)
        serializer = ImparteSerializer(imparte)
        return Response(serializer.data, status=200)
    
    def destroy(self, request, pk=None):
        """Elimina una relación de docencia específica por su identificador. Valida que el usuario tenga permisos para eliminar relaciones de docencia, y que la relación proporcionada exista. Devuelve una respuesta con el estado de la operación."""
        ImparteService.delete(pk)
        return Response(status=204)



            