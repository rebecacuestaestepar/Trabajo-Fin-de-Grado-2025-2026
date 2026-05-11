from django.db import transaction
from rest_framework import serializers
from calendario.models import Dia

class CargarCalendarioSerializer(serializers.Serializer):

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



