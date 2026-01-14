from datetime import date, datetime, timedelta

from django.db import transaction
from docencia.models import Docente
from reservas.services import aula_disponible_en_varias_fechas, aulas_disponibles_en_fecha_hora
from rest_framework import serializers
from calendario.models import Dia, Festivo
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
    num_ordenadores = serializers.IntegerField(required=False, min_value=0)
    altavoces = serializers.BooleanField(required=False, default=False)
    proyector = serializers.BooleanField(required=False, default=False)
    camaras = serializers.BooleanField(required=False, default=False)   
    enchufes = serializers.BooleanField(required=False, default=False)
    generar_periodica = serializers.BooleanField(required=False, default=False)
    #fecha_inicio_periodo = serializers.DateField(required=False, allow_null=True)
    #fecha_fin_periodo = serializers.DateField(required=False, allow_null=True)
    fecha_inicio_periodo = serializers.CharField(required=False, allow_blank=True)
    fecha_fin_periodo = serializers.CharField(required=False, allow_blank=True)
    dia_semana_periodica = serializers.IntegerField(required=False, min_value=1, max_value=5)
    nombre_aula = serializers.CharField(required=False, allow_blank=True)

    @transaction.atomic
    def create(self, validated_data):
        # Aquí harás la lógica de creación en BD.
        # Por ahora, algo simple.

        correo = validated_data['correo_responsable']
        try:
            responsable = Responsable.objects.filter(correo=correo).first()
            if not responsable:
                docente = Docente.objects.filter(correo=correo).first()
                if not docente:
                    responsable = Responsable.objects.create(
                        correo=correo,
                    )
                else:
                    responsable = Responsable.objects.create(
                        correo=docente.correo,
                        nombre=docente.nombre,
                        apellidos=docente.apellidos,
                        telefono=docente.telefono,
                        codigo_docente=docente.codigo_docente,
                    )
        except Responsable.DoesNotExist:
            raise serializers.ValidationError({
                'correo_responsable': 'No existe ningún responsable con ese correo.'
            })

        hora_inicio = validated_data['hora_inicio']
        hora_fin = validated_data['hora_fin']
        motivo = validated_data['motivo']
        capacidad = validated_data['capacidad_solicitada']
        num_ordenadores = validated_data.get('num_ordenadores', None)
        altavoces = validated_data.get('altavoces', False)
        proyector = validated_data.get('proyector', False)
        camaras = validated_data.get('camaras', False)
        enchufes = validated_data.get('enchufes', False)

        generar_periodica = validated_data.get('generar_periodica', False)

        if num_ordenadores is None:
            num_ordenadores = 0

        # ===========================
        # CASO 1: NO PERIODICA
        # ===========================

        if not generar_periodica:
            fecha = validated_data['fecha']

            try:
                dia = Dia.objects.get(dia=fecha)
            except Dia.DoesNotExist:
                raise serializers.ValidationError({
                    'fecha': 'La fecha seleccionada no existe en el calendario académico.'
                })
            festivo = Festivo.objects.filter(id_dia=dia).first() # Obtenemos el festivo si existe
            if festivo:
                nombre = festivo.nombre or 'Día Festivo'
                raise serializers.ValidationError({
                    'fecha': f'El día seleccionado es festivo ({nombre}) y no se pueden hacer reservas.'
                })
            
            
            nombre_aula_elegida = validated_data.get("nombre_aula", "").strip() or None

            # ejemplo NO periódica
            qs = aulas_disponibles_en_fecha_hora(
                fecha=fecha,
                hora_inicio=hora_inicio,
                hora_fin=hora_fin,
                capacidad=capacidad,
                num_ordenadores=num_ordenadores,
                altavoces=altavoces,
                proyector=proyector,
                camaras=camaras,
                enchufes=enchufes,
            )

            if not qs.exists():
                raise serializers.ValidationError({
                    "aulas": "No hay aulas disponibles que cumplan las condiciones para esa fecha y hora."
                })

            if nombre_aula_elegida:
                if not qs.filter(nombre=nombre_aula_elegida).exists():
                    raise serializers.ValidationError({
                        "nombre_aula": "El aula seleccionada no cumple requisitos o no está disponible."
                    })
                aula_final = nombre_aula_elegida
            else:
                aula_final = qs.values_list("nombre", flat=True).first()

            reserva = Reserva.objects.create(
                idreserva=Reserva.next_id(),
                nombre_aula=aula_final,   
                id_dia=dia,
                estado='P',
                tipo='P',
                hora_inicio=hora_inicio,
                hora_fin=hora_fin,
            )

            inicio = datetime.combine(fecha, hora_inicio)
            fin = datetime.combine(fecha, hora_fin)

            reserva_puntual = ReservaPuntual.objects.create(
                id_reserva=reserva,
                id_responsable=responsable,
                capacidad_solicitada=capacidad,
                motivo=motivo,
                inicio=inicio,
                fin=fin,
                num_ordenadores_solicitados=num_ordenadores,
                altavoces_solicitados=altavoces,
                proyector_solicitado=proyector,
                camara_solicitada=camaras,
                enchufes_solicitados=enchufes,
            )

            return reserva_puntual
        
        # ==========================
        # CASO 2: PERIÓDICA
        # ==========================
        fi_raw = validated_data.get("fecha_inicio_periodo", "")
        ff_raw = validated_data.get("fecha_fin_periodo", "")

        '''try:
            fi = date.fromisoformat(fi_raw) if fi_raw else None
        except ValueError:
            raise serializers.ValidationError({
                "fecha_inicio_periodo": "Formato de fecha de inicio inválido (use YYYY-MM-DD)."
            })

        try:
            ff = date.fromisoformat(ff_raw) if ff_raw else None
        except ValueError:
            raise serializers.ValidationError({
                "fecha_fin_periodo": "Formato de fecha de fin inválido (use YYYY-MM-DD)."
            })'''

        if not fi_raw or not ff_raw:
            raise serializers.ValidationError({
                "periodo": "Debe indicar fecha de inicio y fecha de fin para la reserva periódica."
            })

        if fi_raw > ff_raw:
            raise serializers.ValidationError({
                "periodo": "La fecha de inicio no puede ser posterior a la fecha de fin."
            })

        dia_semana = validated_data.get("dia_semana_periodica", None)
        if dia_semana is None or not (1 <= dia_semana <= 5):
            raise serializers.ValidationError({
                "dia_semana_periodica": "Debe indicar el día de la semana entre 1 (Lunes) y 5 (Viernes)."
            })

        # 1) Generar lista de fechas del patrón
        fechas_periodo = []
        current = fi_raw
        while current <= ff_raw:
            if current.isoweekday() == dia_semana:
                # Validar que existe en calendario académico
                if not Dia.objects.filter(dia=current).exists():
                    raise serializers.ValidationError({
                        "fecha": f"La fecha {current.isoformat()} no existe en el calendario académico."
                    })
                festivo = Festivo.objects.filter(id_dia__dia=current).first() # Obtenemos el festivo si existe
                if festivo:
                    nombre = festivo.nombre or 'Día Festivo'
                    raise serializers.ValidationError({
                        'fecha': f'El día {current.isoformat()} es festivo ({nombre}) y no se pueden hacer reservas.'
                    })
                fechas_periodo.append(current)
            current += timedelta(days=1)

        if not fechas_periodo:
            raise serializers.ValidationError({
                "periodo": "No hay ningún día en el rango que coincida con el día de la semana seleccionado."
            })

        # 2) Intentar MISMA AULA para todas las fechas
        qs_comun = aula_disponible_en_varias_fechas(
            fechas=fechas_periodo,
            hora_inicio=hora_inicio,
            hora_fin=hora_fin,
            capacidad=capacidad,
            num_ordenadores=num_ordenadores,
            altavoces=altavoces,
            proyector=proyector,
            camaras=camaras,
            enchufes=enchufes,
        )

        aula_comun = None

        if qs_comun.exists():
            # Si el usuario eligió una, intentamos esa primero
            if nombre_aula_elegida:
                if qs_comun.filter(nombre=nombre_aula_elegida).exists():
                    aula_comun = nombre_aula_elegida
                else:
                    # Si eligió una pero no sirve para todas, no abortamos:
                    # pasamos al fallback "por fecha" (según lo que quieres)
                    aula_comun = None
            else:
                aula_comun = qs_comun.values_list("nombre", flat=True).first()

        # 3) Crear reservas
        ultimo_reserva_puntual = None

        for f in fechas_periodo:
            dia_obj = Dia.objects.get(dia=f)

            if aula_comun:
                aula_final = aula_comun
            else:
                # FALLBACK: elegir aula por fecha (como en no periódica)
                qs_dia = aulas_disponibles_en_fecha_hora(
                    fecha=f,
                    hora_inicio=hora_inicio,
                    hora_fin=hora_fin,
                    capacidad=capacidad,
                    num_ordenadores=num_ordenadores,
                    altavoces=altavoces,
                    proyector=proyector,
                    camaras=camaras,
                    enchufes=enchufes,
                )

                if not qs_dia.exists():
                    # Aquí tienes dos decisiones:
                    # A) abortar todo (atomic) -> no se crea ninguna
                    # B) saltar esa fecha -> se crean las otras
                    # Como estás en @transaction.atomic, lo más coherente es A) abortar:
                    raise serializers.ValidationError({
                        "aulas": f"No hay aulas disponibles para la fecha {f.isoformat()} con esos requisitos."
                    })

                if nombre_aula_elegida and qs_dia.filter(nombre=nombre_aula_elegida).exists():
                    aula_final = nombre_aula_elegida
                else:
                    aula_final = qs_dia.values_list("nombre", flat=True).first()

            reserva = Reserva.objects.create(
                idreserva=Reserva.next_id(),
                nombre_aula=aula_final,
                id_dia=dia_obj,
                estado="P",
                tipo="P",
                hora_inicio=hora_inicio,
                hora_fin=hora_fin,
            )

            reserva_puntual = ReservaPuntual.objects.create(
                id_reserva=reserva,
                id_responsable=responsable,
                capacidad_solicitada=capacidad,
                motivo=motivo,
                inicio=f,
                fin=f,
                num_ordenadores_solicitados=num_ordenadores,
                altavoces_solicitados=altavoces,
                proyector_solicitado=proyector,
                camara_solicitada=camaras,
                enchufes_solicitados=enchufes,
            )

            ultimo_reserva_puntual = reserva_puntual

        return ultimo_reserva_puntual
    
    

    