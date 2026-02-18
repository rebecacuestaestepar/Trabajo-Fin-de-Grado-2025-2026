# aulas/serializers.py
from rest_framework import serializers

from aulas.models import Aula

class AulaDisponibleRequestSerializer(serializers.Serializer):
    fecha = serializers.DateField(required=False)
    hora_inicio = serializers.TimeField()
    hora_fin = serializers.TimeField()
    capacidad_solicitada = serializers.IntegerField(min_value=0)
    num_ordenadores = serializers.IntegerField(required=False, allow_null=True, min_value=0)

    altavoces = serializers.BooleanField(required=False, default=False)
    proyector = serializers.BooleanField(required=False, default=False)
    camaras = serializers.BooleanField(required=False, default=False)
    enchufes = serializers.BooleanField(required=False, default=False)

    # Para periódica (opcional)
    generar_periodica = serializers.BooleanField(required=False, default=False)
    fecha_inicio_periodo = serializers.DateField(required=False)
    fecha_fin_periodo = serializers.DateField(required=False)
    dia_semana_periodica = serializers.IntegerField(required=False, min_value=1, max_value=5)


class AulaMiniSerializer(serializers.Serializer):
    nombre = serializers.CharField()
    capacidad = serializers.IntegerField()
    num_ordenadores = serializers.IntegerField()
    altavoces = serializers.BooleanField()
    proyector = serializers.BooleanField()
    camara = serializers.BooleanField()
    enchufes = serializers.BooleanField(allow_null=True)

class AulaMenuSerializer(serializers.ModelSerializer):
    class Meta:
        model = Aula
        fields = ["nombre"]


class OcupacionAulaEventosQuerySerializer(serializers.Serializer):
    aula = serializers.CharField(required=True, max_length=20)
    start = serializers.DateTimeField(required=True)
    end = serializers.DateTimeField(required=True)
    tipo = serializers.ChoiceField(
        choices=["AMBAS", "PUNTUAL", "PERIODICA"],
        required=False,
        default="AMBAS"
    )