from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.response import Response

from .services import GradoService

import traceback

# Create your views here.
class GradoViewSet(viewsets.ViewSet):
    def lista_mini_grados(self, request):
        grados = GradoService.lista_mini_grados()
        return Response(grados, status=200)
    
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
    
class AsignaturaViewSet(viewsets.ViewSet):
    def lista_mini_asignaturas(self, request):
        asignaturas = GradoService.lista_mini_asignaturas()
        return Response(asignaturas, status=200)

    def listar_asignaturas(self, request):
        asignaturas = GradoService.listar_asignaturas()
        return Response(asignaturas, status=200)

    def obtener_asignatura_por_id(self, request, pk=None):
        asignatura = GradoService.obtener_asignatura_por_id(pk)
        return Response(asignatura, status=200)

    def crear_asignatura(self, request):
        datos_asignatura = request.data
        asignatura = GradoService.crear_asignatura(datos_asignatura)
        return Response(asignatura, status=201)

    def actualizar_asignatura(self, request, pk=None):
        datos_actualizados = request.data
        asignatura = GradoService.actualizar_asignatura(pk, datos_actualizados)
        return Response(asignatura, status=200)

    def eliminar_asignatura(self, request, pk=None):
        GradoService.eliminar_asignatura(pk)
        return Response(status=204)



            