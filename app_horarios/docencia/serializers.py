from rest_framework import serializers
from reservas.models import ReservaPeriodica
from docencia.models import Asignaturas, Docente, Grado, Grupo
from django.core.exceptions import ObjectDoesNotExist

class HorarioSerializer(serializers.ModelSerializer):
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
        grupo = getattr(obj, 'id_grupo', None)
        if grupo and grupo.id_asignatura:
            asig = grupo.id_asignatura
            return asig.abreviatura if asig.abreviatura else asig.nombre
        return "Sin asignatura asignada"
    
    def get_nombre_completo(self, obj):
        grupo = getattr(obj, 'id_grupo', None)
        if grupo and grupo.id_asignatura:
            return grupo.id_asignatura.nombre
        return "Sin asignatura asignada"
    
    def get_grupo(self, obj):
        try:
            return str(obj.id_grupo.nombre) 
        except AttributeError:
            return "Sin grupo asignado"
        
    def get_dia_semana(self, obj):
        try:
            return obj.dia_semana
        except AttributeError:
            return 1
    
    def get_distint(self, obj):
        asig = obj.id_grupo.id_asignatura.idasignatura
        grupo = obj.id_grupo.grupoid
        dia = obj.dia_semana
        hi = obj.id_reserva.hora_inicio.strftime("%H:%M:%S")
        hf = obj.id_reserva.hora_fin.strftime("%H:%M:%S")
        aula = obj.id_reserva.id_aula.id if obj.id_reserva.id_aula else "Sin aula"
        return f"{asig}|{grupo}|{dia}|{hi}|{hf}|{aula}"

class MoverSerieReservaSerializer(serializers.Serializer):
    distint_serie = serializers.CharField()
    nuevo_dia = serializers.IntegerField(min_value=1, max_value=7)
    nuevo_hora_inicio = serializers.TimeField()
    nuevo_hora_fin = serializers.TimeField()
    forzar = serializers.BooleanField(default=False)

class AsignaturaSerializer(serializers.ModelSerializer):
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
    class Meta:
        model = Docente
        fields = ['codigo', 'nombre', 'apellidos', 'correo', 'telefono']

class GrupoSerializer(serializers.ModelSerializer):
    asignatura_nombre = serializers.SerializerMethodField()
    aula_nombre = serializers.SerializerMethodField()

    class Meta:
        model = Grupo
        fields = '__all__'

    def get_asignatura_nombre(self, obj):
        # if not obj.id_asignatura:
        #     return "Sin asignatura"
        # if hasattr(obj.id_asignatura, 'nombre'):
        #     return obj.id_asignatura.nombre
        # return str(obj.id_asignatura)
        try:
            # Al intentar leer obj.id_asignatura, Django hace la consulta a la BD
            if not obj.id_asignatura:
                return "Sin asignatura"
            return obj.id_asignatura.nombre
            
        except ObjectDoesNotExist:
            # Si explota, usamos el sufijo '_id' mágico de Django para sacar el valor crudo de la columna
            id_huerfano = getattr(obj, 'id_asignatura_id', 'Desconocido')
            return f"Asignatura no encontrada (ID: {id_huerfano})"

    def get_aula_nombre(self, obj):
        # if not obj.id_aula:
        #     return "Sin aula"
        # if hasattr(obj.id_aula, 'nombre'):
        #     return obj.id_aula.nombre
        # return str(obj.id_aula)
        try:
            if not obj.id_aula:
                return "Sin aula"
            return obj.id_aula.nombre
            
        except ObjectDoesNotExist:
            id_huerfano = getattr(obj, 'id_aula_id', 'Desconocido')
            return f"Aula no encontrada (ID: {id_huerfano})"

class GradoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grado
        fields = '__all__'
    