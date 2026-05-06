from django.db import models

from aulas.models import Aula
from calendario.models import Dia
from docencia.models import Asignaturas
from django.utils import timezone


# Create your models here.

class Reserva(models.Model):
    idreserva = models.CharField(db_column='IDRESERVA', primary_key=True, max_length=12)  # Field name made lowercase.
    id_aula = models.ForeignKey(Aula, models.CASCADE, db_column='ID_AULA')  # Field name made lowercase.
    id_dia = models.ForeignKey(Dia, models.CASCADE, db_column='ID_DIA')  # Field name made lowercase.
    estado = models.CharField(db_column='ESTADO', max_length=1, blank=True, null=True)  # Field name made lowercase.
    tipo = models.CharField(db_column='TIPO', max_length=1, blank=True, null=True)  # Field name made lowercase.
    hora_inicio = models.TimeField(db_column='HORA_INICIO')  # Field name made lowercase.
    hora_fin = models.TimeField(db_column='HORA_FIN')  # Field name made lowercase.
    

    class Meta:
        managed = False
        db_table = 'reserva'

    @classmethod
    
    def next_id(cls):
        ultimo = cls.objects.aggregate(max_id=models.Max('idreserva'))['max_id']
        if not ultimo:
            return 'R0001'
        numero = int(ultimo[1:]) + 1
        return f'R{numero:04d}'



class ReservaPeriodica(models.Model):
    id_reserva = models.OneToOneField(Reserva, models.CASCADE, db_column='ID_RESERVA', primary_key=True)  # Field name made lowercase.
    id_grupo = models.ForeignKey(Asignaturas, models.CASCADE, db_column='ID_GRUPO', max_length=10)  # Field name made lowercase.
    dia_semana = models.SmallIntegerField(db_column='DIA_SEMANA')  # Field name made lowercase.
    fecha_inicio = models.DateField(db_column='FECHA_INICIO')  # Field name made lowercase.
    fecha_fin = models.DateField(db_column='FECHA_FIN')  # Field name made lowercase.
    intervalo_semanas = models.SmallIntegerField(db_column='INTERVALO_SEMANAS')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'reserva_periodica'



class Responsable(models.Model):
    correo = models.CharField(db_column='CORREO', primary_key=True, max_length=30)  # Field name made lowercase.
    nombre = models.CharField(db_column='NOMBRE', max_length=20)  # Field name made lowercase.
    apellidos = models.CharField(db_column='APELLIDOS', max_length=30)  # Field name made lowercase.
    telefono = models.DecimalField(db_column='TELEFONO', max_digits=9, decimal_places=0, blank=True, null=True)  # Field name made lowercase.
    codigo_docente = models.CharField(db_column='CODIGO_DOCENTE', unique=True, max_length=9, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'responsable'


class ReservaPuntual(models.Model):
    id_reserva = models.OneToOneField(Reserva, models.CASCADE, db_column='ID_RESERVA', primary_key=True)  # Field name made lowercase.
    id_responsable = models.ForeignKey(Responsable, models.CASCADE, db_column='ID_RESPONSABLE', max_length=30)  # Field name made lowercase.
    capacidad_solicitada = models.IntegerField(db_column='CAPACIDAD_SOLICITADA', null=True, blank=True)  # Field name made lowercase.
    motivo = models.CharField(db_column='MOTIVO', max_length=90, blank=True, null=True)  # Field name made lowercase.
    inicio = models.DateTimeField(db_column='INICIO')  # Field name made lowercase.
    fin = models.DateTimeField(db_column='FIN')  # Field name made lowercase.
    num_ordenadores_solicitados = models.PositiveSmallIntegerField(db_column='NUM_ORDENADORES_SOLICITADOS', default=0)  # Field name made lowercase.
    altavoces_solicitados = models.BooleanField(db_column='ALTAVOCES_SOLICITADOS', default=False)  # Field name made lowercase.
    proyector_solicitado = models.BooleanField(db_column='PROYECTOR_SOLICITADO', default=False)  # Field name made lowercase.
    camara_solicitada = models.BooleanField(db_column='CAMARA_SOLICITADA', default=False)  # Field name made lowercase.
    enchufes_solicitados = models.BooleanField(db_column='ENCHUFES_SOLICITADOS', default=False)  # Field name made lowercase.
    momento_reserva = models.DateTimeField(db_column='MOMENTO_RESERVA', default=timezone.now)  # Field name made lowercase.
    observaciones = models.CharField(db_column='OBSERVACIONES', max_length=300, blank=True, null=True) 

    class Meta:
        managed = False
        db_table = 'reserva_puntual'