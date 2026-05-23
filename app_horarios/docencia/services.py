from docencia.models import Asignaturas

def obtener_semestres_por_grado(id_grado):
    semestres = (
        Asignaturas.objects.filter(grado_id=id_grado)
        .values_list('semestre_academico', flat=True)
        .distinct()
        .order_by('semestre_academico')
    )

    return [int(semestre) for semestre in semestres if semestre is not None]