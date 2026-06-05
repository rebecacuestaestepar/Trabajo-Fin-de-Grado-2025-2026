from .models import Grado, Asignaturas, Grupo, Docente, Imparte
from django.shortcuts import get_object_or_404
from django.db.models import F

class GradoService:    
    
    @staticmethod
    def list():
        return Grado.objects.all().order_by('idgrado')

    @staticmethod
    def retrieve(grado_id):
        return get_object_or_404(Grado, idgrado=grado_id)

    @staticmethod
    def create(datos_grado):
        return Grado.objects.create(**datos_grado)

    @staticmethod
    def update(grado_id, datos_actualizados):
        grado = get_object_or_404(Grado, idgrado=grado_id)
        for campo, valor in datos_actualizados.items():
            setattr(grado, campo, valor)
        grado.save()
        return grado

    @staticmethod
    def delete(grado_id):
        grado = GradoService.retrieve(grado_id)
        grado.delete()

def lista_mini_grados():
        return Grado.objects.values('idgrado', 'nombre').order_by('nombre')

class AsignaturaService:

    @staticmethod
    def list():
        return Asignaturas.objects.all().order_by('idasignatura')

    @staticmethod
    def retrieve(asignatura_id):
        return get_object_or_404(Asignaturas, idasignatura=asignatura_id)

    @staticmethod
    def create(datos_asignatura):
        return Asignaturas.objects.create(**datos_asignatura)

    @staticmethod
    def update(asignatura_id, datos_actualizados):
        asignatura = get_object_or_404(Asignaturas, idasignatura=asignatura_id)
        for campo, valor in datos_actualizados.items():
            setattr(asignatura, campo, valor)
        asignatura.save()
        return asignatura

    @staticmethod
    def delete(asignatura_id):
        asignatura = AsignaturaService.retrieve(asignatura_id)
        asignatura.delete()

def lista_mini_asignaturas():
    return Asignaturas.objects.annotate(
        grado_abreviatura=F('grado_id__abreviatura')
    ).values(
        'idasignatura', 
        'nombre', 
        'grado_abreviatura'
    ).order_by(
        'grado_abreviatura', 
        'nombre'
    )

class GrupoService:

    @staticmethod
    def list():
        return Grupo.objects.all().order_by('grupoid')

    @staticmethod
    def retrieve(grupo_id):
        return get_object_or_404(Grupo, grupoid=grupo_id)

    @staticmethod
    def create(datos_grupo):
        return Grupo.objects.create(**datos_grupo)

    @staticmethod
    def update(grupo_id, datos_actualizados):
        grupo = get_object_or_404(Grupo, grupoid=grupo_id)
        for campo, valor in datos_actualizados.items():
            setattr(grupo, campo, valor)
        grupo.save()
        return grupo

    @staticmethod
    def delete(grupo_id):
        grupo = GrupoService.retrieve(grupo_id)
        grupo.delete()

def lista_mini_grupos():
        return Grupo.objects.values('grupoid', 'nombre').order_by('grupoid')

class DocenteService:    

    @staticmethod
    def list():
        return Docente.objects.all().order_by('codigo')

    @staticmethod
    def retrieve(docente_id):
        return get_object_or_404(Docente, codigo=docente_id)

    @staticmethod
    def create(datos_docente):
        return Docente.objects.create(**datos_docente)

    @staticmethod
    def update(docente_id, datos_actualizados):
        docente = get_object_or_404(Docente, codigo=docente_id)
        for campo, valor in datos_actualizados.items():
            setattr(docente, campo, valor)
        docente.save()
        return docente

    @staticmethod
    def delete(docente_id):
        docente = DocenteService.retrieve(docente_id)
        docente.delete()

def lista_mini_docentes():
        return Docente.objects.values('codigo', 'nombre').order_by('codigo')


class ImparteService:
    @staticmethod
    def list():
        return Imparte.objects.all()

    @staticmethod
    def retrieve(id):
        return get_object_or_404(Imparte, idimparte=id)

    @staticmethod
    def create(datos_imparte):
        return Imparte.objects.create(**datos_imparte)

    @staticmethod
    def update(id, datos_actualizados):
        imparte = get_object_or_404(Imparte, id=id)
        for campo, valor in datos_actualizados.items():
            setattr(imparte, campo, valor)
        imparte.save()
        return imparte

    @staticmethod
    def delete(imparte_id):
        imparte = ImparteService.retrieve(imparte_id)
        imparte.delete()