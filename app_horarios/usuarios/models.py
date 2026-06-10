from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class Usuario(AbstractUser):
    """Modelo de usuario personalizado que hereda de AbstractUser. Se utiliza para representar a los usuarios de la aplicación, incluyendo su autenticación a través de Moodle."""

    class Meta:
        db_table = 'usuarios'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'

        permissions = [
            ("view_admin_panel", "Can view admin panel"),
            ("view_menu", "Can view menu"),
        ]
    
    def __str__(self):
        return self.username
    