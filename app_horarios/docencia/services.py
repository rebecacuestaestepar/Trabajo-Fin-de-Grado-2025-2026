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

class AsignaturaService:
    @staticmethod
    def listar_asignaturas():
        return Asignaturas.objects.all().order_by('idasignatura')

    @staticmethod
    def obtener_asignatura_por_id(asignatura_id):
        return get_object_or_404(Asignaturas, idasignatura=asignatura_id)

    @staticmethod
    def crear_asignatura(datos_asignatura):
        return Asignaturas.objects.create(**datos_asignatura)

    @staticmethod
    def actualizar_asignatura(asignatura_id, datos_actualizados):
        asignatura = get_object_or_404(Asignaturas, idasignatura=asignatura_id)
        for campo, valor in datos_actualizados.items():
            setattr(asignatura, campo, valor)
        asignatura.save()
        return asignatura

    @staticmethod
    def eliminar_asignatura(asignatura_id):
        asignatura = AsignaturaService.obtener_asignatura_por_id(asignatura_id)
        asignatura.delete()
