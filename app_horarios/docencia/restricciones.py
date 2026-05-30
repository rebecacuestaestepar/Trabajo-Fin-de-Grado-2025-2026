from reservas.models import Reserva, ReservaPeriodica

def validar_ocupacion_aula(id_aula, n_inicio, n_fin, ids_reservas_excluir, dia_num, fecha_inicio_sem, fecha_fin_sem):
    if id_aula == "Sin aula" or id_aula is None:
        return True, ""

    reservas_conflictivas = Reserva.objects.filter(
        id_aula_id=id_aula,
        id_dia__dia_semana=dia_num, 
        hora_inicio__lt=n_fin,
        hora_fin__gt=n_inicio,
        estado='A',
        reservaperiodica__fecha_inicio__lte=fecha_fin_sem,
        reservaperiodica__fecha_fin__gte=fecha_inicio_sem,
    ).exclude(idreserva__in=ids_reservas_excluir)

    if reservas_conflictivas.exists():
        return False, "El aula seleccionada ya está ocupada en ese horario."
    
    return True, ""

def validar_solapamiento_grupos(id_grado, semestre_num, nombre_grupo, n_inicio, n_fin, dia_num, ids_reservas_excluir, fecha_inicio_sem, fecha_fin_sem):
    
    reservas_conflictivas = Reserva.objects.filter(
        id_dia__dia_semana=dia_num,
        hora_inicio__lt=n_fin,
        hora_fin__gt=n_inicio,
        estado='A',
        
        reservaperiodica__fecha_inicio__lte=fecha_fin_sem,
        reservaperiodica__fecha_fin__gte=fecha_inicio_sem,
        
        reservaperiodica__id_grupo__id_asignatura__grado_id=id_grado,
        reservaperiodica__id_grupo__id_asignatura__semestre_academico=semestre_num,
        
        reservaperiodica__id_grupo__nombre=nombre_grupo
        
    ).exclude(
        idreserva__in=ids_reservas_excluir
    )

    if reservas_conflictivas.exists():
        return False, f"El grupo '{nombre_grupo}' ya tiene otra docencia en este horario."
    
    return True, ""