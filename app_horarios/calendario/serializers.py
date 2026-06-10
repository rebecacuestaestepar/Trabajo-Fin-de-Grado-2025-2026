from django.db import transaction
from rest_framework import serializers
from calendario.models import Dia

class CargarCalendarioSerializer(serializers.Serializer):
    """Serializador para cargar el calendario académico de un curso, incluyendo sus semestres y días festivos."""

    curso = serializers.CharField(max_length=9)
    fecha_inicio_curso = serializers.DateField()
    fecha_fin_curso = serializers.DateField()
    fecha_inicio_1_semestre = serializers.DateField()
    fecha_fin_1_semestre = serializers.DateField()
    fecha_inicio_2_semestre = serializers.DateField()
    fecha_fin_2_semestre = serializers.DateField()
    festivos = serializers.ListField(
        child=serializers.DateField(), required=False
    )



