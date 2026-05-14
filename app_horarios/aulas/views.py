from datetime import timedelta, datetime, date
from django.utils import timezone
from django.utils.timezone import now
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import ListAPIView


from aulas.models import Aula
from calendario.models import Dia
from aulas.serializers import AulaDisponibleRequestSerializer, AulaMenuSerializer, AulaMiniSerializer
from reservas.services import (
    aulas_disponibles_en_fecha_hora,
    aula_disponible_en_varias_fechas,
)

class AulasDisponiblesAPIView(APIView):
    def post(self, request):
        ser = AulaDisponibleRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        hora_inicio = data["hora_inicio"]
        hora_fin = data["hora_fin"]
        capacidad = data["capacidad_solicitada"]
        num_ordenadores = data.get("num_ordenadores", None)

        altavoces = data.get("altavoces", False)
        proyector = data.get("proyector", False)
        camaras = data.get("camaras", False)
        enchufes = data.get("enchufes", False)

        generar_periodica = data.get("generar_periodica", False)

        if not generar_periodica:
            fecha = data.get("fecha")
            if not fecha:
                return Response(
                    {"fecha": "Debe indicar fecha si no es periódica."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Validar que existe en calendario académico
            if not Dia.objects.filter(dia=fecha).exists():
                return Response(
                    {"fecha": "La fecha seleccionada no existe en el calendario académico."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

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
        else:
            fi = data.get("fecha_inicio_periodo")
            ff = data.get("fecha_fin_periodo")
            dia_semana = data.get("dia_semana_periodica")

            if not fi or not ff or not dia_semana:
                return Response(
                    {"periodo": "Faltan datos de periodicidad."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if fi > ff:
                return Response(
                    {"periodo": "La fecha de inicio no puede ser posterior a la fecha de fin."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Generamos las fechas (solo lunes-viernes según tu rango 1..5)
            fechas = []
            cur = fi
            while cur <= ff:
                if cur.isoweekday() == dia_semana:
                    # si quieres exigir que exista en calendario:
                    if not Dia.objects.filter(dia=cur).exists():
                        return Response(
                            {"fecha": f"La fecha {cur.isoformat()} no existe en el calendario académico."},
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                    fechas.append(cur)
                cur += timedelta(days=1)

            if not fechas:
                return Response(
                    {"periodo": "No hay fechas que coincidan con ese día de la semana."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            qs = aula_disponible_en_varias_fechas(
                fechas=fechas,
                hora_inicio=hora_inicio,
                hora_fin=hora_fin,
                capacidad=capacidad,
                num_ordenadores=num_ordenadores,
                altavoces=altavoces,
                proyector=proyector,
                camaras=camaras,
                enchufes=enchufes,
            )

        aulas = list(qs.values("nombre", "capacidad", "num_ordenadores", "altavoces", "proyector", "camara", "enchufes"))
        return Response(
            {"aulas": aulas, "count": len(aulas)},
            status=status.HTTP_200_OK
        )


class ListaAulasAPIView(ListAPIView):
    serializer_class = AulaMenuSerializer
    def get_queryset(self):
        return Aula.objects.all().order_by("nombre")
    #"OBTENER POR CAMPUS"


