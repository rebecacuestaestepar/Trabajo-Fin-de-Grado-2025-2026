# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class Asignaturas(models.Model):
    idasignatura = models.CharField(db_column='IDASIGNATURA', primary_key=True, max_length=10)  # Field name made lowercase.
    nombre = models.CharField(db_column='NOMBRE', max_length=30)  # Field name made lowercase.
    abreviatura = models.CharField(db_column='ABREVIATURA', max_length=20, blank=True, null=True)  # Field name made lowercase.
    curso_grado = models.IntegerField(db_column='CURSO_GRADO')  # Field name made lowercase.
    semestre_academico = models.IntegerField(db_column='SEMESTRE_ACADEMICO')  # Field name made lowercase.
    ects = models.IntegerField(db_column='ECTS')  # Field name made lowercase.
    grado_id = models.CharField(db_column='GRADO_ID', max_length=10)  # Field name made lowercase.
    tipo = models.CharField(db_column='TIPO', max_length=1, blank=True, null=True)  # Field name made lowercase.
    horas_practicas = models.IntegerField(db_column='HORAS_PRACTICAS', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'asignaturas'


class Aula(models.Model):
    nombre = models.CharField(db_column='NOMBRE', primary_key=True, max_length=20)  # Field name made lowercase.
    edificio = models.CharField(db_column='EDIFICIO', max_length=6, blank=True, null=True)  # Field name made lowercase.
    planta = models.DecimalField(db_column='PLANTA', max_digits=1, decimal_places=0, blank=True, null=True)  # Field name made lowercase.
    capacidad = models.IntegerField(db_column='CAPACIDAD', blank=True, null=True)  # Field name made lowercase.
    num_ordenadores = models.IntegerField(db_column='NUM_ORDENADORES', blank=True, null=True)  # Field name made lowercase.
    altavoces = models.IntegerField(db_column='ALTAVOCES')  # Field name made lowercase.
    proyector = models.IntegerField(db_column='PROYECTOR')  # Field name made lowercase.
    camara = models.IntegerField(db_column='CAMARA')  # Field name made lowercase.
    enchufes = models.IntegerField(db_column='ENCHUFES', blank=True, null=True)  # Field name made lowercase.
    m2 = models.IntegerField(db_column='M2', blank=True, null=True)  # Field name made lowercase.
    otros = models.CharField(db_column='OTROS', max_length=30, blank=True, null=True)  # Field name made lowercase.
    grado_id = models.CharField(db_column='GRADO_ID', max_length=10, blank=True, null=True)  # Field name made lowercase.
    semestre_academico = models.IntegerField(db_column='SEMESTRE_ACADEMICO', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'aula'


class CambioDocencia(models.Model):
    id_dia = models.OneToOneField('Dia', models.DO_NOTHING, db_column='ID_DIA', primary_key=True)  # Field name made lowercase.
    sustituye_dia = models.IntegerField(db_column='SUSTITUYE_DIA', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'cambio_docencia'


class Curso(models.Model):
    idcurso = models.CharField(db_column='IDCURSO', primary_key=True, max_length=10)  # Field name made lowercase.
    fecha_inicio = models.DateField(db_column='FECHA_INICIO')  # Field name made lowercase.
    fecha_fin = models.DateField(db_column='FECHA_FIN')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'curso'


class Dia(models.Model):
    dia = models.DateField(db_column='DIA', primary_key=True)  # Field name made lowercase.
    id_semestre = models.CharField(db_column='ID_SEMESTRE', max_length=10)  # Field name made lowercase.
    dia_semana = models.IntegerField(db_column='DIA_SEMANA', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'dia'


class Docente(models.Model):
    codigo = models.CharField(db_column='CODIGO', primary_key=True, max_length=9)  # Field name made lowercase.
    nombre = models.CharField(db_column='NOMBRE', max_length=30)  # Field name made lowercase.
    apellidos = models.CharField(db_column='APELLIDOS', max_length=100)  # Field name made lowercase.
    correo = models.CharField(db_column='CORREO', max_length=30)  # Field name made lowercase.
    telefono = models.CharField(db_column='TELEFONO', max_length=9, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'docente'


class Examen(models.Model):
    id_dia = models.OneToOneField(Dia, models.DO_NOTHING, db_column='ID_DIA', primary_key=True)  # Field name made lowercase.
    convocatoria = models.IntegerField(db_column='CONVOCATORIA', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'examen'


class Festivo(models.Model):
    id_dia = models.OneToOneField(Dia, models.DO_NOTHING, db_column='ID_DIA', primary_key=True)  # Field name made lowercase.
    nombre = models.CharField(db_column='NOMBRE', max_length=50, blank=True, null=True)  # Field name made lowercase.
    alcance = models.CharField(db_column='ALCANCE', max_length=10, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'festivo'


class Grado(models.Model):
    idgrado = models.CharField(db_column='IDGRADO', primary_key=True, max_length=10)  # Field name made lowercase.
    nombre = models.CharField(db_column='NOMBRE', max_length=80)  # Field name made lowercase.
    abreviatura = models.CharField(db_column='ABREVIATURA', max_length=20)  # Field name made lowercase.
    coordinador = models.CharField(db_column='COORDINADOR', max_length=30, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'grado'


class Grupo(models.Model):
    grupoid = models.CharField(db_column='GRUPOID', primary_key=True, max_length=10)  # Field name made lowercase.
    nombre = models.CharField(db_column='NOMBRE', max_length=3, blank=True, null=True)  # Field name made lowercase.
    id_asignatura = models.CharField(db_column='ID_ASIGNATURA', max_length=10)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'grupo'


class Imparte(models.Model):
    codigo_docente = models.CharField(db_column='CODIGO_DOCENTE', primary_key=True, max_length=9)  # Field name made lowercase.
    id_asignatura = models.CharField(db_column='ID_ASIGNATURA', max_length=10)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'imparte'
        unique_together = (('codigo_docente', 'id_asignatura'),)


class Lectivo(models.Model):
    id_dia = models.OneToOneField(Dia, models.DO_NOTHING, db_column='ID_DIA', primary_key=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'lectivo'


class Reserva(models.Model):
    idreserva = models.CharField(db_column='IDRESERVA', primary_key=True, max_length=5)  # Field name made lowercase.
    nombre_aula = models.CharField(db_column='NOMBRE_AULA', max_length=8)  # Field name made lowercase.
    id_dia = models.DateField(db_column='ID_DIA')  # Field name made lowercase.
    momento_reserva = models.DateTimeField(db_column='MOMENTO_RESERVA')  # Field name made lowercase.
    estado = models.CharField(db_column='ESTADO', max_length=1, blank=True, null=True)  # Field name made lowercase.
    tipo = models.CharField(db_column='TIPO', max_length=1, blank=True, null=True)  # Field name made lowercase.
    hora_inicio = models.TimeField(db_column='HORA_INICIO')  # Field name made lowercase.
    hora_fin = models.TimeField(db_column='HORA_FIN')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'reserva'


class ReservaPeriodica(models.Model):
    id_reserva = models.CharField(db_column='ID_RESERVA', primary_key=True, max_length=12)  # Field name made lowercase.
    id_asignatura = models.CharField(db_column='ID_ASIGNATURA', max_length=10)  # Field name made lowercase.
    dia_semana = models.IntegerField(db_column='DIA_SEMANA')  # Field name made lowercase.
    fecha_inicio = models.DateField(db_column='FECHA_INICIO')  # Field name made lowercase.
    fecha_fin = models.DateField(db_column='FECHA_FIN')  # Field name made lowercase.
    intervalo_semanas = models.IntegerField(db_column='INTERVALO_SEMANAS')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'reserva_periodica'


class ReservaPuntual(models.Model):
    id_reserva = models.CharField(db_column='ID_RESERVA', primary_key=True, max_length=12)  # Field name made lowercase.
    id_responsable = models.CharField(db_column='ID_RESPONSABLE', max_length=9)  # Field name made lowercase.
    motivo = models.CharField(db_column='MOTIVO', max_length=90, blank=True, null=True)  # Field name made lowercase.
    inicio = models.DateTimeField(db_column='INICIO')  # Field name made lowercase.
    fin = models.DateTimeField(db_column='FIN')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'reserva_puntual'


class Responsable(models.Model):
    correo = models.CharField(db_column='CORREO', primary_key=True, max_length=30)  # Field name made lowercase.
    nombre = models.CharField(db_column='NOMBRE', max_length=20)  # Field name made lowercase.
    apellidos = models.CharField(db_column='APELLIDOS', max_length=30)  # Field name made lowercase.
    telefono = models.DecimalField(db_column='TELEFONO', max_digits=9, decimal_places=0, blank=True, null=True)  # Field name made lowercase.
    codigo_docente = models.CharField(db_column='CODIGO_DOCENTE', unique=True, max_length=9, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'responsable'


class Semestre(models.Model):
    idsemestre = models.CharField(db_column='IDSEMESTRE', primary_key=True, max_length=10)  # Field name made lowercase.
    curso_id = models.CharField(db_column='CURSO_ID', max_length=10)  # Field name made lowercase.
    numero = models.JSONField(db_column='NUMERO', blank=True, null=True)  # Field name made lowercase.
    fecha_inicio = models.DateField(db_column='FECHA_INICIO')  # Field name made lowercase.
    fecha_fin = models.DateField(db_column='FECHA_FIN')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'semestre'


class Tfg(models.Model):
    id_dia = models.OneToOneField(Dia, models.DO_NOTHING, db_column='ID_DIA', primary_key=True)  # Field name made lowercase.
    convocatoria = models.IntegerField(db_column='CONVOCATORIA', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'tfg'
