from rest_framework import serializers
from reservas.models import Reserva

class ReservaResumenSerializer(serializers.ModelSerializer):
    """Serializer para el resumen de una reserva puntual, con información básica de la reserva y el responsable."""
    altavoces_solicitados = serializers.BooleanField(source="altavoces", read_only=True)
    proyector_solicitado = serializers.BooleanField(source="proyector", read_only=True)
    camara_solicitada = serializers.BooleanField(source="camara", read_only=True)
    enchufes_solicitados = serializers.BooleanField(source="enchufes", read_only=True)

    num_ordenadores_solicitados = serializers.IntegerField(source="num_ordenadores", read_only=True)
    nombre_aula = serializers.CharField(source="id_aula.nombre", read_only=True)

    class Meta:
        model = Reserva
        fields = [
            "idreserva",          
            "motivo",
            "correo_responsable",
            "fecha",
            "hora_inicio",
            "hora_fin",
            "capacidad_solicitada",
            "nombre_aula",
            "estado",            

            "altavoces_solicitados",
            "proyector_solicitado",
            "camara_solicitada",
            "enchufes_solicitados",
            "num_ordenadores_solicitados",
        ]


class ReservaTodasSerializer(serializers.ModelSerializer):
    """Serializer para el listado de todas las reservas, con información completa de la reserva y el responsable."""
    fecha = serializers.DateField(source="id_dia.dia", read_only=True)

    motivo = serializers.SerializerMethodField()
    correo_responsable = serializers.SerializerMethodField()
    capacidad_solicitada = serializers.SerializerMethodField()

    num_ordenadores_solicitados = serializers.SerializerMethodField()
    altavoces_solicitados = serializers.SerializerMethodField()
    proyector_solicitado = serializers.SerializerMethodField()
    camara_solicitada = serializers.SerializerMethodField()
    enchufes_solicitados = serializers.SerializerMethodField()

    id_aula = serializers.CharField(source="id_aula_id", read_only=True)
    nombre_aula = serializers.CharField(source="id_aula.nombre", read_only=True)

    class Meta:
        model = Reserva
        fields = [
            "idreserva",
            "estado",
            "tipo",
            "fecha",         
            "hora_inicio",
            "hora_fin",

            "motivo",
            "correo_responsable",
            "capacidad_solicitada",

            "num_ordenadores_solicitados",
            "altavoces_solicitados",
            "proyector_solicitado",
            "camara_solicitada",
            "enchufes_solicitados",
            "id_aula",
            "nombre_aula",
        ]

    def _puntual(self, obj):
        """Función auxiliar para obtener la reserva puntual asociada a la reserva, si existe."""
        return getattr(obj, "reservapuntual", None)

    def get_motivo(self, obj):
        """Obtenemos el motivo de la reserva puntual, si existe."""
        rp = self._puntual(obj)
        return rp.motivo if rp else None

    def get_correo_responsable(self, obj):
        """Obtenemos el correo del responsable de la reserva puntual, si existe."""
        rp = self._puntual(obj)
        if rp and rp.id_responsable_id:
            return rp.id_responsable.correo
        return None

    def get_capacidad_solicitada(self, obj):
        """Obtenemos la capacidad solicitada de la reserva puntual, si existe."""
        rp = self._puntual(obj)
        return rp.capacidad_solicitada if rp else None

    def get_num_ordenadores_solicitados(self, obj):
        """Obtenemos el número de ordenadores solicitados de la reserva puntual, si existe."""
        rp = self._puntual(obj)
        return rp.num_ordenadores_solicitados if rp else 0

    def get_altavoces_solicitados(self, obj):
        """Obtenemos si se solicitaron altavoces en la reserva puntual, si existe."""
        rp = self._puntual(obj)
        return bool(rp.altavoces_solicitados) if rp else False

    def get_proyector_solicitado(self, obj):
        """Obtenemos si se solicitó proyector en la reserva puntual, si existe."""
        rp = self._puntual(obj)
        return bool(rp.proyector_solicitado) if rp else False

    def get_camara_solicitada(self, obj):
        """Obtenemos si se solicitó cámara en la reserva puntual, si existe."""
        rp = self._puntual(obj)
        return bool(rp.camara_solicitada) if rp else False

    def get_enchufes_solicitados(self, obj):
        """Obtenemos si se solicitaron enchufes en la reserva puntual, si existe."""
        rp = self._puntual(obj)
        return bool(rp.enchufes_solicitados) if rp else False