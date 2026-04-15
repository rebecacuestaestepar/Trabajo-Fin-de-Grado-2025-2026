from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model
from .moodle_api import ClienteMoodle
from django.conf import settings

User = get_user_model()

class BackendUniversidadMoodle(BaseBackend):
    def authenticate(self, request, username=None, password=None):
        host = getattr(settings, 'MOODLE_HOST', 'https://ubuvirtual.ubu.es')
        moodle = ClienteMoodle(host)

        token = moodle.obtener_token(username, password)

        if not token:
            return None

        info_usuario = moodle.obtener_info_usuarios(token)
        if not info_usuario or 'username' not in info_usuario:
            return None
        
        nombre_usuario_moodle = info_usuario['username']

        try:
            usuario = User.objects.get(username=nombre_usuario_moodle)
        except User.DoesNotExist:
            usuario = User(username=nombre_usuario_moodle)
            usuario.set_unusable_password()
            usuario.first_name = info_usuario.get('firstname', '')
            usuario.last_name = info_usuario.get('lastname', '')
            usuario.save()
        return usuario
    
    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None