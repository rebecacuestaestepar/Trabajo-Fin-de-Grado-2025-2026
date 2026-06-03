from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from aulas.models import Aula
from aulas.serializers import OcupacionAulaEventosQuerySerializer
from reservas.services_ocupacion import obtener_eventos_ocupacion_aula

from rest_framework.permissions import IsAuthenticated


class OcupacionAulaEventosAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.has_perm("aulas.view_ocupacion_aula"):
            return Response({'error': 'No tienes permiso para consultar la ocupación de aulas.'}, status=403)
        ser = OcupacionAulaEventosQuerySerializer(data=request.query_params)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        aula_nombre = data["aula"]
        start = data["start"]
        end = data["end"]
        tipo = data["tipo"]

        # Validacion aula existente
        if not Aula.objects.filter(nombre=aula_nombre).exists():
            return Response(
                {"aula": "El aula indicada no existe."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if start >= end:
            return Response(
                {"rango": "El parámetro start debe ser anterior a end."},
                status=status.HTTP_400_BAD_REQUEST
            )

        eventos = obtener_eventos_ocupacion_aula(
            aula_nombre=aula_nombre,
            start_dt=start,
            end_dt=end,
            tipo=tipo
        )

        return Response(eventos, status=status.HTTP_200_OK)
