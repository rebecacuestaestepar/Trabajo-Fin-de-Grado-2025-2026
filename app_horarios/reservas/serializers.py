from rest_framework import serializers
from calendario.models import Dia
from reservas.models import Reserva, ReservaPuntual, Responsable
from aulas.models import Aula


class ReservaPuntualCreateSerializer(serializers.Serializer):

    # Campos que llegan desde React
    #fecha_inicio = serializers.DateField()
    #fecha_fin = serializers.DateField()
    fecha = serializers.DateField()
    hora_inicio = serializers.TimeField()
    hora_fin = serializers.TimeField()
    motivo = serializers.CharField(max_length=90)
    capacidad_solicitada = serializers.IntegerField(min_value=0)
    correo_responsable = serializers.EmailField()

    def create(self, validated_data):
        # Aquí harás la lógica de creación en BD.
        # Por ahora, algo simple.

        correo = validated_data['correo_responsable']
        try:
            responsable = Responsable.objects.get(correo=correo)
        except Responsable.DoesNotExist:
            raise serializers.ValidationError({
                'correo_responsable': 'No existe ningún responsable con ese correo.'
            })

        fecha = validated_data['fecha']
        try:
            dia = Dia.objects.get(dia=fecha)  # o Dia.objects.get(pk=fecha) si es PK
        except Dia.DoesNotExist:
            raise serializers.ValidationError({
                'fecha': 'La fecha seleccionada no existe en el calendario académico.'
            })

    # Crear entrada en RESERVA (usar modelo Reserva)
        reserva = Reserva.objects.create(
            idreserva=Reserva.next_id(),
            nombre_aula='AULA1',  
            #id_dia=validated_data['fecha'],
            id_dia = dia,
            # Añadir momento de la reserva
            #momento_reserva=timezone.now(),  # Aquí deberías poner la fecha y hora actual
            estado='P',  # P = pendiente, por ejemplo
            tipo='P',    # P = puntual
            capacidad_solicitada=validated_data['capacidad_solicitada'],
            hora_inicio=validated_data['hora_inicio'],
            hora_fin=validated_data['hora_fin'],
        )

    # Crear entrada en RESERVA_PUNTUAL
        reserva_puntual = ReservaPuntual.objects.create(
            id_reserva=reserva,   # o campo correcto según tu modelo
            id_responsable=responsable,
            motivo=validated_data['motivo'],
            inicio=validated_data['fecha'],
            fin=validated_data['fecha']
            #fin=validated_data['fecha'],
        )

        return reserva_puntual
    
    

    