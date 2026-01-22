from datetime import timedelta, date
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from django.shortcuts import get_object_or_404
from .serializers import ReservaPuntualCreateSerializer
from .serializers_pendientes import ( ReservaPendienteListItemSerializer, ReservaDetalleSerializer, AulasDisponiblesInputSerializer, ReservaBulkIdsSerializer)
from reservas.models import Reserva, ReservaPuntual, Responsable
from calendario.models import Dia
from reservas.services import aulas_disponibles_en_fecha_hora, aula_disponible_en_varias_fechas





"""
============================================
== PÁGINA DE SOLICITUD DE RESERVA PUNTUAL ==
=============================================
"""
class SolicitarReservaPuntualAPIView(APIView):
    def post(self, request):
        serializer = ReservaPuntualCreateSerializer(data=request.data)
        if serializer.is_valid():
            reserva_puntual = serializer.save()
            return Response(
                {"message": "Reserva puntual creada correctamente"},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


"""
============================================
== PÁGINA DE LISTA DE RESERVAS PENDIENTES ==
============================================
"""

# -------------------------------------------------------
# 1) ENDPOINT: POST /api/aulas/disponibles/
# -------------------------------------------------------
class AulasDisponiblesAPIView(APIView):
    def post(self, request):
        data = request.data

        generar_periodica = bool(data.get("generar_periodica", False))

        hora_inicio = data.get("hora_inicio")
        hora_fin = data.get("hora_fin")
        capacidad = int(data.get("capacidad_solicitada"))
        num_ordenadores = int(data.get("num_ordenadores", 0) or 0)
        altavoces = bool(data.get("altavoces", False))
        proyector = bool(data.get("proyector", False))
        camaras = bool(data.get("camaras", False))
        enchufes = bool(data.get("enchufes", False))

        # ---------- NO periódica ----------
        if not generar_periodica:
            fecha_raw = data.get("fecha")
            if not fecha_raw:
                return Response({"fecha": "Este campo es obligatorio."}, status=400)

            try:
                fecha = date.fromisoformat(fecha_raw)
            except ValueError:
                return Response({"fecha": "Formato inválido (YYYY-MM-DD)."}, status=400)

            qs = aulas_disponibles_en_fecha_hora(
                fecha=fecha,
                hora_inicio=hora_inicio,
                hora_fin=hora_fin,
                capacidad=capacidad,
                num_ordenadores=num_ordenadores,
                altavoces=altavoces,
                proyector=proyector,
                camaras=camaras,
                enchufes=enchufes,
            )

            aulas = [{
                "nombre": a.nombre,
                "capacidad": a.capacidad,
                "num_ordenadores": getattr(a, "num_ordenadores", 0),
            } for a in qs]

            return Response({"aulas": aulas}, status=200)

        # ---------- PERIÓDICA ----------
        fi_raw = data.get("fecha_inicio_periodo")
        ff_raw = data.get("fecha_fin_periodo")
        dia_semana_raw = data.get("dia_semana_periodica")

        if not fi_raw or not ff_raw or not dia_semana_raw:
            return Response(
                {"periodo": "Faltan fecha_inicio_periodo / fecha_fin_periodo / dia_semana_periodica"},
                status=400
            )

        try:
            fi = date.fromisoformat(fi_raw)
            ff = date.fromisoformat(ff_raw)
        except ValueError:
            return Response({"periodo": "Formato de fechas inválido (YYYY-MM-DD)."}, status=400)

        try:
            dia_semana = int(dia_semana_raw)
        except ValueError:
            return Response({"dia_semana_periodica": "Debe ser un entero 1..5"}, status=400)

        if fi > ff:
            return Response({"periodo": "La fecha de inicio no puede ser mayor que la de fin."}, status=400)

        fechas_periodo = []
        current = fi
        while current <= ff:
            if current.isoweekday() == dia_semana:
                if not Dia.objects.filter(dia=current).exists():
                    return Response(
                        {"fecha": f"La fecha {current.isoformat()} no existe en el calendario académico."},
                        status=400
                    )
                fechas_periodo.append(current)  # date objects
            current += timedelta(days=1)

        if not fechas_periodo:
            return Response(
                {"periodo": "No hay fechas que coincidan con el día de la semana en el rango."},
                status=400
            )

        # 1) Aulas comunes
        qs_comun = aula_disponible_en_varias_fechas(
            fechas=fechas_periodo,  # date objects
            hora_inicio=hora_inicio,
            hora_fin=hora_fin,
            capacidad=capacidad,
            num_ordenadores=num_ordenadores,
            altavoces=altavoces,
            proyector=proyector,
            camaras=camaras,
            enchufes=enchufes,
        )

        aulas_comunes = [{
            "nombre": a.nombre,
            "capacidad": a.capacidad,
            "num_ordenadores": getattr(a, "num_ordenadores", 0),
        } for a in qs_comun]

        if aulas_comunes:
            return Response({
                "modo": "comun",
                "fechas": [d.isoformat() for d in fechas_periodo],
                "aulas_comunes": aulas_comunes,
            }, status=200)

        # 2) No hay comunes => aulas por fecha
        aulas_por_fecha = {}
        for d in fechas_periodo:
            qs = aulas_disponibles_en_fecha_hora(
                fecha=d,
                hora_inicio=hora_inicio,
                hora_fin=hora_fin,
                capacidad=capacidad,
                num_ordenadores=num_ordenadores,
                altavoces=altavoces,
                proyector=proyector,
                camaras=camaras,
                enchufes=enchufes,
            )
            aulas_por_fecha[d.isoformat()] = [{
                "nombre": a.nombre,
                "capacidad": a.capacidad,
                "num_ordenadores": getattr(a, "num_ordenadores", 0),
            } for a in qs]

        return Response({
            "modo": "por_fecha",
            "fechas": [d.isoformat() for d in fechas_periodo],
            "aulas_por_fecha": aulas_por_fecha,
        }, status=200)


# -------------------------------------------------------
# 2) LISTADO: GET /api/reservas/pendientes/
# Estado: Pendiente o Solicitado => por defecto "P" y "S"
# -------------------------------------------------------
"""
class ReservasPendientesListAPIView(APIView):
    PENDIENTES_ESTADOS = ("P")  # ajusta si tus códigos son otros

    def get(self, request):
        estados = request.query_params.getlist("estado")
        estados = tuple(estados) if estados else self.PENDIENTES_ESTADOS

        puntuales = (
            ReservaPuntual.objects
            .select_related("id_responsable", "id_reserva", "id_reserva__id_dia")
            .filter(id_reserva__estado__in=estados)
            .order_by("-momento_reserva")
        )

        data = []
        for p in puntuales:
            r = p.id_reserva

            correo = getattr(p.id_responsable, "correo", "") if p.id_responsable else ""
            motivo = getattr(p, "motivo", "") or ""

            data.append({
                "idreserva": r.pk,
                "motivo": motivo,
                "correo_responsable": correo,
                "fecha": r.id_dia.dia if r.id_dia else None,
                "hora_inicio": r.hora_inicio,
                "hora_fin": r.hora_fin,

                # si estos campos están en Reserva, OK; si no, se verán None/False
                "capacidad_solicitada": getattr(p, "capacidad_solicitada", None),
                "num_ordenadores": getattr(p, "num_ordenadores", None),
                "altavoces": bool(getattr(p, "altavoces", False)),
                "proyector": bool(getattr(p, "proyector", False)),
                "camaras": bool(getattr(p, "camaras", False)),
                "enchufes": bool(getattr(p, "enchufes", False)),

                "nombre_aula": r.nombre_aula or "",
                "estado": r.estado,
                # opcional si quieres exponerlo:
                # "momento_reserva": p.momento_reserva,
            })

        #out = ReservaPendienteListItemSerializer(data=data, many=True)
        #out.is_valid(raise_exception=False)
        out = ReservaPendienteListItemSerializer(instance=data, many=True)
        return Response(out.data)
"""
class ReservasPendientesListAPIView(APIView):
    PENDIENTES_ESTADOS = ("P",)  # si también quieres "S", pon ("P","S")

    def get(self, request):
        estados = request.query_params.getlist("estado")
        estados = tuple(estados) if estados else self.PENDIENTES_ESTADOS

        # Parámetros para el filtrado
        motivo = request.query_params.get("motivo")
        responsable = request.query_params.get("responsable")
        desde = request.query_params.get("desde")  # YYYY-MM-DD
        hasta = request.query_params.get("hasta")  # YYYY-MM-DD

        puntuales = (
            ReservaPuntual.objects
            .select_related("id_responsable", "id_reserva", "id_reserva__id_dia")
            .filter(id_reserva__estado__in=estados)
        )

        # Filtro motivo
        if motivo:
            puntuales = puntuales.filter(motivo__icontains=motivo)

        # Filtro responsable (correo o parte)
        if responsable:
            puntuales = puntuales.filter(id_responsable__correo__icontains=responsable)

        # Filtro fechas (sobre Dia.dia)
        if desde:
            puntuales = puntuales.filter(id_reserva__id_dia__dia__gte=desde)
        if hasta:
            puntuales = puntuales.filter(id_reserva__id_dia__dia__lte=hasta)

        puntuales = puntuales.order_by("-momento_reserva")

        ser = ReservaPendienteListItemSerializer(puntuales, many=True)
        return Response(ser.data)

# -------------------------------------------------------
# 3) DETALLE + PATCH: /api/reservas/<id>/
# -------------------------------------------------------
"""
class ReservaPendienteDetailAPIView(APIView):
    def get_object(self, id):
        return get_object_or_404(Reserva.objects.select_related("id_dia"), pk=id)

    def get(self, request, id):
        reserva = self.get_object(id)
        ser = ReservaDetalleSerializer(instance=reserva)
        return Response(ser.data)

    @transaction.atomic
    def patch(self, request, id):
        reserva = self.get_object(id)

        if reserva.estado not in ("P", "S"):
            return Response(
                {"detail": "Solo se pueden editar reservas en estado Pendiente/Solicitada."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        ser = ReservaDetalleSerializer(instance=reserva, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        updated = ser.update(reserva, ser.validated_data)

        return Response(ReservaDetalleSerializer(instance=updated).data)
"""


class ReservaPendienteDetailAPIView(APIView):
    def get(self, request, id):
        reserva = Reserva.objects.filter(pk=id).first()
        if not reserva:
            return Response({"detail": "Reserva no encontrada"}, status=status.HTTP_404_NOT_FOUND)
        return Response(ReservaDetalleSerializer().to_representation(reserva))

    @transaction.atomic
    def patch(self, request, id):
        reserva = Reserva.objects.select_for_update().filter(pk=id).first()
        if not reserva:
            return Response({"detail": "Reserva no encontrada"}, status=status.HTTP_404_NOT_FOUND)

        # Validamos lo que llega (parcial)
        serializer = ReservaDetalleSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # 1) Campos que están en Reserva
        if "hora_inicio" in data: reserva.hora_inicio = data["hora_inicio"]
        if "hora_fin" in data: reserva.hora_fin = data["hora_fin"]
        if "nombre_aula" in data: reserva.nombre_aula = data["nombre_aula"]
        if "fecha" in data:
            # Si tu Reserva guarda FK a Dia, aquí tienes que convertir fecha -> Dia
            # EJEMPLO (ajusta a tu modelo):
            # dia = Dia.objects.get(dia=data["fecha"])
            # reserva.id_dia = dia
            pass

        # Si proyector/camaras/enchufes están en Reserva (en tu serializer lo pillas de instance!)
        if "proyector" in data: reserva.proyector = data["proyector"]
        if "camaras" in data: reserva.camaras = data["camaras"]
        if "enchufes" in data: reserva.enchufes = data["enchufes"]

        reserva.save()

        # 2) Campos que están en ReservaPuntual
        puntual = ReservaPuntual.objects.filter(id_reserva=reserva).first()
        if puntual:
            if "motivo" in data: puntual.motivo = data["motivo"]
            # correo_responsable normalmente está en Responsable. Si lo quieres editable:
            # puntual.id_responsable.correo = data["correo_responsable"]; puntual.id_responsable.save()

            if "capacidad_solicitada" in data: puntual.capacidad_solicitada = data["capacidad_solicitada"]
            if "num_ordenadores" in data: puntual.num_ordenadores = data["num_ordenadores"]
            if "altavoces" in data: puntual.altavoces = data["altavoces"]

            puntual.save()

        return Response({"message": "Reserva actualizada correctamente"}, status=status.HTTP_200_OK)

# -------------------------------------------------------
# 4) AULAS CANDIDATAS: POST /api/reservas/<id>/aulas-candidatas/
# -------------------------------------------------------
class ReservaAulasCandidatasAPIView(APIView):
    def post(self, request, id):
        _ = get_object_or_404(Reserva, pk=id)

        ser = AulasDisponiblesInputSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        qs = ser.get_queryset()
        candidatas = []
        for a in qs:
            candidatas.append({
                "idreserva": a.pk,
                "nombre": a.nombre,
                "capacidad": a.capacidad,
                #"nombre": getattr(a, "nombre", str(a.pk)),
                #"capacidad": getattr(a, "capacidad", None),
            })

        return Response({"aulas": candidatas})


# -------------------------------------------------------
# 5) APROBAR / RECHAZAR (y de forma masiva)
# -------------------------------------------------------
class ReservaAprobarAPIView(APIView):
    @transaction.atomic
    def post(self, request, id):
        reserva = get_object_or_404(Reserva, pk=id)

        if reserva.estado not in ("P"):
            return Response({"detail": "La reserva no está en Pendiente."},
                            status=status.HTTP_400_BAD_REQUEST)

        if not (reserva.nombre_aula and reserva.nombre_aula.strip()):
            return Response({"detail": "Debe existir un aula asignada antes de aprobar."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Ajusta códigos si los tuyos son otros
        reserva.estado = "A"  # Aceptada
        reserva.save()

        return Response(status=status.HTTP_204_NO_CONTENT)


class ReservaRechazarAPIView(APIView):
    @transaction.atomic
    def post(self, request, id):
        reserva = get_object_or_404(Reserva, pk=id)

        if reserva.estado not in ("P"):
            return Response({"detail": "La reserva no está en Pendiente."},
                            status=status.HTTP_400_BAD_REQUEST)

        reserva.estado = "R"  # Rechazada
        reserva.save()

        return Response(status=status.HTTP_204_NO_CONTENT)
    

class ReservaAprobarMasivoAPIView(APIView):
    @transaction.atomic
    def post(self, request):
        ser = ReservaBulkIdsSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        ids = ser.validated_data["ids"]

        reservas = Reserva.objects.select_for_update().filter(pk__in=ids)

        # Comprobación: existen todas
        if reservas.count() != len(set(ids)):
            return Response(
                {"detail": "Alguna de las reservas no existe."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validaciones
        for r in reservas:
            if r.estado != "P":
                return Response(
                    {"detail": f"La reserva {r.pk} no está en Pendiente."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if not (r.nombre_aula and r.nombre_aula.strip()):
                return Response(
                    {"detail": f"La reserva {r.pk} no tiene aula asignada."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        reservas.update(estado="A")
        return Response(status=status.HTTP_204_NO_CONTENT)


class ReservaRechazarMasivoAPIView(APIView):
    @transaction.atomic
    def post(self, request):
        ser = ReservaBulkIdsSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        ids = ser.validated_data["ids"]

        reservas = Reserva.objects.select_for_update().filter(pk__in=ids)

        if reservas.count() != len(set(ids)):
            return Response(
                {"detail": "Alguna de las reservas no existe."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        for r in reservas:
            if r.estado != "P":
                return Response(
                    {"detail": f"La reserva {r.pk} no está en Pendiente."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        reservas.update(estado="R")
        return Response(status=status.HTTP_204_NO_CONTENT)
# Create your views here.
