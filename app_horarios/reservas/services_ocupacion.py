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
        # ReservaPuntual tiene inicio/fin (DateTimeField), perfecto para filtrar por rango
        qs_puntual = (
            ReservaPuntual.objects
            .select_related("id_reserva")
            .filter(id_reserva__nombre_aula=aula_nombre)
            .filter(inicio__lt=end_dt, fin__gt=start_dt)  # solapa con el rango visible
            .filter(id_reserva__estado__in=["A"])  # solo mostrar las reservas aceptadas
            .order_by("inicio")
        )

        for rp in qs_puntual:
            r = rp.id_reserva
            eventos.append({
                "id": str(r.idreserva),  # para navegar al detalle de la puntual
                "title": rp.motivo or f"Reserva puntual {r.idreserva}",
                "start": _aware(rp.inicio).isoformat(),
                "end": _aware(rp.fin).isoformat(),
                "tipo": "PUNTUAL",
                #"reserva_id": str(r.idreserva),
                #"estado": r.estado,
                "aula": r.nombre_aula,
                #"capacidad_solicitada": rp.capacidad_solicitada,
            })

    # -------------------------
    # 2) Reservas periódicas (expansión)
    # -------------------------
    if tipo in ("AMBAS", "PERIODICA"):
        # Periodicidad está en ReservaPeriodica, y el horario (hora_inicio/hora_fin) en Reserva
        qs_periodica = (
            ReservaPeriodica.objects
            .select_related("id_reserva", "id_asignatura")
            .filter(id_reserva__nombre_aula=aula_nombre)
            #.filter(fecha_inicio__lt=end_dt.date(), fecha_fin__gt=start_dt.date())  # solapa con el rango visible
            .filter(id_reserva__estado__in=["A"])  # solo mostrar las reservas aceptadas
            .order_by("fecha_inicio", "dia_semana")
        )

        start_date = start_dt.date()
        # Para incluir el último día si el rango acaba en mitad del día
        end_date_excl = (end_dt.date() + timedelta(days=1))

        for per in qs_periodica:
            r = per.id_reserva

            # Ventana de la serie
            fi = per.fecha_inicio
            ff = per.fecha_fin

            # Recortamos al rango visible
            rango_ini = max(start_date, fi)
            rango_fin_excl = min(end_date_excl, ff + timedelta(days=1))  # +1 para hacerlo exclusivo

            if rango_ini >= rango_fin_excl:
                continue

            dia_semana = int(per.dia_semana)          # ISO: lunes=1 ... domingo=7
            intervalo = int(per.intervalo_semanas) or 1

            for d in _iter_dias(rango_ini, rango_fin_excl):
                if d.isoweekday() != dia_semana:
                    continue

                # Intervalo semanal: semanas desde fi
                weeks = (d - fi).days // 7
                if weeks % intervalo != 0:
                    continue

                ev_start = _combine(d, r.hora_inicio)
                ev_end = _combine(d, r.hora_fin)

                # Aseguramos solape con el rango
                if ev_end <= start_dt or ev_start >= end_dt:
                    continue

                # ID único por ocurrencia (serie + fecha). Útil para FullCalendar.
                ocurrencia_id = f"{r.idreserva}-{d.isoformat()}"

                # Título: asignatura
                asignatura = getattr(per.id_asignatura, "nombre", None) or getattr(per.id_asignatura, "id", None)
                titulo = f"{asignatura}" if asignatura else f"Periódica {r.idreserva}"

                eventos.append({
                    "id": ocurrencia_id,
                    "title": titulo,
                    "start": ev_start.isoformat(),
                    "end": ev_end.isoformat(),
                    "tipo": "PERIODICA",
                    "serie_id": str(r.idreserva),
                    #"estado": r.estado,
                    "aula": r.nombre_aula,
                    "fecha": d.isoformat(),
                })

    return eventos
