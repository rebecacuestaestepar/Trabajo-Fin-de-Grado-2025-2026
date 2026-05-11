from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from calendario.services import generar_calendario_academico
from .serializers import CargarCalendarioSerializer

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

# Create your views here.
