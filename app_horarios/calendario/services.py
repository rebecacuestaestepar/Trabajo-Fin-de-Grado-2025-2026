from django.db import transaction
from calendario.models import Dia, Curso, Festivo, Lectivo, Semestre
from datetime import timedelta

def generar_calendario_academico(datos):

    with transaction.atomic():
        curso = datos['curso']
        fecha_inicio_curso = datos['fecha_inicio_curso']
        fecha_fin_curso = datos['fecha_fin_curso']
        festivos = datos.get('festivos', [])

        curso_objeto, _ = Curso.objects.update_or_create(
            idcurso=curso,
            defaults={
                'fecha_inicio': fecha_inicio_curso,
                'fecha_fin': fecha_fin_curso
            }
        )

        sem_1_objeto, _ = Semestre.objects.update_or_create(
            idsemestre=f"{curso}-1",
            curso_id=curso_objeto,
            numero=1,
            defaults={
                'fecha_inicio': datos['fecha_inicio_1_semestre'],
                'fecha_fin': datos['fecha_fin_1_semestre']
            }
        )

        sem_2_objeto, _ = Semestre.objects.update_or_create(
            idsemestre=f"{curso}-2",
            curso_id=curso_objeto,
            numero=2,
            defaults={
                'fecha_inicio': datos['fecha_inicio_2_semestre'],
                'fecha_fin': datos['fecha_fin_2_semestre']
            }
        )

        Dia.objects.filter(id_semestre__in=[sem_1_objeto, sem_2_objeto]).delete()

        dia_actual = fecha_inicio_curso
        delta = timedelta(days=1)
        dias_a_crar = []
        lectivos_a_crear = []
        festivos_a_crear = []

        while dia_actual <= fecha_fin_curso:
            #semestre_asignado = None
            dia_semana_num = dia_actual.isoweekday()

            #if datos["fecha_inicio_1_semestre"] <= dia_actual <= datos["fecha_fin_1_semestre"]:
                #semestre_asignado = sem_1_objeto
            #elif datos["fecha_inicio_2_semestre"] <= dia_actual <= datos["fecha_fin_2_semestre"]:
                #semestre_asignado = sem_2_objeto

            semestre_asignado = sem_1_objeto

            if dia_actual >= datos['fecha_inicio_2_semestre']:
                semestre_asignado = sem_2_objeto

            nuevo_dia = Dia(
                dia=dia_actual,
                id_semestre=semestre_asignado,
                dia_semana=dia_semana_num
            )

            dias_a_crar.append(nuevo_dia)
            
            if dia_actual in festivos or dia_semana_num == 7:
                festivos_a_crear.append(
                    Festivo(
                        id_dia=nuevo_dia,
                    )
                )
            

            if (dia_actual >= datos['fecha_inicio_1_semestre'] and dia_actual <= datos['fecha_fin_1_semestre']) or (dia_actual >= datos['fecha_inicio_2_semestre'] and dia_actual <= datos['fecha_fin_2_semestre'] not in festivos and dia_semana_num != 7):
                if dia_actual not in festivos and dia_semana_num != 7:
                    lectivos_a_crear.append(
                        Lectivo(
                            id_dia=nuevo_dia,
                        )
                    )
            dia_actual += delta

        Dia.objects.bulk_create(dias_a_crar)
        Festivo.objects.bulk_create(festivos_a_crear)
        Lectivo.objects.bulk_create(lectivos_a_crear)

            


