from datetime import datetime, timedelta
from django.utils import timezone

from reservas.models import Reserva, ReservaPuntual, ReservaPeriodica


def _aware(dt: datetime) -> datetime:
    """
    Asegura que el datetime sea 'aware' en la zona horaria del proyecto.
    """
    if timezone.is_naive(dt):
        return timezone.make_aware(dt, timezone.get_current_timezone())
    return dt.astimezone(timezone.get_current_timezone())


def _combine(date_obj, time_obj):
    """
    Combina date + time en datetime aware.
    """
    dt = datetime.combine(date_obj, time_obj)
    return timezone.make_aware(dt, timezone.get_current_timezone())


def _iter_dias(inicio, fin_exclusivo):
    """
    Itera fechas desde inicio hasta fin_exclusivo (sin incluir fin_exclusivo).
    """
    cur = inicio
    while cur < fin_exclusivo:
        yield cur
        cur += timedelta(days=1)


def obtener_eventos_ocupacion_aula(*, aula_nombre: str, start_dt: datetime, end_dt: datetime, tipo: str = "AMBAS"):
    """
    Devuelve eventos listos para FullCalendar:

    [
      { id, title, start, end, tipo, reserva_id, ... }
    ]
    """
    start_dt = _aware(start_dt)
    end_dt = _aware(end_dt)

    eventos = []

    # -------------------------
    # 1) Reservas puntuales
    # -------------------------
    if tipo in ("AMBAS", "PUNTUAL"):
        qs_puntual = (
            ReservaPuntual.objects
            .select_related("id_reserva", "id_reserva__id_aula")
            .filter(id_reserva__id_aula__nombre=aula_nombre)
            .filter(inicio__lt=end_dt, fin__gt=start_dt) 
            .filter(id_reserva__estado__in=["A"])
            .order_by("inicio")
        )

        for rp in qs_puntual:
            r = rp.id_reserva
            eventos.append({
                "id": str(r.idreserva),
                "title": rp.motivo or f"Reserva puntual {r.idreserva}",
                "start": _aware(rp.inicio).isoformat(),
                "end": _aware(rp.fin).isoformat(),
                "tipo": "PUNTUAL",
                #"reserva_id": str(r.idreserva),
                #"estado": r.estado,
                #"aula": r.id_aula,
                "aula": r.id_aula.nombre if r.id_aula else "",
                #"capacidad_solicitada": rp.capacidad_solicitada,
            })

    # -------------------------
    # 2) Reservas periódicas
    # -------------------------
    # if tipo in ("AMBAS", "PERIODICA"):
    #     qs_periodica = (
    #         ReservaPeriodica.objects
    #         .select_related("id_reserva", "id_reserva__id_aula", "id_grupo")
    #         .filter(id_reserva__id_aula__nombre=aula_nombre)
    #         #.filter(fecha_inicio__lt=end_dt.date(), fecha_fin__gt=start_dt.date())  # solapa con el rango visible
    #         .filter(id_reserva__estado__in=["A"])  # solo mostrar las reservas aceptadas
    #         .order_by("fecha_inicio", "dia_semana")
    #     )

    #     start_date = start_dt.date()
    #     end_date_excl = (end_dt.date() + timedelta(days=1))

    #     for per in qs_periodica:
    #         r = per.id_reserva

    #         fi = per.fecha_inicio
    #         ff = per.fecha_fin

    #         rango_ini = max(start_date, fi)
    #         rango_fin_excl = min(end_date_excl, ff + timedelta(days=1))

    #         if rango_ini >= rango_fin_excl:
    #             continue

    #         dia_semana = int(per.dia_semana)
    #         intervalo = int(per.intervalo_semanas) or 1

    #         for d in _iter_dias(rango_ini, rango_fin_excl):
    #             if d.isoweekday() != dia_semana:
    #                 continue

    #             weeks = (d - fi).days // 7
    #             if weeks % intervalo != 0:
    #                 continue

    #             ev_start = _combine(d, r.hora_inicio)
    #             ev_end = _combine(d, r.hora_fin)

    #             if ev_end <= start_dt or ev_start >= end_dt:
    #                 continue

    #             ocurrencia_id = f"{r.idreserva}-{d.isoformat()}"

    #             grupo = getattr(per, "id_grupo", None)

    #             if grupo:
    #                 asignatura_obj = getattr(grupo, "id_asignatura", None)
    #                 asignatura_nombre = getattr(asignatura_obj, "nombre", None) or getattr(asignatura_obj, "id", None)
    #                 nombre_grupo = getattr(grupo, "nombre", "")
    #                 titulo = f"{asignatura_nombre} - {nombre_grupo}".strip() if asignatura_nombre else f"Grupo {nombre_grupo}"
    #             else:
    #                 titulo = f"Periódica {r.idreserva}"

    #             # Título: asignatura
    #             #asignatura = getattr(per.id_asignatura, "nombre", None) or getattr(per.id_asignatura, "id", None)
    #             #titulo = f"{asignatura}" if asignatura else f"Periódica {r.idreserva}"

    #             eventos.append({
    #                 "id": ocurrencia_id,
    #                 "title": titulo,
    #                 "start": ev_start.isoformat(),
    #                 "end": ev_end.isoformat(),
    #                 "tipo": "PERIODICA",
    #                 "serie_id": str(r.idreserva),
    #                 #"estado": r.estado,
    #                 "aula": r.id_aula.nombre if r.id_aula else "",
    #                 "fecha": d.isoformat(),
    #             })

    if tipo in ("AMBAS", "PERIODICA"):
        qs_periodica = (
            ReservaPeriodica.objects
            .select_related("id_reserva", "id_reserva__id_aula", "id_reserva__id_dia", "id_grupo__id_asignatura")
            .filter(id_reserva__id_aula__nombre=aula_nombre)
            .filter(id_reserva__id_dia__dia__gte=start_dt.date(), 
                    id_reserva__id_dia__dia__lte=end_dt.date())
            .filter(id_reserva__estado__in=["A"])
        )

        for per in qs_periodica:
            r = per.id_reserva
            
            fecha_clase = r.id_dia.dia 
            
            ev_start = _combine(fecha_clase, r.hora_inicio)
            ev_end = _combine(fecha_clase, r.hora_fin)

            grupo = per.id_grupo
            if grupo:
                asignatura_nombre = grupo.id_asignatura.nombre if grupo.id_asignatura else "Asignatura"
                abreviatura_asignatura = grupo.id_asignatura.abreviatura if grupo.id_asignatura and grupo.id_asignatura.abreviatura else None
                titulo = f"{abreviatura_asignatura} - {grupo.nombre}"
            else:
                titulo = f"Clase {r.idreserva}"

            eventos.append({
                "id": str(r.idreserva),
                "title": titulo,
                "start": ev_start.isoformat(),
                "nombre_completo": f"{asignatura_nombre} - {grupo.nombre}" if grupo else f"Clase {r.idreserva}",
                "end": ev_end.isoformat(),
                "tipo": "PERIODICA",
                "aula": r.id_aula.nombre if r.id_aula else "",
            })

    return eventos
