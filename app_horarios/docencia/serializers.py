from rest_framework import serializers
from calendario.models import Curso
from reservas.models import ReservaPeriodica
from docencia.models import Asignaturas, Docente, Grado, Grupo, Imparte
from django.core.exceptions import ObjectDoesNotExist

class CursoSerializer(serializers.ModelSerializer):
    """
    Representación de si se ha cargado el horario para un curso académico específico.
    """
    class Meta:
        model = Curso
        fields = ['idcurso', 'horario_cargado']

class GradoSerializer(serializers.ModelSerializer):
    """
    Representación de un grado académico.
    """
    class Meta:
        model = Grado
        fields = ['idgrado', 'nombre']

class HorarioSerializer(serializers.ModelSerializer):
    """
    Representación de una reserva periódica de docencia, con campos adicionales para mostrar información relevante como la asignatura, el grupo y el aula.
    """
    id_reserva = serializers.IntegerField(source='id_reserva.idreserva')
    asignatura = serializers.SerializerMethodField()
    nombre_completo = serializers.SerializerMethodField()
    aula = serializers.CharField(source='id_reserva.id_aula.nombre', default="Sin aula asignada")
    hora_inicio = serializers.TimeField(source='id_reserva.hora_inicio', format="%H:%M:%S")
    hora_fin = serializers.TimeField(source='id_reserva.hora_fin', format="%H:%M:%S")
    grupo = serializers.SerializerMethodField()
    dia_semana = serializers.SerializerMethodField()
    distint = serializers.SerializerMethodField()

    class Meta:
        model = ReservaPeriodica
        fields = ['id_reserva', 'asignatura', 'nombre_completo', 'aula', 'hora_inicio', 'hora_fin', 'grupo', 'dia_semana', 'distint']

    def get_asignatura(self, obj):
        """Obtiene la abreviatura de la asignatura si existe, y de lo contrario devuelve el nombre completo."""
        grupo = getattr(obj, 'id_grupo', None)
        if grupo and grupo.id_asignatura:
            asig = grupo.id_asignatura
            return asig.abreviatura if asig.abreviatura else asig.nombre
        return "Sin asignatura asignada"
    
    def get_nombre_completo(self, obj):
        """Obtiene el nombre completo de la asignatura, independientemente de si tiene abreviatura o no."""
        grupo = getattr(obj, 'id_grupo', None)
        if grupo and grupo.id_asignatura:
            return grupo.id_asignatura.nombre
        return "Sin asignatura asignada"
    
    def get_grupo(self, obj):
        """Obtiene el nombre del grupo, o un mensaje indicando que no tiene grupo asignado."""
        try:
            return str(obj.id_grupo.nombre) 
        except AttributeError:
            return "Sin grupo asignado"
        
    def get_dia_semana(self, obj):
        """Obtiene el número del día de la semana, o devuelve 1 (Lunes) si no se encuentra."""
        try:
            return obj.dia_semana
        except AttributeError:
            return 1
    
    def get_distint(self, obj):
        """Genera un distintivo único para la reserva, basado en la asignatura, grupo, día, hora y aula. Esto se utiliza para identificar de manera única cada docencia en el horario."""
        asig = obj.id_grupo.id_asignatura.idasignatura
        grupo = obj.id_grupo.grupoid
        dia = obj.dia_semana
        hi = obj.id_reserva.hora_inicio.strftime("%H:%M:%S")
        hf = obj.id_reserva.hora_fin.strftime("%H:%M:%S")
        aula = obj.id_reserva.id_aula.id if obj.id_reserva.id_aula else "Sin aula"
        return f"{asig}|{grupo}|{dia}|{hi}|{hf}|{aula}"

class MoverSerieReservaSerializer(serializers.Serializer):
    """Serializer para mover una serie de reservas periódicas de docencia, con campos para identificar la serie y el nuevo horario."""
    distint_serie = serializers.CharField()
    nuevo_dia = serializers.IntegerField(min_value=1, max_value=7)
    nuevo_hora_inicio = serializers.TimeField()
    nuevo_hora_fin = serializers.TimeField()

class AsignaturaSerializer(serializers.ModelSerializer):
    """Serializer para representar una asignatura, incluyendo el nombre del grado al que pertenece y el tipo formateado."""
    tipo_formateado = serializers.CharField(source='get_tipo_display', read_only=True)

    grado_nombre = serializers.SerializerMethodField()

    class Meta:
        model = Asignaturas
        fields = '__all__'
    
    def get_grado_nombre(self, obj):
        if not obj.grado_id:
            return "Sin grado"
            
        if hasattr(obj.grado_id, 'nombre'):
            return obj.grado_id.nombre
            
        try:
            id_limpio = str(obj.grado_id).strip()
            grado = Grado.objects.get(idgrado=id_limpio)
            return grado.nombre
        except Grado.DoesNotExist:
            return f"Desconocido (ID: '{obj.grado_id}')"

class DocenteSerializer(serializers.ModelSerializer):
    """Serializer para representar un docente, incluyendo su información de contacto."""
    class Meta:
        model = Docente
        fields = ['codigo', 'nombre', 'apellidos', 'correo', 'telefono']

class GrupoSerializer(serializers.ModelSerializer):
    """Serializer para representar un grupo de una asignatura, incluyendo el nombre de la asignatura y el aula, con manejo de casos donde estas relaciones no existan."""
    asignatura_nombre = serializers.SerializerMethodField()
    aula_nombre = serializers.SerializerMethodField()

    class Meta:
        model = Grupo
        fields = '__all__'

    def get_asignatura_nombre(self, obj):
        try:
            # Al intentar leer obj.id_asignatura, Django hace la consulta a la BD
            if not obj.id_asignatura:
                return "Sin asignatura"
            return obj.id_asignatura.nombre
            
        except ObjectDoesNotExist:
            # Si explota, usamos el sufijo '_id' de Django para sacar el valor crudo de la columna
            id_huerfano = getattr(obj, 'id_asignatura_id', 'Desconocido')
            return f"Asignatura no encontrada (ID: {id_huerfano})"

    def get_aula_nombre(self, obj):
        try:
            if not obj.id_aula:
                return "Sin aula"
            return obj.id_aula.nombre
            
        except ObjectDoesNotExist:
            id_huerfano = getattr(obj, 'id_aula_id', 'Desconocido')
            return f"Aula no encontrada (ID: {id_huerfano})"

class GradoSerializer(serializers.ModelSerializer):
    """Serializer para representar un grado académico, incluyendo su identificador, nombre, abreviatura y coordinador."""
    class Meta:
        model = Grado
        fields = '__all__'

class ImparteSerializer(serializers.ModelSerializer):
    """Serializer para representar la relación de qué asignatura imparte un docente, incluyendo los campos del modelo Imparte."""
    class Meta:
        model = Imparte
        fields = '__all__'
    