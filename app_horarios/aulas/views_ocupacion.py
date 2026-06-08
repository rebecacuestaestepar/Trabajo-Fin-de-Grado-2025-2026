from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from aulas.models import Aula
from aulas.serializers import OcupacionAulaEventosQuerySerializer
from aulas.services_ocupacion import obtener_eventos_ocupacion_aula

from rest_framework.permissions import IsAuthenticated


class OcupacionAulaEventosAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.has_perm("aulas.view_ocupacion_aula"):
            return Response({'error': 'No tienes permiso para consultar la ocupación de aulas.'}, status=403)
        serializer = OcupacionAulaEventosQuerySerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)

        eventos = obtener_eventos_ocupacion_aula(
            aula_nombre=serializer.validated_data["aula"],
            start_dt=serializer.validated_data["start"],
            end_dt=serializer.validated_data["end"],
            tipo=serializer.validated_data["tipo"]
        )

        return Response(eventos, status=status.HTTP_200_OK)
