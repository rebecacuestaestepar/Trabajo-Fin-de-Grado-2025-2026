from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .services import UsuarioService, RolService, lista_mini_permisos, lista_mini_roles
from .serializers import UsuarioSerializer, RolSerializer

class UsuarioViewSet(viewsets.ViewSet):
    def list(self, request):
        usuarios = UsuarioService.list()
        serializer = UsuarioSerializer(usuarios, many=True)
        return Response(serializer.data, status=200)

    def retrieve(self, request, pk=None):
        usuario = UsuarioService.retrieve(pk)
        serializer = UsuarioSerializer(usuario)
        return Response(serializer.data, status=200)
    
    def create(self, request):
        serializer = UsuarioSerializer(data=request.data)
        if serializer.is_valid():
            nuevo_usuario = UsuarioService.create(serializer.validated_data)
            return Response(UsuarioSerializer(nuevo_usuario).data, status=201)
        
        return Response(serializer.errors, status=400)

    def update(self, request, pk=None):
        usuario = UsuarioService.retrieve(pk)
        serializer = UsuarioSerializer(usuario, data=request.data)
        if serializer.is_valid():
            usuario_actualizado = UsuarioService.update(pk, serializer.validated_data)
            return Response(UsuarioSerializer(usuario_actualizado).data, status=200)
        
        return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None):
        UsuarioService.delete(pk)
        return Response(status=204)
    
class RolViewSet(viewsets.ViewSet):
    def list(self, request):
        roles = RolService.list()
        serializer = RolSerializer(roles, many=True)
        return Response(serializer.data, status=200)

    def retrieve(self, request, pk=None):
        rol = RolService.retrieve(pk)
        serializer = RolSerializer(rol)
        return Response(serializer.data, status=200)
    
    def create(self, request):
        serializer = RolSerializer(data=request.data)
        if serializer.is_valid():
            nuevo_rol = RolService.create(serializer.validated_data)
            return Response(RolSerializer(nuevo_rol).data, status=201)
        
        return Response(serializer.errors, status=400)

    def update(self, request, pk=None):
        rol = RolService.retrieve(pk)
        serializer = RolSerializer(rol, data=request.data)
        if serializer.is_valid():
            rol_actualizado = RolService.update(pk, serializer.validated_data)
            return Response(RolSerializer(rol_actualizado).data, status=200)
        
        return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None):
        RolService.delete(pk)
        return Response(status=204)
    
class ListaMiniRolesAPIView(APIView):
    def get(self, request, *args, **kwargs):
        roles = lista_mini_roles()
        return Response(roles, status=200)
    
class ListaMiniPermisosAPIView(APIView):
    def get(self, request, *args, **kwargs):
        permisos = lista_mini_permisos()
        return Response(permisos, status=200)


class LoginUniversidadAPIView(APIView):
    def post(self, request):
        usuario = request.data.get('username')
        contrasena = request.data.get('password')

        if not usuario or not contrasena:
            return Response({'error': 'Por favor, introduce tu usuario y contraseña'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=usuario, password=contrasena)

        if user is not None:
            refresh = RefreshToken.for_user(user)
            roles_usuario = list(user.groups.values_list('name', flat=True))
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'usuario': {
                    'username': user.username,
                    'nombre': user.first_name,
                    'apellidos': user.last_name,
                    'roles': roles_usuario                
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Credenciales inválidas'}, status=status.HTTP_401_UNAUTHORIZED)

# Create your views here.
