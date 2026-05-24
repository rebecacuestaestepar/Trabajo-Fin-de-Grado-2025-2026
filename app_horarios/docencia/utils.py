from calendario.models import CambioDocencia, Dia, Lectivo, Semestre
from datetime import timedelta

def calcular_nuevas_fechas(semestre_obj, nuevo_dia, old_dia, reservas_actuales):
    nuevas_fechas = []
    fecha_inicio_semestre = semestre_obj.fecha_inicio
    fecha_fin_semestre = semestre_obj.fecha_fin

    dia_actual = fecha_inicio_semestre

    if old_dia == nuevo_dia:
        nuevas_fechas = [r.id_reserva.id_dia for r in reservas_actuales]
    else:
        while dia_actual <= fecha_fin_semestre:
            dia = Dia.objects.filter(dia=dia_actual).first()
            lectivo = Lectivo.objects.filter(id_dia=dia).exists()
            cambio_docencia = CambioDocencia.objects.filter(id_dia=dia).first()

            if (dia and lectivo and not cambio_docencia and dia.dia_semana == nuevo_dia) or (dia and cambio_docencia and cambio_docencia.sustituye_dia == nuevo_dia):
                nuevas_fechas.append(dia)
            dia_actual += timedelta(days=1)
        

    return nuevas_fechas