from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from django.shortcuts import get_object_or_404
from .serializers import ReservaPuntualCreateSerializer
from .serializers_pendientes import ( ReservaPendienteListItemSerializer, ReservaDetalleSerializer, AulasDisponiblesInputSerializer)
from reservas.models import Reserva, ReservaPuntual, Responsable
from calendario.models import Dia



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
        ser = AulasDisponiblesInputSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        qs = ser.get_queryset()

        candidatas = []
        for a in qs:
            candidatas.append({
                "idreserva": a.pk,
                "nombre": getattr(a, "nombre", str(a.pk)),
                "capacidad": getattr(a, "capacidad", None),
            })

        return Response({"candidatas": candidatas})


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

        puntuales = (
            ReservaPuntual.objects
            .select_related("id_responsable", "id_reserva", "id_reserva__id_dia")
            .filter(id_reserva__estado__in=estados)
            .order_by("-momento_reserva")
        )

        ser = ReservaPendienteListItemSerializer(puntuales, many=True)
        return Response(ser.data)

# -------------------------------------------------------
# 3) DETALLE + PATCH: /api/reservas/<id>/
# -------------------------------------------------------
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

        return Response({"candidatas": candidatas})


# -------------------------------------------------------
# 5) APROBAR / RECHAZAR
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
# Create your views here.
