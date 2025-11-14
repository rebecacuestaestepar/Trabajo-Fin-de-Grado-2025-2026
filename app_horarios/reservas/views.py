from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import ReservaPuntualCreateSerializer

class SolicitarReservaPuntualAPIView(APIView):
    def post(self, request):
        serializer = ReservaPuntualCreateSerializer(data=request.data)
        if serializer.is_valid():
            reserva_puntual = serializer.save()
            return Response(
                {"message": "Reserva puntual creada correctamente"},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Create your views here.
