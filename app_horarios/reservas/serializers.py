from datetime import date, datetime, timedelta

from django.db import transaction
from django.utils import timezone
from docencia.models import Docente
from reservas.services import aula_disponible_en_varias_fechas, aulas_disponibles_en_fecha_hora
from rest_framework import serializers
from calendario.models import Dia, Festivo
from reservas.models import Reserva, ReservaPuntual, Responsable
from aulas.models import Aula

class ResponsableSerializer(serializers.ModelSerializer):
    telefono = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = Responsable
        fields = '__all__'


class ReservaPuntualCreateSerializer(serializers.Serializer):
    fecha = serializers.DateField()
    hora_inicio = serializers.TimeField()
    hora_fin = serializers.TimeField()
    motivo = serializers.CharField(max_length=90)
    capacidad_solicitada = serializers.IntegerField(min_value=0)
    correo_responsable = serializers.EmailField()
    nombre_responsable = serializers.CharField(required=False, allow_blank=True)
    apellidos_responsable = serializers.CharField(required=False, allow_blank=True)
    num_ordenadores = serializers.IntegerField(required=False, min_value=0)
    altavoces = serializers.BooleanField(required=False, default=False)
    proyector = serializers.BooleanField(required=False, default=False)
    camara = serializers.BooleanField(required=False, default=False)   
    enchufes = serializers.BooleanField(required=False, default=False)
    generar_periodica = serializers.BooleanField(required=False, default=False)
    fecha_inicio_periodo = serializers.DateField(required=False, allow_null=True)
    fecha_fin_periodo = serializers.DateField(required=False, allow_null=True)
    dia_semana_periodica = serializers.IntegerField(required=False, min_value=1, max_value=5)
    id_aula = serializers.IntegerField(required=False, allow_null=True)
    aulas_por_fecha = serializers.DictField(child=serializers.CharField(allow_blank=True), required=False)
    observaciones = serializers.CharField(required=False, allow_blank=True, max_length=300)

    estado = serializers.ChoiceField(choices=[('P', 'Pendiente'), ('A', 'Aceptada'), ('R', 'Rechazada')], default='P', required=False)
    

    @transaction.atomic
    def create(self, validated_data):

        hoy = timezone.now().date()

        generar_periodica = validated_data.get('generar_periodica', False)

        if not generar_periodica:
            fecha = validated_data.get('fecha')
            if fecha and fecha < hoy:
                raise serializers.ValidationError({
                    "fecha": "La fecha de la reserva no puede ser anterior al día actual."
                })
        else:
            fi = validated_data.get("fecha_inicio_periodo")
            if fi and fi < hoy:
                raise serializers.ValidationError({
                    "periodo": "La fecha de inicio de la reserva periódica no puede ser anterior al día actual."
                })

        estado_elegido = validated_data.get("estado", "P")

        es_solicitud = self.context.get('es_solicitud', False)
        
        if es_solicitud:
            estado_final = 'P'
        else:
            estado_final = estado_elegido

        correo = validated_data['correo_responsable']
        nombre_responsable = validated_data.get('nombre_responsable', "").strip()
        apellidos_responsable = validated_data.get('apellidos_responsable', "").strip()
        try:
            responsable = Responsable.objects.filter(correo=correo).first()
            if not responsable:
                docente = Docente.objects.filter(correo=correo).first()
                if not docente:
                    if not nombre_responsable or not apellidos_responsable:
                        raise serializers.ValidationError({
                            "codigo": "RESPONSABLE_NO_REGISTRADO",
                            "general": " El responsable no está reigstrado. Se requieren nombre y apellidos para proceder con su registro."
                        })
                    else: 
                        responsable = Responsable.objects.create(
                            correo=correo,
                            nombre=nombre_responsable,
                            apellidos=apellidos_responsable
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
        camara = validated_data.get('camara', False)
        enchufes = validated_data.get('enchufes', False)
        observaciones = validated_data.get('observaciones', "")

        generar_periodica = validated_data.get('generar_periodica', False)

        if num_ordenadores is None:
            num_ordenadores = 0
        
        id_aula_elegida = validated_data.get("id_aula", None)
        aulas_por_fecha = validated_data.get("aulas_por_fecha")

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
            
            

            # ejemplo NO periódica
            qs = aulas_disponibles_en_fecha_hora(
                fecha=fecha,
                hora_inicio=hora_inicio,
                hora_fin=hora_fin,
                capacidad=capacidad,
                num_ordenadores=num_ordenadores,
                altavoces=altavoces,
                proyector=proyector,
                camara=camara,
                enchufes=enchufes,
            )

            if not qs.exists():
                raise serializers.ValidationError({
                    "aulas": "No hay aulas disponibles que cumplan las condiciones para esa fecha y hora."
                })

            if id_aula_elegida:
                if not qs.filter(id=id_aula_elegida).exists():
                    raise serializers.ValidationError({
                        "id_aula": "El aula seleccionada no cumple requisitos o no está disponible."
                    })
                aula_final = id_aula_elegida
            else:
                aula_final = qs.values_list("id", flat=True).first()

            reserva = Reserva.objects.create(
                id_aula_id=aula_final,   
                id_dia=dia,
                estado=estado_final,
                tipo='P',
                hora_inicio=hora_inicio,
                hora_fin=hora_fin,
            )

            reserva.refresh_from_db()

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
                camara_solicitada=camara,
                enchufes_solicitados=enchufes,
                observaciones=observaciones,
            )

            return reserva_puntual
        
        # ==========================
        # CASO 2: PERIÓDICA
        # ==========================
        fi = validated_data.get("fecha_inicio_periodo", None)
        ff = validated_data.get("fecha_fin_periodo", None)

        if not fi or not ff:
            raise serializers.ValidationError({
                "periodo": "Debe indicar fecha de inicio y fecha de fin para la reserva periódica."
            })

        if fi > ff:
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
        current = fi
        while current <= ff:
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
            camara=camara,
            enchufes=enchufes,
        )

        aula_comun = None

        if qs_comun.exists():
            # Si el usuario eligió una, intentamos esa primero
            if id_aula_elegida:
                if qs_comun.filter(id=id_aula_elegida).exists():
                    aula_comun = id_aula_elegida
                else:
                    # Si eligió una pero no sirve para todas, no abortamos:
                    # pasamos a elegir por fecha
                    aula_comun = None
            else:
                aula_comun = qs_comun.values_list("id", flat=True).first()

        # 3) Crear reservas
        ultimo_reserva_puntual = None

        for f in fechas_periodo:
            dia_obj = Dia.objects.get(dia=f)

            if aula_comun:
                aula_final = aula_comun
            else:
                # Elegir aula por fecha
                qs_dia = aulas_disponibles_en_fecha_hora(
                    fecha=f,
                    hora_inicio=hora_inicio,
                    hora_fin=hora_fin,
                    capacidad=capacidad,
                    num_ordenadores=num_ordenadores,
                    altavoces=altavoces,
                    proyector=proyector,
                    camara=camara,
                    enchufes=enchufes,
                )

                if not qs_dia.exists():
                    raise serializers.ValidationError({
                        "aulas": f"No hay aulas disponibles para la fecha {f.isoformat()} con esos requisitos."
                    })
                if aulas_por_fecha:
                    aula_sel = (aulas_por_fecha.get(f.isoformat()) or "").strip()
                    if not aula_sel:
                        raise serializers.ValidationError({
                            "aulas_por_fecha": f"Falta aula seleccionada para la fecha {f.isoformat()}."
                        })
                    if not qs_dia.filter(nombre=aula_sel).exists():
                        raise serializers.ValidationError({
                            "aulas_por_fecha": f"El aula {aula_sel} no está disponible o no cumple requisitos para {f.isoformat()}."
                        })
                    aula_final = aula_sel

                elif id_aula_elegida and qs_dia.filter(id=id_aula_elegida).exists():
                    aula_final = id_aula_elegida
                else:
                    aula_final = qs_dia.values_list("id", flat=True).first()
            
            inicio_dt = datetime.combine(f, hora_inicio)
            fin_dt = datetime.combine(f, hora_fin)

            reserva = Reserva.objects.create(
                id_aula_id=aula_final,
                id_dia=dia_obj,
                estado=estado_final,
                tipo="P",
                hora_inicio=hora_inicio,
                hora_fin=hora_fin,
            )

            reserva_puntual = ReservaPuntual.objects.create(
                id_reserva=reserva,
                id_responsable=responsable,
                capacidad_solicitada=capacidad,
                motivo=motivo,
                inicio=inicio_dt,
                fin=fin_dt,
                num_ordenadores_solicitados=num_ordenadores,
                altavoces_solicitados=altavoces,
                proyector_solicitado=proyector,
                camara_solicitada=camara,
                enchufes_solicitados=enchufes,
                observaciones=observaciones,
            )

            ultimo_reserva_puntual = reserva_puntual

        return ultimo_reserva_puntual
    
    

    