from reservas.models import Reserva, ReservaPeriodica, Aula
from docencia.models import Asignaturas, Docente, Grupo

def obtener_horario_grado(datos):
    curso = datos['curso']
    asignaturas = Asignaturas.objects.get(grado_id = curso)
    grupo = Grupo.objects.get(id_asignatura = asignaturas)

    reservasPeriodicas = ReservaPeriodica.objects.filter(grupo_id = grupo)
    reservas = Reserva.objects.filter(grupo_id = grupo)