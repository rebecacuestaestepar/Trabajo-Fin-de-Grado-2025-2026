from datetime import timedelta

from reservas.limpiar_nombres_aulas import limpiar_nombre_aula
from reservas.excel_parser import DIAS_SEMANA
from aulas.models import Aula
from reservas.models import Reserva, ReservaPeriodica
from docencia.models import Grupo, Asignaturas
from calendario.models import Curso, Festivo, Lectivo, Semestre, Dia, CambioDocencia
from django.db import transaction

import uuid

def validar_horario_cargado(curso):
    curso_objeto = Curso.objects.filter(idcurso=curso, horario_cargado=True).first()

    if not curso_objeto:
        raise ValueError(f"Curso '{curso}' no encontrado en la base de datos.")
    
    num_reservas = Reserva.objects.filter(
            tipo='R',
            id_dia__dia__gte=curso_objeto.fecha_inicio,
            id_dia__dia__lte=curso_objeto.fecha_fin
        ).count()
    
    return curso_objeto.horario_cargado, num_reservas

def generar_reservas_periodicas(clases, curso):
    with transaction.atomic():
        curso_objeto = Curso.objects.filter(idcurso=curso).first()

        if not curso_objeto:
            raise ValueError(f"Curso '{curso}' no encontrado en la base de datos.")
        
        Reserva.objects.filter(
            tipo='R',
            id_dia__dia__gte=curso_objeto.fecha_inicio,
            id_dia__dia__lte=curso_objeto.fecha_fin
        ).delete()

        fecha_inicio_sem_1 = Semestre.objects.filter(curso_id=curso_objeto, numero=1).first().fecha_inicio
        fecha_inicio_sem_2 = Semestre.objects.filter(curso_id=curso_objeto, numero=2).first().fecha_inicio
        fecha_fin_sem_1 = Semestre.objects.filter(curso_id=curso_objeto, numero=1).first().fecha_fin
        fecha_fin_sem_2 = Semestre.objects.filter(curso_id=curso_objeto, numero=2).first().fecha_fin

        for clase in clases:

            nombre_aula_limpio = limpiar_nombre_aula(clase.aula)

            aula_objeto = Aula.objects.filter(nombre=nombre_aula_limpio).first()
            asignatura = Asignaturas.objects.filter(idasignatura=clase.cod_asig).first()

            if not aula_objeto:
                continue

            grupo_objeto = Grupo.objects.filter(id_asignatura=asignatura, nombre = clase.grupo).first()

            if not grupo_objeto:
                grupo_objeto = Grupo.objects.create(
                    id_asignatura=asignatura,
                    nombre=clase.grupo
                )
            

            semestre_academico = Asignaturas.objects.filter(idasignatura=clase.cod_asig).first().semestre_academico

            result = semestre_academico % 2
            if result == 1:
                fecha_inicio_sem = fecha_inicio_sem_1
                fecha_fin_sem = fecha_fin_sem_1
            else:
                fecha_inicio_sem = fecha_inicio_sem_2
                fecha_fin_sem = fecha_fin_sem_2

            dia_num = DIAS_SEMANA.get(clase.dia, 1)

            dia_actual = fecha_inicio_sem
            while dia_actual <= fecha_fin_sem:
                dia_bd = Dia.objects.filter(dia=dia_actual).first()

                if not dia_bd:
                    dia_actual += timedelta(days=1)
                    continue

                num_dia_db = dia_actual.weekday() + 1

                hay_clase = False

                cambio = CambioDocencia.objects.filter(id_dia=dia_bd).first()

                if cambio:
                    # Si hoy actúa como el día que buscamos
                    if cambio.sustituye_dia == dia_num:
                        hay_clase = True
                else:
                    # 2. Si no hay cambio, es un día normal. Comprueba si es lectivo y no festivo
                    if num_dia_db == dia_num:
                        es_festivo = Festivo.objects.filter(id_dia=dia_bd).exists()
                        es_lectivo = Lectivo.objects.filter(id_dia=dia_bd).exists()
                        if not es_festivo and es_lectivo:
                            hay_clase = True
                
                if hay_clase:
                    reserva_cambio = Reserva.objects.create(
                        id_aula=aula_objeto,
                        id_dia=dia_bd,
                        estado='A',
                        tipo='R',
                        hora_inicio=clase.hora_inicio,
                        hora_fin=clase.hora_fin
                    )

                    ReservaPeriodica.objects.create(
                        id_reserva=reserva_cambio,
                        id_grupo=grupo_objeto,
                        dia_semana=dia_num,
                        fecha_inicio=fecha_inicio_sem,
                        fecha_fin=fecha_fin_sem,
                        intervalo_semanas=1
                    )

                dia_actual += timedelta(days=1)

        curso_objeto.horario_cargado = True
        curso_objeto.save()

            
            
