from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import CargarCalendarioSerializer

class FormularioCalendarioAPIView(APIView):
    def get(self, request):
        serializer = CargarCalendarioSerializer(data=request.query_params)
        if serializer.is_valid():
            calendario_data = serializer.load_calendar()
            return Response(
                {"message": "Calendario cargado correctamente",
                 "data": calendario_data},
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Create your views here.
