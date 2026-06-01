from django.db.models import Exists, OuterRef, Q
from reservas.models import Reserva, ReservaPuntual, ReservaPeriodica, Responsable
from aulas.models import Aula
from django.shortcuts import get_object_or_404

class ResponsableService:
    @staticmethod
    def list():
        return Responsable.objects.all().order_by('id_docente')
    
    @staticmethod
    def retrieve(correo):
        return get_object_or_404(Responsable, correo=correo)

    @staticmethod
    def create(datos_responsable):
        return Responsable.objects.create(**datos_responsable)
    
    @staticmethod
    def update(correo, datos_actualizados):
        responsable = get_object_or_404(Responsable, correo=correo)
        for campo, valor in datos_actualizados.items():
            setattr(responsable, campo, valor)
        responsable.save()
        return responsable

    @staticmethod
    def delete(correo):
        responsable = ResponsableService.retrieve(correo)
        responsable.delete()

def aulas_candidatas_por_requisitos(
    capacidad: int,
    num_ordenadores: int | None,
    altavoces: bool,
    proyector: bool,
    camara: bool,
    enchufes: bool,
):
    """
    Filtra por requisitos de equipamiento/capacidad.
    Si el usuario pide X (True), el aula debe tener True.
    Si el usuario no lo pide (False), no imponemos nada.
    """
    qs = Aula.objects.exclude(nombre__iexact="Aula 0")

    # Capacidad mínima
    qs = qs.filter(capacidad__gte=capacidad)

    # Ordenadores mínimos (si viene None no filtramos)
    if num_ordenadores is not None:
        qs = qs.filter(num_ordenadores__gte=num_ordenadores)

    # Booleanos: solo filtrar si el usuario lo requiere
    if altavoces:
        qs = qs.filter(altavoces=True)
    if proyector:
        qs = qs.filter(proyector=True)
    if camara:
        qs = qs.filter(camara=True) 
    if enchufes:
        qs = qs.filter(enchufes=True)

    return qs


def aulas_disponibles_en_fecha_hora(
    fecha,
    hora_inicio,
    hora_fin,
    capacidad: int,
    num_ordenadores: int | None,
    altavoces: bool,
    proyector: bool,
    camara: bool,
    enchufes: bool,
    excluir_reserva_id=None,
):
    """
    Devuelve aulas que cumplen requisitos y NO tienen reservas solapadas ese día.
    """
    candidatos = aulas_candidatas_por_requisitos(
        capacidad=capacidad,
        num_ordenadores=num_ordenadores,
        altavoces=altavoces,
        proyector=proyector,
        camara=camara,
        enchufes=enchufes,
    )

    solape = Reserva.objects.filter(
        id_aula=OuterRef("id"),
        id_dia__dia=fecha,
        hora_inicio__lt=hora_fin,
        hora_fin__gt=hora_inicio,
    )

    solape = solape.exclude(estado='R')
    solape = solape.exclude(estado='P')

    if excluir_reserva_id:
        solape = solape.exclude(idreserva=excluir_reserva_id)

    disponibles = candidatos.annotate(
        tiene_solape=Exists(solape)
    ).filter(tiene_solape=False).order_by("nombre")

    return disponibles

""""""
def aula_disponible_en_varias_fechas2(
    fechas,
    hora_inicio,
    hora_fin,
    capacidad: int,
    num_ordenadores: int | None,
    altavoces: bool,
    proyector: bool,
    camara: bool,
    enchufes: bool,
):
    """
    Para una reserva periódica:
    Devuelve aulas que estén libres en TODAS las fechas del patrón.
    Implementación sencilla: iteramos fechas y vamos intersectando.
    (Suele ser suficiente y más fácil de mantener)
    """
    qs = aulas_candidatas_por_requisitos(
        capacidad=capacidad,
        num_ordenadores=num_ordenadores,
        altavoces=altavoces,
        proyector=proyector,
        camara=camara,
        enchufes=enchufes,
    ).order_by("nombre")

    for f in fechas:
        solape = Reserva.objects.filter(
            id_aula=OuterRef("id"),
            id_dia__dia=f,
            hora_inicio__lt=hora_fin,
            hora_fin__gt=hora_inicio,
        )
        qs = qs.annotate(tiene_solape=Exists(solape)).filter(tiene_solape=False)

    return qs


def aula_disponible_en_varias_fechas(
    fechas,
    hora_inicio,
    hora_fin,
    capacidad: int,
    num_ordenadores: int | None,
    altavoces: bool,
    proyector: bool,
    camara: bool,
    enchufes: bool,
):
    """
    Devuelve aulas libres en TODAS las fechas.
    Implementación robusta: intersección por nombres usando el servicio diario.
    """
    candidatas_qs = aulas_candidatas_por_requisitos(
        capacidad=capacidad,
        num_ordenadores=num_ordenadores,
        altavoces=altavoces,
        proyector=proyector,
        camara=camara,
        enchufes=enchufes,
    )

    candidatas_ids = set(candidatas_qs.values_list("id", flat=True))

    comunes = candidatas_ids.copy()

    for f in fechas:
        qs_dia = aulas_disponibles_en_fecha_hora(
            fecha=f,
            hora_inicio=hora_inicio,
            hora_fin=hora_fin,
            capacidad=capacidad,
            num_ordenadores=num_ordenadores,
            altavoces=altavoces,
            proyector=proyector,
            camara=camara,
            enchufes=enchufes,
        )
        disponibles_ids = set(qs_dia.values_list("id", flat=True))
        comunes &= disponibles_ids

        if not comunes:
            break

    return Aula.objects.filter(id__in=comunes).order_by("nombre")
