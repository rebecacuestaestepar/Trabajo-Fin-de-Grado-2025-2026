from django.contrib.auth.models import Group

from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .services import UsuarioService, RolService, lista_mini_permisos, lista_mini_roles
from .serializers import UsuarioSerializer, RolSerializer
from rest_framework.permissions import AllowAny, DjangoModelPermissions, IsAuthenticated

from .models import Usuario

class UsuarioViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, DjangoModelPermissions]
    queryset = Usuario.objects.none()

    def list(self, request):
        """Devuelve una lista de todos los usuarios disponibles en la aplicación, ordenados por su ID."""
        usuarios = UsuarioService.list()
        serializer = UsuarioSerializer(usuarios, many=True)
        return Response(serializer.data, status=200)

    def retrieve(self, request, pk=None):
        """Devuelve un usuario específico basado en su ID. Si el usuario no existe, devuelve un error 404."""
        usuario = UsuarioService.retrieve(pk)
        serializer = UsuarioSerializer(usuario)
        return Response(serializer.data, status=200)
    
    def create(self, request):
        """Crea un nuevo usuario utilizando los datos proporcionados. Los grupos asociados al usuario se establecen después de crear el usuario. No se establece una contraseña para el usuario, ya que se asume que la autenticación se realizará a través de Moodle."""
        serializer = UsuarioSerializer(data=request.data)
        if serializer.is_valid():
            nuevo_usuario = UsuarioService.create(serializer.validated_data)
            return Response(UsuarioSerializer(nuevo_usuario).data, status=201)
        
        return Response(serializer.errors, status=400)

    def update(self, request, pk=None):
        """Actualiza un usuario específico basado en su ID. Si el usuario no existe, devuelve un error 404."""
        usuario = UsuarioService.retrieve(pk)
        serializer = UsuarioSerializer(usuario, data=request.data)
        if serializer.is_valid():
            usuario_actualizado = UsuarioService.update(pk, serializer.validated_data)
            return Response(UsuarioSerializer(usuario_actualizado).data, status=200)
        
        return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None):
        """Elimina un usuario específico basado en su ID. Si el usuario no existe, devuelve un error 404."""
        UsuarioService.delete(pk)
        return Response(status=204)
    
class RolViewSet(viewsets.ViewSet):
    """ViewSet para gestionar los roles (grupos) de la aplicación, incluyendo la creación, actualización, eliminación y listado de roles. Requiere autenticación y permisos específicos para acceder a las diferentes acciones."""
    permission_classes = [IsAuthenticated, DjangoModelPermissions]
    queryset = Group.objects.none()
    def list(self, request):
        roles = RolService.list()
        serializer = RolSerializer(roles, many=True)
        return Response(serializer.data, status=200)

    def retrieve(self, request, pk=None):
        """Devuelve un rol específico basado en su ID. Si el rol no existe, devuelve un error 404."""
        rol = RolService.retrieve(pk)
        serializer = RolSerializer(rol)
        return Response(serializer.data, status=200)
    
    def create(self, request):
        """Crea un nuevo rol (grupo) utilizando los datos proporcionados. Los permisos asociados al rol se establecen después de crear el grupo."""
        serializer = RolSerializer(data=request.data)
        if serializer.is_valid():
            nuevo_rol = RolService.create(serializer.validated_data)
            return Response(RolSerializer(nuevo_rol).data, status=201)
        
        return Response(serializer.errors, status=400)

    def update(self, request, pk=None):
        """Actualiza un rol específico basado en su ID. Si el rol no existe, devuelve un error 404."""
        rol = RolService.retrieve(pk)
        serializer = RolSerializer(rol, data=request.data)
        if serializer.is_valid():
            rol_actualizado = RolService.update(pk, serializer.validated_data)
            return Response(RolSerializer(rol_actualizado).data, status=200)
        
        return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None):
        """Elimina un rol específico basado en su ID. Si el rol no existe, devuelve un error 404."""
        RolService.delete(pk)
        return Response(status=204)
    
class ListaMiniRolesAPIView(APIView):
    """APIView para obtener una lista de todos los roles (grupos) disponibles en la aplicación, ordenados por su nombre."""
    def get(self, request, *args, **kwargs):
        roles = lista_mini_roles()
        return Response(roles, status=200)
    
class ListaMiniPermisosAPIView(APIView):
    """APIView para obtener una lista de todos los permisos disponibles en la aplicación, ordenados por su etiqueta de aplicación y nombre."""
    def get(self, request, *args, **kwargs):
        permisos = lista_mini_permisos()
        return Response(permisos, status=200)


class LoginUniversidadAPIView(APIView):
    """
    APIView para manejar el proceso de inicio de sesión de los usuarios utilizando las credenciales de Moodle. Si la autenticación es exitosa, devuelve un token JWT junto con la información del usuario, incluyendo sus roles y permisos.
    """
    permission_classes = [AllowAny]
    def post(self, request):
        usuario = request.data.get('username')
        contrasena = request.data.get('password')

        if not usuario or not contrasena:
            return Response({'error': 'Por favor, introduce tu usuario y contraseña'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=usuario, password=contrasena)

        if user is not None:
            permisos_completos = user.get_all_permissions()
            permisos_simples = [permiso.split('.')[1] for permiso in permisos_completos]
            refresh = RefreshToken.for_user(user)
            roles_usuario = list(user.groups.values_list('name', flat=True))
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'usuario': {
                    'username': user.username,
                    'nombre': user.first_name,
                    'apellidos': user.last_name,
                    'roles': roles_usuario,
                    'permisos': permisos_simples,              
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Credenciales inválidas'}, status=status.HTTP_401_UNAUTHORIZED)
