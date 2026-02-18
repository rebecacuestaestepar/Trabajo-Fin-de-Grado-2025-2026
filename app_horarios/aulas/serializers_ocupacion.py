# aulas/serializers_ocupacion.py
from rest_framework import serializers

class OcupacionAulaQuerySerializer(serializers.Serializer):
    aula = serializers.CharField(required=True)  # nombre del aula (ej: "A-01")
    start = serializers.DateTimeField(required=True)
    end = serializers.DateTimeField(required=True)
    tipo = serializers.ChoiceField(
        choices=["AMBAS", "PUNTUAL", "PERIODICA"],
        required=False,
        default="AMBAS"
    )