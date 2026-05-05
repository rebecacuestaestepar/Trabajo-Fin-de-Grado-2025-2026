from django.db import models
from docencia.models import Grado

# Create your models here.

class Aula(models.Model):
    id = models.DecimalField(db_column='ID', primary_key=True, decimal_places=0, max_digits=10)  # Field name made lowercase.
    nombre = models.CharField(db_column='NOMBRE', unique=True, max_length=20)  # Field name made lowercase.
    #nombre_excel = models.CharField(db_column='NOMBRE_EXCEL', max_length=20, blank=True, null=False)  # Field name made lowercase.
    edificio = models.CharField(db_column='EDIFICIO', max_length=6, blank=True, null=True)  # Field name made lowercase.
    planta = models.DecimalField(db_column='PLANTA', max_digits=1, decimal_places=0, blank=True, null=True)  # Field name made lowercase.
    capacidad = models.DecimalField(db_column='CAPACIDAD', max_digits=3, decimal_places=0, blank=True, null=True)  # Field name made lowercase.
    num_ordenadores = models.DecimalField(db_column='NUM_ORDENADORES', max_digits=2, decimal_places=0, blank=True, null=True)  # Field name made lowercase.
    altavoces = models.BooleanField(db_column='ALTAVOCES')  # Field name made lowercase.
    proyector = models.BooleanField(db_column='PROYECTOR')  # Field name made lowercase.
    camara = models.BooleanField(db_column='CAMARA')  # Field name made lowercase.
    enchufes = models.BooleanField(db_column='ENCHUFES', blank=True, null=True)  # Field name made lowercase.
    m2 = models.DecimalField(db_column='M2', max_digits=4, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    otros = models.CharField(db_column='OTROS', max_length=30, blank=True, null=True)  # Field name made lowercase.
    grado_id = models.ForeignKey(Grado, models.CASCADE, db_column='GRADO_ID', max_length=10, blank=True, null=True)  # Field name made lowercase.
    semestre_academico = models.DecimalField(db_column='SEMESTRE_ACADEMICO', max_digits=1, decimal_places=0, blank=True, null=True)  # Field name made lowercase.
    #campus = models.CharField(db_column='CAMPUS', max_length=1, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'aula'