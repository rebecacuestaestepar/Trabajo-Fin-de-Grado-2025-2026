from django.shortcuts import get_object_or_404
from django.contrib.auth.models import Group, Permission
from django.contrib.auth import get_user_model

Usuario = get_user_model()

class RolService:
    @staticmethod
    def list():
        """Devuelve una lista de todos los roles (grupos) disponibles en la aplicación, ordenados por su ID."""
        return Group.objects.all().order_by('id')
        

    @staticmethod
    def retrieve(rol_id):
        """Devuelve un rol específico basado en su ID. Si el rol no existe, devuelve un error 404."""
        return get_object_or_404(Group, id=rol_id)

    @staticmethod
    def create(datos):
        """Crea un nuevo rol (grupo) utilizando los datos proporcionados. Los permisos asociados al rol se establecen después de crear el grupo."""
        permisos = datos.pop('permissions', [])
        rol = Group.objects.create(**datos)
        rol.permissions.set(permisos)
        return rol

    @staticmethod
    def update(rol_id, datos):
        """Actualiza un rol específico basado en su ID. Si el rol no existe, devuelve un error 404."""
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
        """Elimina un rol específico basado en su ID. Si el rol no existe, devuelve un error 404."""
        rol = get_object_or_404(Group, id=rol_id)
        rol.delete()


def lista_mini_roles():
    """Devuelve una lista de todos los roles (grupos) disponibles en la aplicación, ordenados por su nombre."""
    return list(Group.objects.values('id', 'name').order_by('name'))


class UsuarioService:
    @staticmethod
    def list():
        """Devuelve una lista de todos los usuarios disponibles en la aplicación, ordenados por su ID."""
        return Usuario.objects.all().order_by('id')

    @staticmethod
    def retrieve(usuario_id):
        """Devuelve un usuario específico basado en su ID. Si el usuario no existe, devuelve un error 404."""
        return get_object_or_404(Usuario, id=usuario_id)

    @staticmethod
    def create(datos):
        """Crea un nuevo usuario utilizando los datos proporcionados. Los grupos asociados al usuario se establecen después de crear el usuario. No se establece una contraseña para el usuario, ya que se asume que la autenticación se realizará a través de Moodle."""
        grupos = datos.pop('groups', [])
        
        usuario = Usuario(**datos)
        
        usuario.set_unusable_password()            
        usuario.save()
        
        if grupos:
            usuario.groups.set(grupos)
            
        return usuario

    @staticmethod
    def update(usuario_id, datos):
        """Actualiza un usuario específico basado en su ID. Si el usuario no existe, devuelve un error 404."""
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
        """Elimina un usuario específico basado en su ID. Si el usuario no existe, devuelve un error 404."""
        usuario = get_object_or_404(Usuario, id=usuario_id)
        usuario.delete()

def lista_mini_permisos():
        """Devuelve una lista de todos los permisos disponibles en la aplicación, ordenados por su etiqueta de aplicación y nombre."""
        return list(Permission.objects.values('id', 'name', 'content_type__app_label').order_by('content_type__app_label', 'name'))