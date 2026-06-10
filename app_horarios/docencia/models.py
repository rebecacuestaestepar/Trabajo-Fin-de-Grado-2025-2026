from django.db import models

# Create your models here.

class Grado(models.Model):
    """Modelo que representa un grado académico."""
    idgrado = models.CharField(db_column='IDGRADO', primary_key=True, max_length=10)
    nombre = models.CharField(db_column='NOMBRE', max_length=80)
    abreviatura = models.CharField(db_column='ABREVIATURA', max_length=20)
    coordinador = models.CharField(db_column='COORDINADOR', max_length=30, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'grado'

class Asignaturas(models.Model):
    """Modelo que representa una asignatura académica."""
    idasignatura = models.CharField(db_column='IDASIGNATURA', primary_key=True, max_length=10)
    nombre = models.CharField(db_column='NOMBRE', max_length=30)
    abreviatura = models.CharField(db_column='ABREVIATURA', max_length=20, blank=True, null=True)
    curso_grado = models.IntegerField(db_column='CURSO_GRADO')
    semestre_academico = models.IntegerField(db_column='SEMESTRE_ACADEMICO')
    ects = models.IntegerField(db_column='ECTS')
    grado_id = models.ForeignKey(Grado, models.CASCADE, db_column='GRADO_ID', max_length=10)
    tipo = models.CharField(db_column='TIPO', max_length=1, blank=True, null=True)
    horas_practicas = models.IntegerField(db_column='HORAS_PRACTICAS', blank=True, null=True)
    docentes_imparten = models.ManyToManyField('Docente', through='Imparte', related_name='asignaturas')

    class Meta:
        managed = False
        db_table = 'asignaturas'

class Docente(models.Model):
    """Modelo que representa un docente o profesor en el ámbito académico."""
    codigo = models.AutoField(db_column='CODIGO', primary_key=True)
    nombre = models.CharField(db_column='NOMBRE', max_length=30)
    apellidos = models.CharField(db_column='APELLIDOS', max_length=100)
    correo = models.CharField(db_column='CORREO', max_length=30)
    telefono = models.CharField(db_column='TELEFONO', max_length=9, blank=True, null=True)
    asignatura_impartidas = models.ManyToManyField('Asignaturas', through='Imparte', related_name='docentes')

    class Meta:
        managed = False
        db_table = 'docente'

class Grupo(models.Model):
    """Modelo que representa un grupo de una asignatura."""
    grupoid = models.AutoField(db_column='GRUPOID', primary_key=True)
    nombre = models.CharField(db_column='NOMBRE', max_length=3, blank=True, null=True)
    id_asignatura = models.ForeignKey(Asignaturas, models.CASCADE, db_column='ID_ASIGNATURA', max_length=10)
    id_aula = models.ForeignKey('aulas.Aula', models.CASCADE, db_column='ID_AULA', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'grupo'


class Imparte(models.Model):
    """Modelo que representa que asignatura imparte un docente. Tabla intermedia para la relación muchos a muchos entre Docente y Asignaturas."""
    id = models.AutoField(db_column='ID', primary_key=True)
    codigo_docente = models.ForeignKey(Docente, models.CASCADE, db_column='CODIGO_DOCENTE')
    id_asignatura = models.ForeignKey(Asignaturas, models.CASCADE, db_column='ID_ASIGNATURA')

    class Meta:
        managed = False
        db_table = 'imparte'
        unique_together = (('codigo_docente', 'id_asignatura'),)