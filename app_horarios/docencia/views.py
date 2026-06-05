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
        grados = GradoService.list()
        serializer = GradoSerializer(grados, many=True)
        return Response(serializer.data, status=200)

    def retrieve(self, request, pk=None):
        grado = GradoService.retrieve(pk)
        serializer = GradoSerializer(grado)
        return Response(serializer.data, status=200)

    def create(self, request):
        datos_grado = request.data
        grado = GradoService.create(datos_grado)
        serializer = GradoSerializer(grado)
        return Response(serializer.data, status=201)

    def update(self, request, pk=None):
        datos_actualizados = request.data
        grado = GradoService.update(pk, datos_actualizados)
        serializer = GradoSerializer(grado)
        return Response(serializer.data, status=200)

    def destroy(self, request, pk=None):
        GradoService.delete(pk)
        return Response(status=204)

class ListaMiniGradosView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
        grados = lista_mini_grados()
        return Response(grados, status=200)
    
class AsignaturaViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, DjangoModelPermissions]
    queryset = Asignaturas.objects.none()

    def list(self, request):
        asignaturas = AsignaturaService.list()
        serializer = AsignaturaSerializer(asignaturas, many=True)
        return Response(serializer.data, status=200)

    def retrieve(self, request, pk=None):
        asignatura = AsignaturaService.retrieve(pk)
        serializer = AsignaturaSerializer(asignatura)
        return Response(serializer.data, status=200)

    def create(self, request):
        datos_asignatura = request.data
        asignatura = AsignaturaService.create(datos_asignatura)
        serializer = AsignaturaSerializer(asignatura)
        return Response(serializer.data, status=201)

    def update(self, request, pk=None):
        datos_actualizados = request.data
        asignatura = AsignaturaService.update(pk, datos_actualizados)
        serializer = AsignaturaSerializer(asignatura)
        return Response(serializer.data, status=200)

    def destroy(self, request, pk=None):
        AsignaturaService.delete(pk)
        return Response(status=204)

class ListaMiniAsignaturasView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
        asignaturas = lista_mini_asignaturas()
        return Response(asignaturas, status=200)

class GrupoViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, DjangoModelPermissions]
    queryset = Grupo.objects.none()

    def list(self, request):
        grupos = GrupoService.list()
        serializer = GrupoSerializer(grupos, many=True)
        return Response(serializer.data, status=200)
    
    def retrieve(self, request, pk=None):
        grupo = GrupoService.retrieve(pk)
        serializer = GrupoSerializer(grupo)
        return Response(serializer.data, status=200)
    
    def create(self, request):
        datos_grupo = request.data
        grupo = GrupoService.create(datos_grupo)
        serializer = GrupoSerializer(grupo)
        return Response(serializer.data, status=201)
    
    def update(self, request, pk=None):
        datos_actualizados = request.data
        grupo = GrupoService.update(pk, datos_actualizados)
        serializer = GrupoSerializer(grupo)
        return Response(serializer.data, status=200)
    
    def destroy(self, request, pk=None):
        GrupoService.delete(pk)
        return Response(status=204)

class ListaMiniGruposView(APIView):
    def get(self, request, *args, **kwargs):
            grupos = lista_mini_grupos()
            return Response(grupos, status=200)

class DocenteViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, DjangoModelPermissions]
    queryset = Docente.objects.none()
    def list(self, request):
        docentes = DocenteService.list()
        serializer = DocenteSerializer(docentes, many=True)
        return Response(serializer.data, status=200)

    def retrieve(self, request, pk=None):
        docente = DocenteService.retrieve(pk)
        serializer = DocenteSerializer(docente)
        return Response(serializer.data, status=200)
    
    def create(self, request):
        datos_docente = request.data
        docente = DocenteService.create(datos_docente)
        serializer = DocenteSerializer(docente)
        return Response(serializer.data, status=201)
    
    def update(self, request, pk=None):
        datos_actualizados = request.data
        docente = DocenteService.update(pk, datos_actualizados)
        serializer = DocenteSerializer(docente)
        return Response(serializer.data, status=200)

    def destroy(self, request, pk=None):
        DocenteService.delete(pk)
        return Response(status=204)

class ListaMiniDocentesView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
        docentes = lista_mini_docentes()
        return Response(docentes, status=200)
    
class ImparteViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, DjangoModelPermissions]
    queryset = Imparte.objects.none()

    def list(self, request):
        imparte = ImparteService.list()
        serializer = ImparteSerializer(imparte, many=True)
        return Response(serializer.data, status=200)



            