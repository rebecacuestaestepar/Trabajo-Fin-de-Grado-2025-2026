from .models import Asignaturas, Grado

def obtener_grados():
    grados = Grado.objects.all().values('idgrado', 'nombre').order_by('nombre')
    return list(grados)

def obtener_cursos_grado(id_grado):
    cursos = Asignaturas.objects.filter(grado_id=id_grado).values_list('curso_grado', flat=True).distinct().order_by('curso_grado')
    return [int(curso) for curso in cursos if curso is not None]
