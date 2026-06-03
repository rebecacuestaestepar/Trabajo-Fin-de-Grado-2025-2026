from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class Usuario(AbstractUser):

    class Meta:
        #managed = False
        db_table = 'usuarios'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'

        permissions = [
            ("view_admin_panel", "Can view admin panel"),
            ("view_menu", "Can view menu"),
        ]
    
    def __str__(self):
        return self.username
    