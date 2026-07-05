from django.db import transaction
from reservas.models import Reserva
from calendario.models import CambioDocencia, Dia, Curso, Examen, Festivo, Lectivo, Semestre, Tfg
from datetime import timedelta

def generar_calendario_academico(datos):
    """
    Genera el calendario académico de un curso a partir de las fechas de inicio y fin del curso, así como de los semestres y días festivos proporcionados. Crea registros en la tabla Dia para cada fecha del curso. Y valida si es lectivo o festivo, para añdir el registro en la tabla correspondiente.
    """

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
            },
            horario_cargado=False
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
        dias_a_crear = []
        lectivos_a_crear = []
        festivos_a_crear = []

        while dia_actual <= fecha_fin_curso:
            dia_semana_num = dia_actual.isoweekday()

            semestre_asignado = sem_1_objeto

            if dia_actual >= datos['fecha_inicio_2_semestre']:
                semestre_asignado = sem_2_objeto

            nuevo_dia = Dia(
                dia=dia_actual,
                id_semestre=semestre_asignado,
                dia_semana=dia_semana_num
            )

            dias_a_crear.append(nuevo_dia)
            
            if dia_actual in festivos or dia_semana_num == 7:
                festivos_a_crear.append(
                    Festivo(
                        id_dia=nuevo_dia,
                    )
                )
            

            if (dia_actual >= datos['fecha_inicio_1_semestre'] and dia_actual <= datos['fecha_fin_1_semestre']) or (dia_actual >= datos['fecha_inicio_2_semestre'] and dia_actual <= datos['fecha_fin_2_semestre']):
                if dia_actual not in festivos and dia_semana_num not in [6,7]:
                    lectivos_a_crear.append(
                        Lectivo(
                            id_dia=nuevo_dia,
                        )
                    )
            dia_actual += delta

        Dia.objects.bulk_create(dias_a_crear)
        Festivo.objects.bulk_create(festivos_a_crear)
        Lectivo.objects.bulk_create(lectivos_a_crear)

def obtener_dias_curso(curso):
    """
    Obtiene un diccionario con las fechas del curso y su tipo de día (lectivo, festivo, examen, cambio de docencia o TFG) a partir del curso proporcionado.
    """
    semestres = Semestre.objects.filter(curso_id=curso)

    dias = Dia.objects.filter(id_semestre__in=semestres).select_related('cambiodocencia', 'examen', 'festivo', 'lectivo', 'tfg', 'id_semestre')

    diccionario_dias = {}

    for dia in dias:
        fecha_str = dia.dia.strftime('%Y-%m-%d')
        if hasattr(dia, 'cambiodocencia'):
            diccionario_dias[fecha_str] = {
                "tipo": "CAMBIO_DOC",
                "sustituye_dia": dia.cambiodocencia.sustituye_dia
            }
        elif hasattr(dia, 'examen'):
            diccionario_dias[fecha_str] = {
                "tipo": "EXAMEN",
                "convocatoria": dia.examen.convocatoria
            }
        elif hasattr(dia, 'festivo'):
            diccionario_dias[fecha_str] = {
                "tipo": "FESTIVO",
                "nombre": dia.festivo.nombre,
                "alcance": dia.festivo.alcance
            }
        elif hasattr(dia, 'lectivo'):
            if dia.id_semestre.numero == 1:
                diccionario_dias[fecha_str] = {"tipo": "LECTIVO_S1"}
            else:
                diccionario_dias[fecha_str] = {"tipo": "LECTIVO_S2"}
        elif hasattr(dia, 'tfg'):
            diccionario_dias[fecha_str] = {
                "tipo": "TFG",
                "convocatoria": dia.tfg.convocatoria
            }

    return diccionario_dias

def modificar_tipo_dia(datos):
    """
    Modifica el tipo de día (lectivo, festivo, examen, cambio de docencia o TFG) de una lista de fechas proporcionada. Elimina cualquier registro existente para esas fechas en las tablas correspondientes antes de crear el nuevo registro con el tipo de día actualizado.
    """
    fechas = datos['fechas']
    tipo = datos['tipo']

    with transaction.atomic():

        for fecha in fechas:
            dia_objeto = Dia.objects.get(dia=fecha)

            if tipo != 'FESTIVO' and dia_objeto.dia.weekday() >= 5:
                raise ValueError(f"La fecha {fecha} es fin de semana. Solo se pueden asignar días Festivos en fin de semana.")

            Lectivo.objects.filter(id_dia=dia_objeto).delete()
            Festivo.objects.filter(id_dia=dia_objeto).delete()
            Examen.objects.filter(id_dia=dia_objeto).delete()
            CambioDocencia.objects.filter(id_dia=dia_objeto).delete()
            Tfg.objects.filter(id_dia=dia_objeto).delete()

            if tipo in ['LECTIVO_S1', 'LECTIVO_S2']:
                Lectivo.objects.create(id_dia=dia_objeto)
            elif tipo == 'FESTIVO':
                Festivo.objects.create(
                    id_dia=dia_objeto,
                    nombre=datos.get('nombre', ''),
                    alcance=datos.get('alcance', '')
                )
            elif tipo == 'TFG':
                Tfg.objects.create(
                    id_dia=dia_objeto, 
                    convocatoria=datos.get('convocatoria', '')
                )
            elif tipo == 'EXAMEN':
                Examen.objects.create(
                    id_dia=dia_objeto, 
                    convocatoria=datos.get('convocatoria', '')
                )
            elif tipo == 'CAMBIO_DOC':
                CambioDocencia.objects.create(
                    id_dia=dia_objeto, 
                    sustituye_dia=datos.get('sustituye_dia')
                )

def eliminar_curso(id_curso):
    """
    Elimina un curso y todos los registros asociados a él, incluyendo semestres, días, festivos, lectivos, exámenes, cambios de docencia y TFGs.
    """

    with transaction.atomic():
        curso_objeto = Curso.objects.get(idcurso=id_curso)
        curso_objeto.delete()

        Dia.objects.filter(
            dia__gte=curso_objeto.fecha_inicio,
            dia__lte=curso_objeto.fecha_fin
        ).delete()

        # Reserva.objects.filter(
        #     tipo='R',
        #     id_dia__dia__gte=curso_objeto.fecha_inicio,
        #     id_dia__dia__lte=curso_objeto.fecha_fin
        # ).delete()