from .models import Grado, Asignaturas, Grupo
from django.shortcuts import get_object_or_404

class GradoService:
    @staticmethod
    def listar_grados():
        return Grado.objects.all().order_by('idgrado')

    @staticmethod
    def obtener_grado_por_id(grado_id):
        return get_object_or_404(Grado, idgrado=grado_id)

    @staticmethod
    def crear_grado(datos_grado):
        return Grado.objects.create(**datos_grado)

    @staticmethod
    def actualizar_grado(grado_id, datos_actualizados):
        grado = get_object_or_404(Grado, idgrado=grado_id)
        for campo, valor in datos_actualizados.items():
            setattr(grado, campo, valor)
        grado.save()
        return grado

    @staticmethod
    def eliminar_grado(grado_id):
        grado = GradoService.obtener_grado_por_id(grado_id)
        grado.delete()

