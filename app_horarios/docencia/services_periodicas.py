from .models import Asignaturas, Grado, Grupo
from decimal import Decimal

def obtener_grados():
    grados = Grado.objects.all().values('idgrado', 'nombre').order_by('nombre')
    return list(grados)

def obtener_cursos_grado(id_grado):
    cursos = Asignaturas.objects.filter(grado_id=id_grado).values_list('curso_grado', flat=True).distinct().order_by('curso_grado')
    return [int(curso) for curso in cursos if curso is not None]

def obtener_semestres_por_grado_semestre(id_grado, curso_grado):
    semestres = Asignaturas.objects.filter(grado_id=id_grado, curso_grado=curso_grado).values_list('semestre_academico', flat=True).distinct().order_by('semestre_academico')
    #semestres_curso = semestres[int(curso_grado)-1:int(curso_grado)+1]
    return [int(semestre) for semestre in semestres if semestre is not None]

def obtener_asignaturas_por_grado_curso_semestre(id_curso, id_grado, semestre_academico):
    print("--- DEPURACIÓN ASIGNATURAS ---")
    print(f"Grado recibido: {repr(id_grado)}")
    print(f"Curso recibido: {repr(id_curso)}")
    print(f"Semestre recibido: {repr(semestre_academico)}")
    asignaturas = Asignaturas.objects.filter(grado_id=int(id_grado), curso_grado=Decimal(id_curso), semestre_academico=Decimal(semestre_academico)).values('idasignatura', 'nombre', 'abreviatura')
    print(f"Asignaturas obtenidas para grado {id_grado}, curso {id_curso} y semestre {semestre_academico}: {list(asignaturas)}")
    return list(asignaturas)

def obtener_grupos_asignatura(id_asignatura):
    grupos = Grupo.objects.filter(id_asignatura=id_asignatura).values('grupoid', 'nombre')
    return list(grupos)