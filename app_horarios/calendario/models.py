from django.db import models

# Create your models here.

class Curso(models.Model):
    idcurso = models.CharField(db_column='IDCURSO', primary_key=True, max_length=10)  # Field name made lowercase.
    fecha_inicio = models.DateField(db_column='FECHA_INICIO')  # Field name made lowercase.
    fecha_fin = models.DateField(db_column='FECHA_FIN')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'curso'


class Semestre(models.Model):
    idsemestre = models.CharField(db_column='IDSEMESTRE', primary_key=True, max_length=10)  # Field name made lowercase.
    curso_id = models.ForeignKey(Curso, models.CASCADE, db_column='CURSO_ID', max_length=10)  # Field name made lowercase.
    numero = models.DecimalField(db_column='NUMERO', max_digits=1, decimal_places=0, blank=True, null=True)  # Field name made lowercase.
    fecha_inicio = models.DateField(db_column='FECHA_INICIO')  # Field name made lowercase.
    fecha_fin = models.DateField(db_column='FECHA_FIN')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'semestre'

class Dia(models.Model):
    dia = models.DateField(db_column='DIA', primary_key=True)  # Field name made lowercase.
    id_semestre = models.ForeignKey(Semestre, models.CASCADE, db_column='ID_SEMESTRE', max_length=10)  # Field name made lowercase.
    dia_semana = models.DecimalField(db_column='DIA_SEMANA', max_digits=10, decimal_places=0, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'dia'

class CambioDocencia(models.Model):
    id_dia = models.OneToOneField(Dia, models.DO_NOTHING, db_column='ID_DIA', primary_key=True)  # Field name made lowercase.
    sustituye_dia = models.DecimalField(db_column='SUSTITUYE_DIA', max_digits=10, decimal_places=0, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'cambio_docencia'

class Examen(models.Model):
    id_dia = models.OneToOneField(Dia, models.DO_NOTHING, db_column='ID_DIA', primary_key=True)  # Field name made lowercase.
    convocatoria = models.DecimalField(db_column='CONVOCATORIA', max_digits=1, decimal_places=0, blank=True, null=True)  # Field name made lowercase.

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

class Lectivo(models.Model):
    id_dia = models.OneToOneField(Dia, models.DO_NOTHING, db_column='ID_DIA', primary_key=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'lectivo'

class Tfg(models.Model):
    id_dia = models.OneToOneField(Dia, models.DO_NOTHING, db_column='ID_DIA', primary_key=True)  # Field name made lowercase.
    convocatoria = models.DecimalField(db_column='CONVOCATORIA', max_digits=1, decimal_places=0, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'tfg'
