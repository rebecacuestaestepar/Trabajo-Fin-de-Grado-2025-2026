from rest_framework import serializers
from reservas.models import ReservaPeriodica

class HorarioSerializer(serializers.ModelSerializer):
    id_reserva = serializers.IntegerField(source='id_reserva.idreserva')
    asignatura = serializers.SerializerMethodField()
    aula = serializers.CharField(source='id_reserva.id_aula.nombre', default="Sin aula asignada")
    hora_inicio = serializers.TimeField(source='id_reserva.hora_inicio', format="%H:%M")
    hora_fin = serializers.TimeField(source='id_reserva.hora_fin', format="%H:%M")
    grupo = serializers.IntegerField(source='id_grupo.nombre', default="Sin grupo asignado")
    dia_semana = serializers.IntegerField(source='id_reserva.dia_semana')
    distint = serializers.SerializerMethodField()

    class Meta:
        model = ReservaPeriodica
        field = ['id_reserva', 'asignatura', 'aula', 'hora_inicio', 'hora_fin', 'grupo', 'dia_semana']

    def get_asignatura(self, obj):
        asig = obj.id_grupo.id_asignatura
        return asig.abreviatura if asig else "Sin asignatura asignada"
    
    def get_firma_serie(self, obj):
        asig = obj.id_grupo.id_asignatura.idasignatura
        grupo = obj.id_grupo.idgrupo
        dia = obj.dia_semana
        hi = obj.id_reserva.hora_inicio.strftime("%H:%M")
        hf = obj.id_reserva.hora_fin.strftime("%H:%M")
        return f"{asig}|{grupo}|{dia}|{hi}|{hf}"
    
class MoverSerieReservaSerializer(serializers.Serializer):
    distint_serie = serializers.CharField()
    nuevo_dia = serializers.IntegerField(min_value=1, max_value=7)
    nuevo_hora_inicio = serializers.TimeField()
    nuevo_hora_fin = serializers.TimeField()
    forzar = serializers.BooleanField(default=False)

    