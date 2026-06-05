from django.db import models

# Create your models here.

class Grado(models.Model):
    idgrado = models.CharField(db_column='IDGRADO', primary_key=True, max_length=10)  # Field name made lowercase.
    nombre = models.CharField(db_column='NOMBRE', max_length=80)  # Field name made lowercase.
    abreviatura = models.CharField(db_column='ABREVIATURA', max_length=20)  # Field name made lowercase.
    coordinador = models.CharField(db_column='COORDINADOR', max_length=30, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'grado'

class Asignaturas(models.Model):
    idasignatura = models.CharField(db_column='IDASIGNATURA', primary_key=True, max_length=10)  # Field name made lowercase.
    nombre = models.CharField(db_column='NOMBRE', max_length=30)  # Field name made lowercase.
    abreviatura = models.CharField(db_column='ABREVIATURA', max_length=20, blank=True, null=True)  # Field name made lowercase.
    curso_grado = models.IntegerField(db_column='CURSO_GRADO')  # Field name made lowercase.
    semestre_academico = models.IntegerField(db_column='SEMESTRE_ACADEMICO')  # Field name made lowercase.
    ects = models.IntegerField(db_column='ECTS')  # Field name made lowercase.
    grado_id = models.ForeignKey(Grado, models.CASCADE, db_column='GRADO_ID', max_length=10)  # Field name made lowercase.
    tipo = models.CharField(db_column='TIPO', max_length=1, blank=True, null=True)  # Field name made lowercase.
    horas_practicas = models.IntegerField(db_column='HORAS_PRACTICAS', blank=True, null=True)  # Field name made lowercase.
    docentes_imparten = models.ManyToManyField('Docente', through='Imparte', related_name='asignaturas')

    class Meta:
        managed = False
        db_table = 'asignaturas'

class Docente(models.Model):
    codigo = models.AutoField(db_column='CODIGO', primary_key=True)  # Field name made lowercase.
    nombre = models.CharField(db_column='NOMBRE', max_length=30)  # Field name made lowercase.
    apellidos = models.CharField(db_column='APELLIDOS', max_length=100)  # Field name made lowercase.
    correo = models.CharField(db_column='CORREO', max_length=30)  # Field name made lowercase.
    telefono = models.CharField(db_column='TELEFONO', max_length=9, blank=True, null=True)  # Field name made lowercase.
    asignatura_impartidas = models.ManyToManyField('Asignaturas', through='Imparte', related_name='docentes')

    class Meta:
        managed = False
        db_table = 'docente'

class Grupo(models.Model):
    grupoid = models.AutoField(db_column='GRUPOID', primary_key=True)  # Field name made lowercase.
    nombre = models.CharField(db_column='NOMBRE', max_length=3, blank=True, null=True)  # Field name made lowercase.
    id_asignatura = models.ForeignKey(Asignaturas, models.CASCADE, db_column='ID_ASIGNATURA', max_length=10)  # Field name made lowercase.
    id_aula = models.ForeignKey('aulas.Aula', models.CASCADE, db_column='ID_AULA', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'grupo'


class Imparte(models.Model):
    codigo_docente = models.ForeignKey(Docente, models.CASCADE, db_column='CODIGO_DOCENTE')  # Field name made lowercase.
    id_asignatura = models.ForeignKey(Asignaturas, models.CASCADE, db_column='ID_ASIGNATURA')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'imparte'
        unique_together = (('codigo_docente', 'id_asignatura'),)