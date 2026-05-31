from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .services import GradoService, AsignaturaService, GrupoService, DocenteService, lista_mini_asignaturas, lista_mini_docentes, lista_mini_grados, lista_mini_grupos

import traceback

# Create your views here.
class GradoViewSet(viewsets.ViewSet):
    
    def listar_grados(self, request):
        grados = GradoService.listar_grados()
        return Response(grados, status=200)

    def obtener_grado_por_id(self, request, pk=None):
        grado = GradoService.obtener_grado_por_id(pk)
        return Response(grado, status=200)

    def crear_grado(self, request):
        datos_grado = request.data
        grado = GradoService.crear_grado(datos_grado)
        return Response(grado, status=201)

    def actualizar_grado(self, request, pk=None):
        datos_actualizados = request.data
        grado = GradoService.actualizar_grado(pk, datos_actualizados)
        return Response(grado, status=200)

    def eliminar_grado(self, request, pk=None):
        GradoService.eliminar_grado(pk)
        return Response(status=204)

class ListaMiniGradosView(APIView):
    def get(self, request, *args, **kwargs):
        grados = lista_mini_grados()
        return Response(grados, status=200)
    
class AsignaturaViewSet(viewsets.ViewSet):

    def listar_asignaturas(self, request):
        asignaturas = AsignaturaService.listar_asignaturas()
        return Response(asignaturas, status=200)

    def obtener_asignatura_por_id(self, request, pk=None):
        asignatura = AsignaturaService.obtener_asignatura_por_id(pk)
        return Response(asignatura, status=200)

    def crear_asignatura(self, request):
        datos_asignatura = request.data
        asignatura = AsignaturaService.crear_asignatura(datos_asignatura)
        return Response(asignatura, status=201)

    def actualizar_asignatura(self, request, pk=None):
        datos_actualizados = request.data
        asignatura = AsignaturaService.actualizar_asignatura(pk, datos_actualizados)
        return Response(asignatura, status=200)

    def eliminar_asignatura(self, request, pk=None):
        AsignaturaService.eliminar_asignatura(pk)
        return Response(status=204)

class ListaMiniAsignaturasView(APIView):
    def get(self, request, *args, **kwargs):
        asignaturas = lista_mini_asignaturas()
        return Response(asignaturas, status=200)

class GrupoViewSet(viewsets.ViewSet):
    
    def lista_grupos(self, request):
        grupos = GrupoService.lista_grupos()
        return Response(grupos, status=200)
    
    def obtener_grupo_por_id(self, request, pk=None):
        grupo = GrupoService.obtener_grupo_por_id(pk)
        return Response(grupo, status=200)
    
    def crear_grupo(self, request):
        datos_grupo = request.data
        grupo = GrupoService.crear_grupo(datos_grupo)
        return Response(grupo, status=201)
    
    def actualizar_grupo(self, request, pk=None):
        datos_actualizados = request.data
        grupo = GrupoService.actualizar_grupo(pk, datos_actualizados)
        return Response(grupo, status=200)
    
    def eliminar_grupo(self, request, pk=None):
        GrupoService.eliminar_grupo(pk)
        return Response(status=204)

class ListaMiniGruposView(APIView):
    def get(self, request, *args, **kwargs):
            grupos = lista_mini_grupos()
            return Response(grupos, status=200)

class DocenteViewSet(viewsets.ViewSet):
    def lista_docentes(self, request):
        docentes = DocenteService.lista_docentes()
        return Response(docentes, status=200)
    
    def obtener_docente_por_id(self, request, pk=None):
        docente = DocenteService.obtener_docente_por_id(pk)
        return Response(docente, status=200)
    
    def crear_docente(self, request):
        datos_docente = request.data
        docente = DocenteService.crear_docente(datos_docente)
        return Response(docente, status=201)
    
    def actualizar_docente(self, request, pk=None):
        datos_actualizados = request.data
        docente = DocenteService.actualizar_docente(pk, datos_actualizados)
        return Response(docente, status=200)
    
    def eliminar_docente(self, request, pk=None):
        DocenteService.eliminar_docente(pk)
        return Response(status=204)

class ListaMiniDocentesView(APIView):
    def get(self, request, *args, **kwargs):
        docentes = lista_mini_docentes()
        return Response(docentes, status=200)



            