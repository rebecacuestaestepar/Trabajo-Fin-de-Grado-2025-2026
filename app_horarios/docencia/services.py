from docencia.models import Asignaturas
from calendario.models import Semestre
from reservas.models import ReservaPeriodica

def obtener_semestres_por_grado(id_grado):
    semestres = (
        Asignaturas.objects.filter(grado_id=id_grado)
        .values_list('semestre_academico', flat=True)
        .distinct()
        .order_by('semestre_academico')
    )

    return [int(semestre) for semestre in semestres if semestre is not None]


def obtener_asignaturas_por_grado_y_semestre(id_curso, id_grado, semestre_academico):

    semestre = semestre_academico % 2

    semestre_obj = Semestre.objects.filter(curso_id=id_curso, numero=semestre).first()

    if not semestre_obj:
        return []
    
    reservas = ReservaPeriodica.objects.select_related(
        'id_reserva',
        'id_reserva__id_aula',
        'id_grupo',
        'id_grupo__id_asignatura',
    ).filter(
        id_grupo__id_asignatura__grado_id=id_grado,
        id_grupo__id_asignatura__semestre_academico=semestre_academico,
        fecha_inicio__gte=semestre_obj.fecha_inicio,
        fecha_fin__lte=semestre_obj.fecha_fin,
    )

    reservas_unicas = []
    vistos = set()

    for r in reservas:
        asignatura_id = r.id_grupo.id_asignatura.idasignatura
        grupo_id = r.id_grupo.idgrupo
        dia_semana = r.dia_semana
        hora_inicio = r.id_reserva.hora_inicio.strftime("%H:%M")
        hora_fin = r.id_reserva.hora_fin.strftime("%H:%M")

        distint = f"{asignatura_id}-{grupo_id}-{dia_semana}-{hora_inicio}-{hora_fin}"

        if distint not in vistos:
            vistos.add(distint)
            reservas_unicas.append(r)

    return reservas_unicas