from .models import Grado, Asignaturas, Grupo, Docente
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

class GrupoService:
    @staticmethod
    def listar_grupos():
        return Grupo.objects.all().order_by('grupoid')

    @staticmethod
    def obtener_grupo_por_id(grupo_id):
        return get_object_or_404(Grupo, grupoid=grupo_id)

    @staticmethod
    def crear_grupo(datos_grupo):
        return Grupo.objects.create(**datos_grupo)

    @staticmethod
    def actualizar_grupo(grupo_id, datos_actualizados):
        grupo = get_object_or_404(Grupo, grupoid=grupo_id)
        for campo, valor in datos_actualizados.items():
            setattr(grupo, campo, valor)
        grupo.save()
        return grupo

    @staticmethod
    def eliminar_grupo(grupo_id):
        grupo = GrupoService.obtener_grupo_por_id(grupo_id)
        grupo.delete()

class DocenteService:
    @staticmethod
    def listar_docentes():
        return Docente.objects.all().order_by('iddocente')

    @staticmethod
    def obtener_docente_por_id(docente_id):
        return get_object_or_404(Docente, iddocente=docente_id)

    @staticmethod
    def crear_docente(datos_docente):
        return Docente.objects.create(**datos_docente)

    @staticmethod
    def actualizar_docente(docente_id, datos_actualizados):
        docente = get_object_or_404(Docente, iddocente=docente_id)
        for campo, valor in datos_actualizados.items():
            setattr(docente, campo, valor)
        docente.save()
        return docente

    @staticmethod
    def eliminar_docente(docente_id):
        docente = DocenteService.obtener_docente_por_id(docente_id)
        docente.delete()