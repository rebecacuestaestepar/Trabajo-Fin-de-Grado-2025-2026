from rest_framework import serializers
from reservas.models import Reserva

class ReservaResumenSerializer(serializers.ModelSerializer):
    altavoces_solicitados = serializers.BooleanField(source="altavoces", read_only=True)
    proyector_solicitado = serializers.BooleanField(source="proyector", read_only=True)
    camara_solicitada = serializers.BooleanField(source="camara", read_only=True)
    enchufes_solicitados = serializers.BooleanField(source="enchufes", read_only=True)

    num_ordenadores_solicitados = serializers.IntegerField(source="num_ordenadores", read_only=True)

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
    fecha = serializers.DateField(source="id_dia.dia", read_only=True)

    motivo = serializers.SerializerMethodField()
    correo_responsable = serializers.SerializerMethodField()
    capacidad_solicitada = serializers.SerializerMethodField()

    num_ordenadores_solicitados = serializers.SerializerMethodField()
    altavoces_solicitados = serializers.SerializerMethodField()
    proyector_solicitado = serializers.SerializerMethodField()
    camara_solicitada = serializers.SerializerMethodField()
    enchufes_solicitados = serializers.SerializerMethodField()

    class Meta:
        model = Reserva
        fields = [
            "idreserva",
            "nombre_aula",
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
        ]

    def _puntual(self, obj):
        # reverse OneToOne: ReservaPuntual.id_reserva -> obj.reservapuntual
        return getattr(obj, "reservapuntual", None)

    def get_motivo(self, obj):
        rp = self._puntual(obj)
        return rp.motivo if rp else None

    def get_correo_responsable(self, obj):
        rp = self._puntual(obj)
        if rp and rp.id_responsable_id:
            return rp.id_responsable.correo
        return None

    def get_capacidad_solicitada(self, obj):
        rp = self._puntual(obj)
        return rp.capacidad_solicitada if rp else None

    def get_num_ordenadores_solicitados(self, obj):
        rp = self._puntual(obj)
        return rp.num_ordenadores_solicitados if rp else 0

    def get_altavoces_solicitados(self, obj):
        rp = self._puntual(obj)
        return bool(rp.altavoces_solicitados) if rp else False

    def get_proyector_solicitado(self, obj):
        rp = self._puntual(obj)
        return bool(rp.proyector_solicitado) if rp else False

    def get_camara_solicitada(self, obj):
        rp = self._puntual(obj)
        return bool(rp.camara_solicitada) if rp else False

    def get_enchufes_solicitados(self, obj):
        rp = self._puntual(obj)
        return bool(rp.enchufes_solicitados) if rp else False