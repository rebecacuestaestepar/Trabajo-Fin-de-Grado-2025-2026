from limpiar_nombres_aulas import limpiar_nombre_aula
from excel_parser import DIAS_SEMANA
from aulas.models import Aula
from reservas.models import Reserva, ReservaPeriodica
from docencia.models import Grupo, Asignaturas
from calendario.models import Curso, Semestre
from django.db import transaction

import uuid

def generar_reservas_periodicas(clases, curso):

    with transaction.atomic():

        num_reservas_creadas = 0

        for clase in clases:

            nombre_aula_limpio = limpiar_nombre_aula(clase.aula)

            aula_objeto = Aula.objects.filter(nombre=nombre_aula_limpio).first()

            if not aula_objeto:
                continue

            grupo_objeto = Grupo.objects.filter(id_asignatura=clase.cod_asig, nombre = clase.grupo).first()

            if not grupo_objeto:
                grupo_objeto = Grupo.objects.create(
                    id_asignatura=clase.cod_asig,
                    nombre=clase.grupo
                )
            
            curso = Curso.objects.filter(id=curso).first()

            fecha_inicio_sem_1 = Semestre.objects.filter(curso=curso, numero=1).first().fecha_inicio
            fecha_inicio_sem_2 = Semestre.objects.filter(curso=curso, numero=2).first().fecha_inicio
            fecha_fin_sem_1 = Semestre.objects.filter(curso=curso, numero=1).first().fecha_fin
            fecha_fin_sem_2 = Semestre.objects.filter(curso=curso, numero=2).first().fecha_fin

            semestre_academico = Asignaturas.objects.filter(id=clase.cod_asig).first().semestre_academico

            result = semestre_academico % 2
            if result == 1:
                fecha_inicio_sem = fecha_inicio_sem_1
                fecha_fin_sem = fecha_fin_sem_1
            else:
                fecha_inicio_sem = fecha_inicio_sem_2
                fecha_fin_sem = fecha_fin_sem_2

            dia_num = DIAS_SEMANA.get(clase.dia, 1)

            reserva = Reserva.objects.create(
                idreserva=Reserva.next_id(),
                id_aula=aula_objeto,
                id_dia=dia_num,
                estado='A',
                tipo='R',
                hora_inicio=clase.hora_inicio,
                hora_fin=clase.hora_fin
            )

            ReservaPeriodica.objects.create(
                id_reserva=reserva,
                id_grupo=grupo_objeto,
                dia_semana=dia_num,
                fecha_inicio=fecha_inicio_sem,
                fecha_fin=fecha_fin_sem,
                intervalo_semanas=1
            )
            num_reservas_creadas += 1
