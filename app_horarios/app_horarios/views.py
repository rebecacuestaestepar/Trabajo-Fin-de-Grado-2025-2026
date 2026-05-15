from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from calendario.models import Curso

class ListaHorariosView(APIView):
    def get(self, request):
        horarios_cargados = Curso.objects.filter(horario_cargado=True).order_by('-idcurso')

        datos = []

        for h in horarios_cargados:
            datos.append({
                'idcurso': h.idcurso,
                'horario_cargado': h.horario_cargado
            })
        return Response(datos, status=200)
