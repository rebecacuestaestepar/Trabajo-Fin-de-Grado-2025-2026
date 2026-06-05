from .models import Asignaturas, Grado, Grupo
from reservas.models import Reserva, ReservaPeriodica
from decimal import Decimal
from aulas.models import Aula
from calendario.models import Semestre, Dia, Lectivo, CambioDocencia
from datetime import timedelta
from django.db import transaction

def obtener_grados():
    grados = Grado.objects.all().values('idgrado', 'nombre').order_by('nombre')
    return list(grados)

def obtener_cursos_grado(id_grado):
    cursos = Asignaturas.objects.filter(grado_id=id_grado).values_list('curso_grado', flat=True).distinct().order_by('curso_grado')
    return [int(curso) for curso in cursos if curso is not None]

def obtener_semestres_por_grado_semestre(id_grado, curso_grado):
    semestres = Asignaturas.objects.filter(grado_id=id_grado, curso_grado=curso_grado).values_list('semestre_academico', flat=True).distinct().order_by('semestre_academico')
    return [int(semestre) for semestre in semestres if semestre is not None]

def obtener_asignaturas_por_grado_curso_semestre(id_curso, id_grado, semestre_academico):
    asignaturas = Asignaturas.objects.filter(grado_id=int(id_grado), curso_grado=Decimal(id_curso), semestre_academico=Decimal(semestre_academico)).values('idasignatura', 'nombre', 'abreviatura')
    return list(asignaturas)

def obtener_grupos_asignatura(id_asignatura):
    grupos = Grupo.objects.filter(id_asignatura=id_asignatura).values('grupoid', 'nombre')
    return list(grupos)


def obtener_aulas_libres(dia_semana, hora_inicio, hora_fin):
    reservas_solapadas = ReservaPeriodica.objects.filter(
        dia_semana=int(dia_semana),
        id_reserva__hora_inicio__lt=hora_fin,
        id_reserva__hora_fin__gt=hora_inicio
    )

    ids_aulas_ocupadas = reservas_solapadas.values_list('id_reserva__id_aula', flat=True)

    aulas_libres = Aula.objects.exclude(
        pk__in=ids_aulas_ocupadas
    ).exclude(
        nombre__iexact="Aula 0"
    ).values(
        'id',
        'nombre', 
        'capacidad', 
        'num_ordenadores'
    ).order_by('nombre')

    return list(aulas_libres)


def crear_reserva_periodica(id_curso, semestre_num, datos_reserva):
    num_dia = datos_reserva.get('dia_semana')
    grupo = datos_reserva.get('id_grupo')
    aula = datos_reserva.get('id_aula')
    hora_inicio = datos_reserva.get('hora_inicio')
    hora_fin = datos_reserva.get('hora_fin')

    semestre = 2
    if semestre_num % 2 == 1:
        semestre = 1

    print(f"Creando reserva periódica para curso {id_curso}, semestre {semestre_num} (semestre académico {semestre}), grupo {grupo}, aula {aula}, día semana {num_dia}, hora inicio {hora_inicio}, hora fin {hora_fin}")
    
    semestre_obj = Semestre.objects.filter(curso_id=id_curso, numero=semestre).first()

    dia_actual = semestre_obj.fecha_inicio

    aula = Aula.objects.filter(nombre=aula).first()

    with transaction.atomic():

        while dia_actual <= semestre_obj.fecha_fin:
            dia = Dia.objects.filter(dia=dia_actual).first()

            if dia and dia.dia_semana == num_dia:
                lectivo = Lectivo.objects.filter(id_dia=dia.dia).first()
                cambio_docencia = CambioDocencia.objects.filter(id_dia=dia.dia).first()

                if (lectivo and not cambio_docencia) or (cambio_docencia and cambio_docencia.sustituye_dia == num_dia):
                    reserva = Reserva.objects.create(
                        id_aula = aula,
                        id_dia = dia,
                        estado = 'A',
                        tipo = 'R',
                        hora_inicio = hora_inicio,
                        hora_fin = hora_fin
                    )

                    ReservaPeriodica.objects.create(
                        id_reserva = reserva,
                        id_grupo_id = grupo,
                        dia_semana = num_dia,
                        fecha_inicio = semestre_obj.fecha_inicio,
                        fecha_fin = semestre_obj.fecha_fin,
                        intervalo_semanas = 1
                    )
            dia_actual += timedelta(days=1)


def obtener_datos_reserva_periodica(id_reserva):
    try:
        reserva_periodica = ReservaPeriodica.objects.select_related('id_reserva', 'id_grupo').get(id_reserva=id_reserva)
        asignatura = Grupo.objects.select_related('id_asignatura').get(grupoid=reserva_periodica.id_grupo.grupoid).id_asignatura
        semestre = Asignaturas.objects.filter(idasignatura=asignatura.idasignatura).values_list('semestre_academico', flat=True).first()
        curso = Asignaturas.objects.filter(idasignatura=asignatura.idasignatura).values_list('curso_grado', flat=True).first()
        id_grado = Asignaturas.objects.filter(idasignatura=asignatura.idasignatura).values_list('grado_id', flat=True).first()
        
        semestre_obj = Semestre.objects.filter(
            fecha_inicio=reserva_periodica.fecha_inicio, 
            fecha_fin=reserva_periodica.fecha_fin
        ).first()

        curso_academico = ""

        if semestre_obj:
            curso_academico = semestre_obj.curso_id.idcurso

        return {
            'id_reserva': reserva_periodica.id_reserva.idreserva,
            'aula': reserva_periodica.id_reserva.id_aula.nombre if reserva_periodica.id_reserva.id_aula else None,
            'id_dia': reserva_periodica.id_reserva.id_dia.dia if reserva_periodica.id_reserva.id_dia else None,
            'hora_inicio': reserva_periodica.id_reserva.hora_inicio.strftime("%H:%M"),
            'hora_fin': reserva_periodica.id_reserva.hora_fin.strftime("%H:%M"),
            'grupo': reserva_periodica.id_grupo.grupoid if reserva_periodica.id_grupo else None,
            'dia_semana': reserva_periodica.dia_semana,
            'semestre': semestre,
            'curso': curso,
            'grado': id_grado,
            'asignatura': asignatura.idasignatura if asignatura else None,
            'curso_academico': curso_academico
        }
    except ReservaPeriodica.DoesNotExist:
        return None
    
def reserva_desde_horario_grado(id_grado, semestre_academico):
    grado = Grado.objects.filter(idgrado=id_grado).values('idgrado', 'nombre').first()
    curso = Asignaturas.objects.filter(grado_id=id_grado, semestre_academico=semestre_academico).values_list('curso_grado', flat=True).distinct().first()
    asignaturas = Asignaturas.objects.filter(grado_id=id_grado, semestre_academico=semestre_academico)

    return {
        'grado': grado,
        'semestre_academico': semestre_academico,
        'curso': curso,
        'asignaturas': list(asignaturas.values('idasignatura', 'nombre', 'abreviatura'))
    }


def eliminar_reserva_periodica(id_curso, semestre_num, firma_serie):
    """
    Elimina una serie de reservas periódicas
    """

    with transaction.atomic():
        try:
            asignatura_id, grupo_id, old_dia, old_hi, old_hf, aula_id = firma_serie.split('|')
        except ValueError:
            return {"exito": False, "estado": "error", "mensaje": "Firma inválida."}
        
        semestre = 2
        if semestre_num % 2 == 1:
            semestre = 1

        semestre_obj = Semestre.objects.filter(curso_id=id_curso, numero=semestre).first()

        if not semestre_obj:
            return {"exito": False, "estado": "error", "mensaje": "Semestre no encontrado."}

        reservas_actuales = ReservaPeriodica.objects.filter(
            id_grupo__id_asignatura__idasignatura=asignatura_id,
            id_grupo__grupoid=grupo_id,
            dia_semana=old_dia,
            id_reserva__hora_inicio=old_hi,
            id_reserva__hora_fin=old_hf,
            fecha_inicio__gte=semestre_obj.fecha_inicio,
            fecha_fin__lte=semestre_obj.fecha_fin,
        )

        if not reservas_actuales.exists():
            return {"exito": False, "estado": "error", "mensaje": "No se encontraron las reservas a eliminar."}

        ids_reservas_fisicas = list(reservas_actuales.values_list('id_reserva', flat=True))

        reservas_actuales.delete()
        
        Reserva.objects.filter(idreserva__in=ids_reservas_fisicas).delete()

        return {"exito": True, "estado": "exito", "mensaje": "La serie de reservas ha sido eliminada correctamente."}

    