from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from reservas.excel_parser import parsear_horario_excel
from reservas.services_excel import generar_reservas_periodicas

# Create your views here.
class CargarHorarioExcelView(APIView):
    parser_clases = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        fichero = request.FILES.get('fichero')
        curso = request.data.get('curso')