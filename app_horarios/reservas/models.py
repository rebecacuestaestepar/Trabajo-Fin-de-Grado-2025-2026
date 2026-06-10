from django.db import models

from aulas.models import Aula
from calendario.models import Dia
from docencia.models import Grupo
from django.utils import timezone


# Create your models here.

class Reserva(models.Model):
    """Modelo que representa una reserva de un aula en un día y hora determinados. Tiene un estado (pendiente, aceptada, rechazada) y un tipo (puntual o periódica)."""
    idreserva = models.AutoField(db_column='IDRESERVA', primary_key=True)
    id_aula = models.ForeignKey(Aula, models.CASCADE, db_column='ID_AULA')
    id_dia = models.ForeignKey(Dia, models.CASCADE, db_column='ID_DIA')
    estado = models.CharField(db_column='ESTADO', max_length=1, blank=True, null=True)
    tipo = models.CharField(db_column='TIPO', max_length=1, blank=True, null=True)
    hora_inicio = models.TimeField(db_column='HORA_INICIO')
    hora_fin = models.TimeField(db_column='HORA_FIN')
    

    class Meta:
        managed = False
        db_table = 'reserva'


class ReservaPeriodica(models.Model):
    """Modelo que representa una reserva periódica de docencia. Es un modelo heredado de Reserva."""
    id_reserva = models.OneToOneField(Reserva, models.CASCADE, db_column='ID_RESERVA', primary_key=True)
    id_grupo = models.ForeignKey(Grupo, models.CASCADE, db_column='ID_GRUPO', max_length=10)
    dia_semana = models.SmallIntegerField(db_column='DIA_SEMANA')
    fecha_inicio = models.DateField(db_column='FECHA_INICIO') 
    fecha_fin = models.DateField(db_column='FECHA_FIN')
    intervalo_semanas = models.SmallIntegerField(db_column='INTERVALO_SEMANAS')

    class Meta:
        managed = False
        db_table = 'reserva_periodica'



class Responsable(models.Model):
    """Modelo que representa un responsable de una reserva puntual."""
    correo = models.CharField(db_column='CORREO', primary_key=True, max_length=30)
    nombre = models.CharField(db_column='NOMBRE', max_length=20)
    apellidos = models.CharField(db_column='APELLIDOS', max_length=30)
    telefono = models.DecimalField(db_column='TELEFONO', max_digits=9, decimal_places=0, blank=True, null=True)
    codigo_docente = models.CharField(db_column='CODIGO_DOCENTE', unique=True, max_length=9, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'responsable'


class ReservaPuntual(models.Model):
    """Modelo que representa una reserva puntual de un aula. Es un modelo heredado de Reserva."""
    id_reserva = models.OneToOneField(Reserva, models.CASCADE, db_column='ID_RESERVA', primary_key=True)
    id_responsable = models.ForeignKey(Responsable, models.CASCADE, db_column='ID_RESPONSABLE', max_length=30)
    capacidad_solicitada = models.IntegerField(db_column='CAPACIDAD_SOLICITADA', null=True, blank=True)
    motivo = models.CharField(db_column='MOTIVO', max_length=90, blank=True, null=True)
    inicio = models.DateTimeField(db_column='INICIO')
    fin = models.DateTimeField(db_column='FIN')
    num_ordenadores_solicitados = models.PositiveSmallIntegerField(db_column='NUM_ORDENADORES_SOLICITADOS', default=0)
    altavoces_solicitados = models.BooleanField(db_column='ALTAVOCES_SOLICITADOS', default=False)
    proyector_solicitado = models.BooleanField(db_column='PROYECTOR_SOLICITADO', default=False)
    camara_solicitada = models.BooleanField(db_column='CAMARA_SOLICITADA', default=False)
    enchufes_solicitados = models.BooleanField(db_column='ENCHUFES_SOLICITADOS', default=False)
    momento_reserva = models.DateTimeField(db_column='MOMENTO_RESERVA', default=timezone.now)
    observaciones = models.CharField(db_column='OBSERVACIONES', max_length=300, blank=True, null=True) 

    class Meta:
        managed = False
        db_table = 'reserva_puntual'

        # Se añaden permisos personalizados para la aplicación.
        permissions = [
            ("request_reserv_puntual", "Can request reserva puntual"),
            ("change_estado_reserva_puntual", "Can change estado of reserva puntual"),
            ("view_own_reserva_puntual", "Can view own reserva puntual"),
            ("view_own_reserva", "Can view own reserva"),
            ("import_horario", "Can import horario"),
        ]