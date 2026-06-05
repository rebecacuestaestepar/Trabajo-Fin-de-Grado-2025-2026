from datetime import timedelta, date
from django.shortcuts import render
from rest_framework.views import APIView, PermissionDenied
from rest_framework.response import Response
from rest_framework import status, viewsets
from django.db import transaction
from django.shortcuts import get_object_or_404

from reservas.serializers_todas import ReservaResumenSerializer, ReservaTodasSerializer
from .serializers import ReservaPuntualCreateSerializer, ResponsableSerializer
from .serializers_pendientes import ( ReservaPendienteListItemSerializer, ReservaDetalleSerializer, AulasDisponiblesInputSerializer, ReservaBulkIdsSerializer)
from reservas.models import Reserva, ReservaPuntual, Responsable
from calendario.models import Dia
from reservas.services import ResponsableService, aulas_disponibles_en_fecha_hora, aula_disponible_en_varias_fechas

from rest_framework.permissions import IsAuthenticated, DjangoModelPermissions


class ResponsableViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, DjangoModelPermissions]
    queryset = Responsable.objects.none()

    def list(self, request):
        responsables = ResponsableService.list()
        serializer = ResponsableSerializer(responsables, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        responsable = ResponsableService.retrieve(pk)
        serializer = ResponsableSerializer(responsable)
        return Response(serializer.data)

    def create(self, request):
        serializer = ResponsableSerializer(data=request.data)
        if serializer.is_valid():
            nuevo_responsable = serializer.save()
            return Response(ResponsableSerializer(nuevo_responsable).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        responsable = ResponsableService.retrieve(pk)
        serializer = ResponsableSerializer(instance=responsable, data=request.data)
        if serializer.is_valid():
            responsable_actualizado = serializer.save()
            return Response(ResponsableSerializer(responsable_actualizado).data)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        responsable = ResponsableService.retrieve(pk)
        ResponsableService.delete(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)


"""
============================================
== PÁGINA DE SOLICITUD DE RESERVA PUNTUAL ==
=============================================
"""
class SolicitarReservaPuntualAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):

        if not request.user.has_perm("reservas.request_reserv_puntual"):
            raise PermissionDenied("No tienes permiso para solicitar reservas puntuales.")
        serializer = ReservaPuntualCreateSerializer(data=request.data, context={"es_solicitud": True})
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Reserva puntual creada correctamente"},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class CrearReservaPuntualAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        if not request.user.has_perms(["reservas.add_reservapuntual", "reservas.add_reserva"]):
            raise PermissionDenied("No tienes permiso para crear reservas puntuales.")
        serializer = ReservaPuntualCreateSerializer(data=request.data, context={"es_solicitud": False})
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
    #permission_classes = [IsAuthenticated]
    def post(self, request):
        #if not request.user.has_perms(["reservas.add_reserva", "reservas.add_reservapuntual", "reservas.change_reservapuntual"]):
            #raise PermissionDenied("No tienes permiso para consultar aulas disponibles.")
        data = request.data

        generar_periodica = bool(data.get("generar_periodica", False))

        hora_inicio = data.get("hora_inicio")
        hora_fin = data.get("hora_fin")
        capacidad = int(data.get("capacidad_solicitada"))
        num_ordenadores = int(data.get("num_ordenadores", 0) or 0)
        altavoces = bool(data.get("altavoces", False))
        proyector = bool(data.get("proyector", False))
        camara = bool(data.get("camara", False))
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
                camara=camara,
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
            camara=camara,
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
                camara=camara,
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
class ReservasPendientesListAPIView(APIView):
    permission_classes = [IsAuthenticated]
    PENDIENTES_ESTADOS = ("P")

    def get(self, request):
        if not request.user.has_perms(["reservas.view_reserva_puntual", "reservas.view_reserva"]):
            raise PermissionDenied("No tienes permiso para consultar reservas puntuales.")
        estados = request.query_params.getlist("estado")
        estados = tuple(estados) if estados else self.PENDIENTES_ESTADOS

        # Parámetros para el filtrado
        motivo = request.query_params.get("motivo")
        responsable = request.query_params.get("responsable")
        desde = request.query_params.get("desde")  # YYYY-MM-DD
        hasta = request.query_params.get("hasta")  # YYYY-MM-DD

        hoy = date.today()

        puntuales = (
            ReservaPuntual.objects
            .select_related("id_responsable", "id_reserva", "id_reserva__id_dia")
            .filter(id_reserva__estado__in=estados)
            .filter(id_reserva__id_dia__dia__gte=hoy)
        )

        # Filtro motivo
        if motivo:
            puntuales = puntuales.filter(motivo__icontains=motivo)

        # Filtro responsable (correo o parte)
        if responsable:
            puntuales = puntuales.filter(id_responsable__correo__icontains=responsable)

        # Filtro fechas (sobre Dia.dia)
        if desde:
            puntuales = puntuales.filter(id_reserva__id_dia__dia__gte=max(date.fromisoformat(desde), hoy))
        if hasta:
            puntuales = puntuales.filter(id_reserva__id_dia__dia__lte=hasta)

        puntuales = puntuales.order_by("-momento_reserva")

        ser = ReservaPendienteListItemSerializer(puntuales, many=True)
        return Response(ser.data)

# -------------------------------------------------------
# 3) DETALLE + PATCH: /api/reservas/<id>/
# -------------------------------------------------------
class ReservaPendienteDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        if not request.user.has_perms(["reservas.view_reservapuntual", "reservas.view_reserva"]):
            raise PermissionDenied("No tienes permiso para consultar reservas puntuales.")
        reserva = Reserva.objects.filter(pk=id).first()
        if not reserva:
            return Response({"detail": "Reserva no encontrada"}, status=status.HTTP_404_NOT_FOUND)
        return Response(ReservaDetalleSerializer().to_representation(reserva))

    @transaction.atomic
    def patch(self, request, id):
        if not request.user.has_perms(["reservas.change_reservapuntual", "reservas.change_reserva"]):
            raise PermissionDenied("No tienes permiso para modificar reservas puntuales.")
        reserva = Reserva.objects.select_for_update().filter(pk=id).first()
        if not reserva:
            return Response({"detail": "Reserva no encontrada"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ReservaDetalleSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        if "hora_inicio" in data: reserva.hora_inicio = data["hora_inicio"]
        if "hora_fin" in data: reserva.hora_fin = data["hora_fin"]
        if "id_aula" in data: reserva.id_aula_id = data["id_aula"]
        if "fecha" in data:
            dia = Dia.objects.get(dia=data["fecha"])
            reserva.id_dia = dia
        if "estado" in data: reserva.estado = data["estado"]
        reserva.save()

        
        
        reserva_puntual = ReservaPuntual.objects.filter(id_reserva=reserva).first()
        if not reserva_puntual:
            return Response({"detail": "ReservaPuntual asociada no encontrada"}, status=status.HTTP_404_NOT_FOUND)
        
        if "motivo" in data: reserva_puntual.motivo = data["motivo"]
        if "capacidad_solicitada" in data: reserva_puntual.capacidad_solicitada = data["capacidad_solicitada"]
        if "num_ordenadores" in data: reserva_puntual.num_ordenadores_solicitados = data["num_ordenadores"]
        if "altavoces" in data: reserva_puntual.altavoces_solicitados = data["altavoces"]
        if "proyector" in data: reserva_puntual.proyector_solicitado = data["proyector"]
        if "camara" in data: reserva_puntual.camara_solicitada = data["camara"]
        if "enchufes" in data: reserva_puntual.enchufes_solicitados = data["enchufes"]  
        reserva_puntual.save()


        return Response({"message": "Reserva actualizada correctamente"}, status=status.HTTP_200_OK)
    
    def delete(self, request, id):
        if not request.user.has_perms(["reservas.delete_reservapuntual", "reservas.delete_reserva"]):
            raise PermissionDenied("No tienes permiso para eliminar reservas puntuales.")
        reserva = get_object_or_404(Reserva, idreserva=id) 
        reserva.delete()
        return Response({"message": "Reserva eliminada"}, status=status.HTTP_200_OK)

# -------------------------------------------------------
# 4) AULAS CANDIDATAS: POST /api/reservas/<id>/aulas-candidatas/
# -------------------------------------------------------
class ReservaAulasCandidatasAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, id):
        if not request.user.has_perms(["reservas.change_reservapuntual", "reservas.change_reserva"]):
            raise PermissionDenied("No tienes permiso para consultar aulas candidatas.")
        _ = get_object_or_404(Reserva, pk=id)

        ser = AulasDisponiblesInputSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        qs = ser.get_queryset(excluir_reserva_id=id)
        candidatas = []
        for a in qs:
            candidatas.append({
                "id": a.pk,
                "nombre": a.nombre,
                "capacidad": a.capacidad,
            })

        return Response({"aulas": candidatas})


# -------------------------------------------------------
# 5) APROBAR / RECHAZAR (y de forma masiva)
# -------------------------------------------------------
class ReservaAprobarAPIView(APIView):
    permission_classes = [IsAuthenticated]
    @transaction.atomic
    def post(self, request, id):
        if not request.user.has_perm("reservas.change_estado_reserva_puntual"):
            raise PermissionDenied("No tienes permiso para aprobar reservas puntuales.")
        reserva = get_object_or_404(Reserva, pk=id)

        if reserva.estado not in ("P"):
            return Response({"detail": "La reserva no está en Pendiente."},
                            status=status.HTTP_400_BAD_REQUEST)

        #if not (reserva.id_aula and reserva.id_aula.strip()):
        if not reserva.id_aula:
            return Response({"detail": "Debe existir un aula asignada antes de aprobar."},
                            status=status.HTTP_400_BAD_REQUEST)

        reserva.estado = "A"  # Aceptada
        reserva.save()

        return Response(status=status.HTTP_204_NO_CONTENT)


class ReservaRechazarAPIView(APIView):
    permission_classes = [IsAuthenticated]
    @transaction.atomic
    def post(self, request, id):
        if not request.user.has_perm("reservas.change_estado_reserva_puntual"):
            raise PermissionDenied("No tienes permiso para rechazar reservas puntuales.")
        reserva = get_object_or_404(Reserva, pk=id)

        if reserva.estado not in ("P"):
            return Response({"detail": "La reserva no está en Pendiente."},
                            status=status.HTTP_400_BAD_REQUEST)

        reserva.estado = "R"  # Rechazada
        reserva.save()

        return Response(status=status.HTTP_204_NO_CONTENT)
    

class ReservaAprobarMasivoAPIView(APIView):
    permission_classes = [IsAuthenticated]
    @transaction.atomic
    def post(self, request):
        if not request.user.has_perm("reservas.change_estado_reserva_puntual"):
            raise PermissionDenied("No tienes permiso para aprobar reservas puntuales.")
        ser = ReservaBulkIdsSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        ids = ser.validated_data["ids"]

        reservas = Reserva.objects.select_for_update().filter(pk__in=ids)

        # Comprobación si existen todas las reservas
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
            if not r.id_aula:
                return Response(
                    {"detail": f"La reserva {r.pk} no tiene aula asignada."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        reservas.update(estado="A")
        return Response(status=status.HTTP_204_NO_CONTENT)


class ReservaRechazarMasivoAPIView(APIView):
    permission_classes = [IsAuthenticated]
    @transaction.atomic
    def post(self, request):
        if not request.user.has_perm("reservas.change_estado_reserva_puntual"):
            raise PermissionDenied("No tienes permiso para rechazar reservas puntuales.")
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

class ReservasTodasAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.has_perms(["reservas.view_reservapuntual", "reservas.view_reserva"]):
            raise PermissionDenied("No tienes permiso para consultar reservas puntuales.")
        qs = (
            Reserva.objects
            .select_related("id_dia", "id_aula")  
            .select_related("reservapuntual", "reservapuntual__id_responsable")
            .filter(tipo="P")
            .order_by("-id_dia__dia", "-hora_inicio")
        )
        return Response(ReservaTodasSerializer(qs, many=True).data)

class ReservasUsuarioAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, usuario):
        if not request.user.has_perms(["reservas.view_own_reserva_puntual", "reservas.view_own_reserva"]):
            raise PermissionDenied("No tienes permiso para consultar reservas puntuales.")
        qs = (
            Reserva.objects
            .select_related("id_dia", "id_aula")  
            .select_related("reservapuntual", "reservapuntual__id_responsable")
            .filter(tipo="P", reservapuntual__id_responsable__correo=usuario)
            .order_by("-id_dia__dia", "-hora_inicio")
        )
        return Response(ReservaTodasSerializer(qs, many=True).data)

    

class ReservasEliminarMasivoAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.has_perms(["reservas.delete_reservapuntual", "reservas.delete_reserva"]):
            raise PermissionDenied("No tienes permiso para eliminar reservas puntuales.")
        ids = request.data.get("ids", [])

        if not isinstance(ids, list) or not ids:
            return Response(
                {"detail": "Debes enviar un array 'ids' con al menos un elemento."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        qs = Reserva.objects.filter(idreserva__in=ids)
        deleted_count = qs.count()
        qs.delete()

        return Response(
            {"message": "Reservas eliminadas", "deleted": deleted_count},
            status=status.HTTP_200_OK,
        )