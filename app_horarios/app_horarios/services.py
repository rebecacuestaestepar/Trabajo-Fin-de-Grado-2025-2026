# from calendario.models import Curso
# from reservas.models import Reserva, ReservaPeriodica, Aula
# from docencia.models import Asignaturas, Docente, Grado, Grupo

# def obtener_cursos_con_horario():
#     return Curso.objects.filter(horario_cargado=True).order_by('-idcurso')

# def obtener_grados_con_horario(curso):
#     return Grado.objects.filter(
#         asignaturas__grupo__reservaperiodica__fecha_inicio__gte=curso.fecha_inicio,
#         asignaturas__grupo__reservaperiodica__fecha_inicio__lte=curso.fecha_fin
#     ).distinct().order_by('nombre')