from reservas.models import Reserva, ReservaPeriodica

def validar_ocupacion_aula(id_aula, n_inicio, n_fin, ids_reservas_excluir, dia_num):
    reservas_periodicas_conflictivas = ReservaPeriodica.objects.filter(
        dia_semana=dia_num
    )

    if not reservas_periodicas_conflictivas.exists():
        return True
    
    for reserva_periodica in reservas_periodicas_conflictivas:
        reservas_conflictivas = Reserva.objects.filter(
            id_aula_id=id_aula,
            hora_inicio__lt=n_fin,
            hora_fin__gt=n_inicio,
            id_dia__dia_semana=dia_num,
            idreserva=reserva_periodica.id_reserva.idreserva
        ).exclude(idreserva__in=ids_reservas_excluir)

    if reservas_conflictivas.exists():
        return False

    return True

def validar_solapamiento_reservas(id_grado, semestre_num, n_inicio, n_fin, dia_num, ids_reservas_excluir):

    reservas_conflictivas = Reserva.objects.filter(
        hora_inicio__lt=n_fin,
        hora_fin__gt=n_inicio,
        id_dia__dia_semana=dia_num,
        reservaperiodica__id_grupo__id_asignatura__grado_id = id_grado,
        reservaperiodica__dia_semana = dia_num,
        reservaperiodica__id_grupo__id_asignatura__semestre_academico = semestre_num,
        estado='A'
    ).exclude(
        idreserva__in=ids_reservas_excluir
    ).filter(
        hora_inicio__lt=n_fin,
        hora_fin__gt=n_inicio,
        id_dia__dia_semana=dia_num,
    )

    return not reservas_conflictivas.exists()