from django.db import models
from docencia.models import Grado

# Create your models here.

class Aula(models.Model):
    """
    Representa un aula física en la universidad.
    Modelo mapeado a una tabla preexistente de la base de datos ('aula') y su ciclo de vida no es  gestionado por las migracions de Django.
    """
    id = models.DecimalField(db_column='ID', primary_key=True, decimal_places=0, max_digits=10)
    nombre = models.CharField(db_column='NOMBRE', unique=True, max_length=20)
    edificio = models.CharField(db_column='EDIFICIO', max_length=6, blank=True, null=True)
    planta = models.DecimalField(db_column='PLANTA', max_digits=1, decimal_places=0, blank=True, null=True)
    capacidad = models.DecimalField(db_column='CAPACIDAD', max_digits=3, decimal_places=0, blank=True, null=True)
    num_ordenadores = models.DecimalField(db_column='NUM_ORDENADORES', max_digits=2, decimal_places=0, blank=True, null=True)
    altavoces = models.BooleanField(db_column='ALTAVOCES')
    proyector = models.BooleanField(db_column='PROYECTOR')
    camara = models.BooleanField(db_column='CAMARA')
    enchufes = models.BooleanField(db_column='ENCHUFES', blank=True, null=True)
    m2 = models.DecimalField(db_column='M2', max_digits=4, decimal_places=2, blank=True, null=True)
    otros = models.CharField(db_column='OTROS', max_length=30, blank=True, null=True)
    grado_id = models.ForeignKey(Grado, models.CASCADE, db_column='GRADO_ID', max_length=10, blank=True, null=True)
    semestre_academico = models.DecimalField(db_column='SEMESTRE_ACADEMICO', max_digits=1, decimal_places=0, blank=True, null=True)
    campus = models.CharField(db_column='CAMPUS', max_length=1, blank=True, null=True)

    class Meta:
        managed = False # Django no creará ni modificará esta tabla en base de datos, solo la usará para consultas
        db_table = 'aula'

        permissions = [
            ("view_ocupacion_aula", "Can view occupation of aula"),
        ]