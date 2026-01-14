from django.db.models import Exists, OuterRef, Q
from reservas.models import Reserva
from aulas.models import Aula

def aulas_candidatas_por_requisitos(
    capacidad: int,
    num_ordenadores: int | None,
    altavoces: bool,
    proyector: bool,
    camaras: bool,
    enchufes: bool,
):
    """
    Filtra por requisitos de equipamiento/capacidad.
    Si el usuario pide X (True), el aula debe tener True.
    Si el usuario no lo pide (False), no imponemos nada.
    """
    qs = Aula.objects.all()

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
    if camaras:
        qs = qs.filter(camara=True)  # OJO: en SQL es CAMARA (singular)
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
    camaras: bool,
    enchufes: bool,
):
    """
    Devuelve aulas que cumplen requisitos y NO tienen reservas solapadas ese día.
    """
    candidatos = aulas_candidatas_por_requisitos(
        capacidad=capacidad,
        num_ordenadores=num_ordenadores,
        altavoces=altavoces,
        proyector=proyector,
        camaras=camaras,
        enchufes=enchufes,
    )

    solape = Reserva.objects.filter(
        nombre_aula=OuterRef("nombre"),  # Aula.NOMBRE -> modelo suele ser "nombre"
        id_dia=fecha,
        hora_inicio__lt=hora_fin,
        hora_fin__gt=hora_inicio,
    )

    # Si tienes un estado "cancelada", filtra aquí para ignorarla.
    # Ejemplo: solape = solape.exclude(estado='C')
    solape = solape.exclude(estado='R')

    #PREGUNTAR PROFESORES
    solape = solape.exclude(estado='P')
    solape = solape.exclude(estado='S')

    disponibles = candidatos.annotate(
        tiene_solape=Exists(solape)
    ).filter(tiene_solape=False).order_by("nombre")

    return disponibles


def aula_disponible_en_varias_fechas(
    fechas,
    hora_inicio,
    hora_fin,
    capacidad: int,
    num_ordenadores: int | None,
    altavoces: bool,
    proyector: bool,
    camaras: bool,
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
        camaras=camaras,
        enchufes=enchufes,
    ).order_by("nombre")

    for f in fechas:
        solape = Reserva.objects.filter(
            nombre_aula=OuterRef("nombre"),
            id_dia=f,
            hora_inicio__lt=hora_fin,
            hora_fin__gt=hora_inicio,
        )
        qs = qs.annotate(tiene_solape=Exists(solape)).filter(tiene_solape=False)

    return qs