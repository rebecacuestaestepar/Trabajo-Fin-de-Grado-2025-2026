from datetime import date, timedelta

from django.db import transaction
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
    generar_periodica = serializers.BooleanField(required=False, default=False)
    fecha_inicio_periodo = serializers.CharField(required=False, allow_blank=True)
    fecha_fin_periodo = serializers.CharField(required=False, allow_blank=True)
    dia_semana_periodica = serializers.IntegerField(required=False, min_value=1, max_value=5)

    @transaction.atomic
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

        hora_inicio = validated_data['hora_inicio']
        hora_fin = validated_data['hora_fin']
        motivo = validated_data['motivo']
        capacidad = validated_data['capacidad_solicitada']

        generar_periodica = validated_data.get('generar_periodica', False)

        if not generar_periodica:
            fecha = validated_data['fecha']

            try:
                dia = Dia.objects.get(dia=fecha)
            except Dia.DoesNotExist:
                raise serializers.ValidationError({
                    'fecha': 'La fecha seleccionada no existe en el calendario académico.'
                })

            reserva = Reserva.objects.create(
                idreserva=Reserva.next_id(),
                nombre_aula='AULA1',   # de momento fija; ya lo parametrizarás
                id_dia=dia,
                estado='P',
                tipo='P',
                capacidad_solicitada=capacidad,
                hora_inicio=hora_inicio,
                hora_fin=hora_fin,
            )

            reserva_puntual = ReservaPuntual.objects.create(
                id_reserva=reserva,
                id_responsable=responsable,
                motivo=motivo,
                inicio=fecha,
                fin=fecha,
            )

            return reserva_puntual

        fi_raw = validated_data.get('fecha_inicio_periodo', '')
        ff_raw = validated_data.get('fecha_fin_periodo', '')

        
        fi = date.fromisoformat(fi_raw) if fi_raw else None
        ff = date.fromisoformat(ff_raw) if ff_raw else None

        try:
            fi = date.fromisoformat(fi_raw) if fi_raw else None
        except ValueError:
            raise serializers.ValidationError({
                'fecha_inicio_periodo': 'Formato de fecha de inicio inválido (use YYYY-MM-DD).'
            })

        try:
            ff = date.fromisoformat(ff_raw) if ff_raw else None
        except ValueError:
            raise serializers.ValidationError({
                'fecha_fin_periodo': 'Formato de fecha de fin inválido (use YYYY-MM-DD).'
            })

        if not fi or not ff:
            raise serializers.ValidationError({
                'periodo': 'Debe indicar fecha de inicio y fecha de fin para la reserva periódica.'
            })

        if fi > ff:
            raise serializers.ValidationError({
                'periodo': 'La fecha de inicio no puede ser posterior a la fecha de fin.'
            })

        # 2) Día de la semana (1=Lunes,...,5=Viernes)
        dia_semana = validated_data.get('dia_semana_periodica', None)
        if dia_semana is None:
            raise serializers.ValidationError({
                'dia_semana_periodica': 'Debe indicar el día de la semana (1=Lunes..5=Viernes).'
            })

        if not (1 <= dia_semana <= 5):
            raise serializers.ValidationError({
                'dia_semana_periodica': 'El día de la semana debe estar entre 1 (Lunes) y 5 (Viernes).'
            })

        # 3) Bucle de fechas: creamos una reserva puntual por cada coincidencia
        reservas_creadas = []
        current = fi
        ultimo_reserva_puntual = None

        while current <= ff:
            # isoweekday(): lunes=1,...,domingo=7
            if current.isoweekday() == dia_semana:
                try:
                    dia_obj = Dia.objects.get(dia=current)
                except Dia.DoesNotExist:
                    # Puedes cambiar esto a "skip" si quieres ignorar días fuera del calendario
                    raise serializers.ValidationError({
                        'fecha': f'La fecha {current.isoformat()} no existe en el calendario académico.'
                    })

                reserva = Reserva.objects.create(
                    idreserva=Reserva.next_id(),
                    nombre_aula='AULA1',
                    id_dia=dia_obj,
                    estado='P',
                    tipo='P',
                    capacidad_solicitada=capacidad,
                    hora_inicio=hora_inicio,
                    hora_fin=hora_fin,
                )

                reserva_puntual = ReservaPuntual.objects.create(
                    id_reserva=reserva,
                    id_responsable=responsable,
                    motivo=motivo,
                    inicio=current,
                    fin=current,
                )

                reservas_creadas.append(reserva)
                ultimo_reserva_puntual = reserva_puntual

            current += timedelta(days=1)

        # DRF espera que create devuelva UNA instancia.
        # Devolvemos la última creada (la vista usará solo el message).
        if ultimo_reserva_puntual is None:
            raise serializers.ValidationError({
                'periodo': 'No hay ningún día en el rango que coincida con el día de la semana seleccionado.'
            })

        return ultimo_reserva_puntual
    
    

    