from django.shortcuts import get_object_or_404
from django.contrib.auth.models import Group, Permission
from django.contrib.auth import get_user_model

Usuario = get_user_model()

class RolService:
    @staticmethod
    def list():
        return Group.objects.all().order_by('id')
        

    @staticmethod
    def retrieve(rol_id):
        return get_object_or_404(Group, id=rol_id)

    @staticmethod
    def create(datos):
        permisos = datos.pop('permissions', [])
        rol = Group.objects.create(**datos)
        rol.permissions.set(permisos)
        return rol

    @staticmethod
    def update(rol_id, datos):
        rol = get_object_or_404(Group, id=rol_id)
        permisos = datos.pop('permissions', None)
        for campo, valor in datos.items():
            setattr(rol, campo, valor)
        rol.save()
        if permisos is not None:
            rol.permissions.set(permisos)
        return rol

    @staticmethod
    def delete(rol_id):
        rol = get_object_or_404(Group, id=rol_id)
        rol.delete()


def lista_mini_roles():
    return list(Group.objects.values('id', 'name').order_by('name'))


class UsuarioService:
    @staticmethod
    def list():
        return Usuario.objects.all().order_by('id')

    @staticmethod
    def retrieve(usuario_id):
        return get_object_or_404(Usuario, id=usuario_id)

    @staticmethod
    def create(datos):
        grupos = datos.pop('groups', [])
        
        usuario = Usuario(**datos)
        
        usuario.set_unusable_password()            
        usuario.save()
        
        if grupos:
            usuario.groups.set(grupos)
            
        return usuario

    @staticmethod
    def update(usuario_id, datos):
        usuario = get_object_or_404(Usuario, id=usuario_id)
        
        grupos = datos.pop('groups', None)
        
        for campo, valor in datos.items():
            setattr(usuario, campo, valor)            
        usuario.save()
        
        if grupos is not None:
            usuario.groups.set(grupos)
            
        return usuario

    @staticmethod
    def delete(usuario_id):
        usuario = get_object_or_404(Usuario, id=usuario_id)
        usuario.delete()

def lista_mini_permisos():
        return list(Permission.objects.values('id', 'name', 'content_type__app_label').order_by('content_type__app_label', 'name'))