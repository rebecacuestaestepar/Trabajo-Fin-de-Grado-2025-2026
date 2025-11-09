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
    curso_grado = models.DecimalField(db_column='CURSO_GRADO', max_digits=1, decimal_places=0)  # Field name made lowercase.
    semestre_academico = models.DecimalField(db_column='SEMESTRE_ACADEMICO', max_digits=1, decimal_places=0)  # Field name made lowercase.
    ects = models.DecimalField(db_column='ECTS', max_digits=2, decimal_places=0)  # Field name made lowercase.
    grado_id = models.ForeignKey(Grado, models.CASCADE, db_column='GRADO_ID', max_length=10)  # Field name made lowercase.
    tipo = models.CharField(db_column='TIPO', max_length=1, blank=True, null=True)  # Field name made lowercase.
    horas_practicas = models.DecimalField(db_column='HORAS_PRACTICAS', max_digits=1, decimal_places=0, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'asignaturas'

class Docente(models.Model):
    codigo = models.CharField(db_column='CODIGO', primary_key=True, max_length=9)  # Field name made lowercase.
    nombre = models.CharField(db_column='NOMBRE', max_length=30)  # Field name made lowercase.
    apellidos = models.CharField(db_column='APELLIDOS', max_length=100)  # Field name made lowercase.
    correo = models.CharField(db_column='CORREO', max_length=30)  # Field name made lowercase.
    telefono = models.CharField(db_column='TELEFONO', max_length=9, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'docente'

class Grupo(models.Model):
    grupoid = models.CharField(db_column='GRUPOID', primary_key=True, max_length=10)  # Field name made lowercase.
    nombre = models.CharField(db_column='NOMBRE', max_length=3, blank=True, null=True)  # Field name made lowercase.
    id_asignatura = models.ForeignKey(Asignaturas, models.CASCADE, db_column='ID_ASIGNATURA', max_length=10)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'grupo'


class Imparte(models.Model):
    #pk = models.CompositePrimaryKey('CODIGO_DOCENTE', 'ID_ASIGNATURA')
    codigo_docente = models.ForeignKey(Docente, models.CASCADE, db_column='CODIGO_DOCENTE', max_length=9, primary_key=True)  # Field name made lowercase.
    id_asignatura = models.ForeignKey(Asignaturas, models.CASCADE, db_column='ID_ASIGNATURA', max_length=10)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'imparte'
        unique_together = (('codigo_docente', 'id_asignatura'),)