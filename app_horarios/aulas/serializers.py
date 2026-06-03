# aulas/serializers.py
from rest_framework import serializers

from aulas.models import Aula

class AulaDisponibleRequestSerializer(serializers.Serializer):
    """
    Validación de los parámetros para buscar aulas disponibles según criterios de capacidad, recursos y horario.

    Soporta la generación de reservas periódicas indicando un rango de fechas y día de semana para la recurrencia.
     - fecha: Fecha específica para buscar aulas disponibles (opcional si se generan reservas periódicas)
     - hora_inicio: Hora de inicio del intervalo de tiempo para la reserva (requerido)
     - hora_fin: Hora de fin del intervalo de tiempo para la reserva (requerido)
     - capacidad_solicitada: Número mínimo de plazas que debe tener el aula (requerido)
     - num_ordenadores: Número mínimo de ordenadores que debe tener el aula (opcional)
     - altavoces: Indica si el aula debe tener altavoces (opcional)
     - proyector: Indica si el aula debe tener proyector (opcional)
     - camaras: Indica si el aula debe tener cámaras (opcional)
     - enchufes: Indica si el aula debe tener enchufes (opcional)
     - generar_periodica: Indica si se deben generar reservas periódicas a partir de esta
     - fecha_inicio_periodo: Fecha de inicio del período para generar reservas periódicas (requerida si generar_periodica es True)
     - fecha_fin_periodo: Fecha de fin del período para generar reservas periódicas (requerida si generar_periodica es True)
     - dia_semana_periodica: Día de la semana para las reservas periódicas (requerida si generar_periodica es True, lunes = 1, ..., viernes = 5)
    """
    fecha = serializers.DateField(required=False)
    hora_inicio = serializers.TimeField()
    hora_fin = serializers.TimeField()
    capacidad_solicitada = serializers.IntegerField(min_value=0)
    num_ordenadores = serializers.IntegerField(required=False, allow_null=True, min_value=0)

    altavoces = serializers.BooleanField(required=False, default=False)
    proyector = serializers.BooleanField(required=False, default=False)
    camaras = serializers.BooleanField(required=False, default=False)
    enchufes = serializers.BooleanField(required=False, default=False)

    generar_periodica = serializers.BooleanField(required=False, default=False)
    fecha_inicio_periodo = serializers.DateField(required=False)
    fecha_fin_periodo = serializers.DateField(required=False)
    dia_semana_periodica = serializers.IntegerField(required=False, min_value=1, max_value=5)


class AulaMiniSerializer(serializers.Serializer):
    """
    Representación simplificada de un aula para mostrar en el listado de gestiones de reservas.
     - nombre: Nombre del aula
     - capacidad: Capacidad del aula
     - num_ordenadores: Número de ordenadores en el aula
     - altavoces: Indica si el aula tiene altavoces
     - proyector: Indica si el aula tiene proyector
     - camara: Indica si el aula tiene cámaras
     - enchufes: Indica si el aula tiene enchufes (puede ser null si no se especifica)
    """
    nombre = serializers.CharField()
    capacidad = serializers.IntegerField()
    num_ordenadores = serializers.IntegerField()
    altavoces = serializers.BooleanField()
    proyector = serializers.BooleanField()
    camara = serializers.BooleanField()
    enchufes = serializers.BooleanField(allow_null=True)


class AulaMenuSerializer(serializers.ModelSerializer):
    "Serializer para mostrar la información básica de un aula en el listado para ver la ocupación de un aula. Solo incluye el id y nombre del aula."
    class Meta:
        model = Aula
        fields = ["id", "nombre"]


class OcupacionAulaEventosQuerySerializer(serializers.Serializer):
    """
    Serializer para validar los parámetros de consulta de ocupación de un aula.
    Es utilizado en una peticion GET desde FullCalendar para obtener las reservas que ocupan un aula en un rango de fechas determinado.
     - aula: ID del aula a consultar (requerido)
     - start: Fecha y hora de inicio del rango a consultar (requerido)
     - end: Fecha y hora de fin del rango a consultar (requerido)
     - tipo: Tipo de reservas a incluir en la respuesta (opcional, por defecto "AMBAS"). Puede ser:
        - "AMBAS": Incluir tanto reservas puntuales como periódicas.
        - "PUNTUAL": Incluir solo reservas puntuales.
        - "PERIODICA": Incluir solo reservas periódicas.
    """
    aula = serializers.CharField(required=True, max_length=20)
    start = serializers.DateTimeField(required=True)
    end = serializers.DateTimeField(required=True)
    tipo = serializers.ChoiceField(
        choices=["AMBAS", "PUNTUAL", "PERIODICA"],
        required=False,
        default="AMBAS"
    )

    def validate_aula(self, value):
        """Valida individualmente que el nombre del aula exista en la BD."""
        if not Aula.objects.filter(nombre=value).exists():
            raise serializers.ValidationError("El aula indicada no existe.")
        return value

    def validate(self, data):
        """Garantiza el orden cronológico del rango."""
        if data['start'] >= data['end']:
            raise serializers.ValidationError(
                {"end": "El parámetro 'end' debe ser posterior a 'start'."}
            )
        return data

class AulaSerializer(serializers.ModelSerializer):
    "Serializer para representar la información de un aula, incluyendo campos formateados para mostrar en la interfaz de usuario."
    campus_formateado = serializers.CharField(source='get_campus_display', read_only=True)

    m2 = serializers.FloatField(required=False)

    class Meta:
        model = Aula
        fields = '__all__'