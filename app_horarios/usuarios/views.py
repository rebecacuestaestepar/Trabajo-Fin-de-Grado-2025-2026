from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

class LoginUniversidadAPIView(APIView):
    def post(self, request):
        usuario = request.data.get('username')
        contrasena = request.data.get('password')

        if not usuario or not contrasena:
            return Response({'error': 'Por favor, introduce tu usuario y contraseña'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=usuario, password=contrasena)

        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'usuario': {
                    'username': user.username,
                    'nombre': user.first_name,
                    'apellidos': user.last_name,
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Credenciales inválidas'}, status=status.HTTP_401_UNAUTHORIZED)

# Create your views here.
