# from datetime import datetime, timedelta
# from django.utils import timezone

# from reservas.models import Reserva, ReservaPuntual, ReservaPeriodica


# def _aware(dt: datetime) -> datetime:
#     """
#     Asegura que el datetime sea 'aware' en la zona horaria del proyecto.
#     """
#     if timezone.is_naive(dt):
#         return timezone.make_aware(dt, timezone.get_current_timezone())
#     return dt.astimezone(timezone.get_current_timezone())


# def _combine(date_obj, time_obj):
#     """
#     Combina date + time en datetime aware.
#     """
#     dt = datetime.combine(date_obj, time_obj)
#     return timezone.make_aware(dt, timezone.get_current_timezone())


# def obtener_eventos_ocupacion_aula(*, aula_nombre: str, start_dt: datetime, end_dt: datetime, tipo: str = "AMBAS"):
#     """
#     Devuelve eventos listos para FullCalendar:

#     [
#       { id, title, start, end, tipo, reserva_id, ... }
#     ]
#     """
#     start_dt = _aware(start_dt)
#     end_dt = _aware(end_dt)

#     eventos = []

#     # -------------------------
#     # 1) Reservas puntuales
#     # -------------------------
#     if tipo in ("AMBAS", "PUNTUAL"):
#         qs_puntual = (
#             ReservaPuntual.objects
#             .select_related("id_reserva", "id_reserva__id_aula")
#             .filter(id_reserva__id_aula__nombre=aula_nombre)
#             .filter(inicio__lt=end_dt, fin__gt=start_dt) 
#             .filter(id_reserva__estado__in=["A"])
#             .order_by("inicio")
#         )

#         for rp in qs_puntual:
#             r = rp.id_reserva
#             eventos.append({
#                 "id": str(r.idreserva),
#                 "title": rp.motivo or f"Reserva puntual {r.idreserva}",
#                 "start": _aware(rp.inicio).isoformat(),
#                 "end": _aware(rp.fin).isoformat(),
#                 "tipo": "PUNTUAL",
#                 "aula": r.id_aula.nombre if r.id_aula else "",
#             })

#     if tipo in ("AMBAS", "PERIODICA"):
#         qs_periodica = (
#             ReservaPeriodica.objects
#             .select_related("id_reserva", "id_reserva__id_aula", "id_reserva__id_dia", "id_grupo__id_asignatura")
#             .filter(id_reserva__id_aula__nombre=aula_nombre)
#             .filter(id_reserva__id_dia__dia__gte=start_dt.date(), 
#                     id_reserva__id_dia__dia__lte=end_dt.date())
#             .filter(id_reserva__estado__in=["A"])
#         )

#         for per in qs_periodica:
#             r = per.id_reserva
            
#             fecha_clase = r.id_dia.dia 
            
#             ev_start = _combine(fecha_clase, r.hora_inicio)
#             ev_end = _combine(fecha_clase, r.hora_fin)

#             grupo = per.id_grupo
#             if grupo:
#                 asignatura_nombre = grupo.id_asignatura.nombre if grupo.id_asignatura else "Asignatura"
#                 abreviatura_asignatura = grupo.id_asignatura.abreviatura if grupo.id_asignatura and grupo.id_asignatura.abreviatura else None
#                 titulo = f"{abreviatura_asignatura} - {grupo.nombre}"
#             else:
#                 titulo = f"Clase {r.idreserva}"

#             eventos.append({
#                 "id": str(r.idreserva),
#                 "title": titulo,
#                 "start": ev_start.isoformat(),
#                 "nombre_completo": f"{asignatura_nombre} - {grupo.nombre}" if grupo else f"Clase {r.idreserva}",
#                 "end": ev_end.isoformat(),
#                 "tipo": "PERIODICA",
#                 "aula": r.id_aula.nombre if r.id_aula else "",
#             })

#     return eventos
