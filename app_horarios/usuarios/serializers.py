from rest_framework import serializers
from django.contrib.auth.models import Group
from django.contrib.auth import get_user_model

Usuario = get_user_model()

class RolSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Group, utilizado para representar los roles de los usuarios en la aplicación."""
    class Meta:
        model = Group
        fields = ['id', 'name', 'permissions']

class UsuarioSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Usuario, utilizado para representar a los usuarios de la aplicación, incluyendo sus roles y permisos."""
    roles_nombres = serializers.SerializerMethodField()
    
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'groups', 'roles_nombres']

    def get_roles_nombres(self, obj):
        return ", ".join([grupo.name for grupo in obj.groups.all()])