from django.db import transaction
from rest_framework import serializers
from calendario.models import Dia

class CargarCalendarioSerializer(serializers.Serializer):

    fecha_inicio_1_semestre = serializers.DateField()
    fecha_fin_1_semestre = serializers.DateField()
    fecha_inicio_2_semestre = serializers.DateField()
    fecha_fin_2_semestre = serializers.DateField()
    semanas_docencia = serializers.IntegerField(min_value=1)

    def cargar_calendario(self, validated_data):
        fecha_inicio_1_semestre = validated_data['fecha_inicio_1_semestre']
        fecha_fin_1_semestre = validated_data['fecha_fin_1_semestre']
        fecha_inicio_2_semestre = validated_data['fecha_inicio_2_semestre']
        fecha_fin_2_semestre = validated_data['fecha_fin_2_semestre']
        semanas_docencia = validated_data['semanas_docencia']


