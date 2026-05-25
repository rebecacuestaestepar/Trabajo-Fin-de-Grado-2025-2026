from docencia.models import Asignaturas
from calendario.models import CambioDocencia, Dia, Lectivo, Semestre
from reservas.models import Reserva, ReservaPeriodica
from datetime import timedelta
from django.db import transaction
from .utils import calcular_nuevas_fechas

def obtener_semestres_por_grado(id_grado):
    semestres = (
        Asignaturas.objects.filter(grado_id=id_grado)
        .values_list('semestre_academico', flat=True)
        .distinct()
        .order_by('semestre_academico')
    )

    return [int(semestre) for semestre in semestres if semestre is not None]


def obtener_asignaturas_por_grado_y_semestre(id_curso, id_grado, semestre_academico):

    semestre = 2
    if semestre_academico % 2 == 1:
        semestre = 1

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
        grupo_id = r.id_grupo.grupoid
        aula_id = r.id_reserva.id_aula.id if r.id_reserva.id_aula else "Sin aula"
        dia_semana = r.dia_semana
        hora_inicio = r.id_reserva.hora_inicio.strftime("%H:%M")
        hora_fin = r.id_reserva.hora_fin.strftime("%H:%M")

        distint = f"{asignatura_id}-{grupo_id}-{dia_semana}-{hora_inicio}-{hora_fin}-{aula_id}"

        if distint not in vistos:
            vistos.add(distint)
            reservas_unicas.append(r)

    return reservas_unicas

#def validar_restricciones_movimiento(id_curso, semestre_num, datos_movimiento):


def mover_serie_reservas(id_curso, semestre_num, datos_movimiento):
    distint = datos_movimiento['firma_serie']
    nuevo_dia = datos_movimiento['nuevo_dia']
    n_inicio = datos_movimiento['nueva_hora_inicio']
    n_fin = datos_movimiento['nueva_hora_fin']
    forzar = datos_movimiento['forzar']

    #error_aula = validar_ocupacion_aula(

    with transaction.atomic():

        try:
            asignatura_id, grupo_id, old_dia, old_hi, old_hf, aula_id = distint.split('|')
        except ValueError:
            return {"exito": False, "estado": "error", "mensaje": "Firma inválida."}
        
        semestre = 2
        if semestre_num % 2 == 1:
            semestre = 1

        semestre_obj = Semestre.objects.filter(curso_id=id_curso, numero=semestre).first()

        if not semestre_obj:
            return {"exito": False, "estado": "error", "mensaje": "Semestre no encontrado."}

        reservas_actuales = ReservaPeriodica.objects.select_related(
            'id_reserva',
            'id_grupo',
            'id_grupo__id_asignatura',
            'id_reserva__id_aula',
        ).filter(
            id_grupo__id_asignatura__idasignatura=asignatura_id,
            id_grupo__idgrupo=grupo_id,
            dia_semana=old_dia,
            id_reserva__hora_inicio=old_hi,
            id_reserva__hora_fin=old_hf,
            id_reserva__fecha_inicio__gte=semestre_obj.fecha_inicio,
            id_reserva__fecha_fin__lte=semestre_obj.fecha_fin,
        )

        if not reservas_actuales.exists():
            return {"exito": False, "estado": "error", "mensaje": "No se encontraron las reservas a mover."}

        aula = reservas_actuales.first().id_reserva.id_aula
        ids_reservas_originales = [r.id_reserva.idreserva for r in reservas_actuales]

        fecha_inicio_semestre = semestre_obj.fecha_inicio
        fecha_fin_semestre = semestre_obj.fecha_fin

        dia_actual = fecha_inicio_semestre

        nuevas_fechas = calcular_nuevas_fechas(semestre_obj, nuevo_dia, int(old_dia), reservas_actuales)


        for id_reserva, nueva_fecha in zip(ids_reservas_originales, nuevas_fechas):
            reserva = Reserva.objects.get(idreserva=id_reserva)
            reserva.fecha = nueva_fecha
            reserva.hora_inicio = n_inicio
            reserva.hora_fin = n_fin
            reserva.save()   



