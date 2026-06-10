from .models import Grado, Asignaturas, Grupo, Docente, Imparte
from django.shortcuts import get_object_or_404
from django.db.models import F

class GradoService:    
    
    @staticmethod
    def list():
        """Obtiene todos los grados académicos disponibles, ordenados por su identificador."""
        return Grado.objects.all().order_by('idgrado')

    @staticmethod
    def retrieve(grado_id):
        """Obtiene un grado académico específico por su identificador. Devuelve el objeto Grado correspondiente, o genera un error 404 si no se encuentra."""
        return get_object_or_404(Grado, idgrado=grado_id)

    @staticmethod
    def create(datos_grado):
        """Crea un nuevo grado académico con los datos proporcionados. Devuelve el objeto Grado recién creado."""
        return Grado.objects.create(**datos_grado)

    @staticmethod
    def update(grado_id, datos_actualizados):
        """Actualiza un grado académico existente con los datos proporcionados. Devuelve el objeto Grado actualizado, o genera un error 404 si no se encuentra el grado a actualizar."""
        grado = get_object_or_404(Grado, idgrado=grado_id)
        for campo, valor in datos_actualizados.items():
            setattr(grado, campo, valor)
        grado.save()
        return grado

    @staticmethod
    def delete(grado_id):
        """Elimina un grado académico específico por su identificador. Devuelve None si la eliminación es exitosa, o genera un error 404 si no se encuentra el grado a eliminar."""
        grado = GradoService.retrieve(grado_id)
        grado.delete()

def lista_mini_grados():
    """Obtiene una lista de diccionarios con el identificador y nombre de cada grado académico, ordenados por nombre."""
    return Grado.objects.values('idgrado', 'nombre').order_by('nombre')

class AsignaturaService:

    @staticmethod
    def list():
        """Obtiene todas las asignaturas disponibles, ordenadas por su identificador."""
        return Asignaturas.objects.all().order_by('idasignatura')

    @staticmethod
    def retrieve(asignatura_id):
        """Obtiene una asignatura específica por su identificador. Devuelve el objeto Asignaturas correspondiente, o genera un error 404 si no se encuentra."""
        return get_object_or_404(Asignaturas, idasignatura=asignatura_id)

    @staticmethod
    def create(datos_asignatura):
        """Crea una nueva asignatura con los datos proporcionados. Devuelve el objeto Asignaturas recién creado."""
        return Asignaturas.objects.create(**datos_asignatura)

    @staticmethod
    def update(asignatura_id, datos_actualizados):
        """Actualiza una asignatura existente con los datos proporcionados. Devuelve el objeto Asignaturas actualizado, o genera un error 404 si no se encuentra la asignatura a actualizar."""
        asignatura = get_object_or_404(Asignaturas, idasignatura=asignatura_id)
        for campo, valor in datos_actualizados.items():
            setattr(asignatura, campo, valor)
        asignatura.save()
        return asignatura

    @staticmethod
    def delete(asignatura_id):
        """Elimina una asignatura específica por su identificador. Devuelve None si la eliminación es exitosa, o genera un error 404 si no se encuentra la asignatura a eliminar."""
        asignatura = AsignaturaService.retrieve(asignatura_id)
        asignatura.delete()

def lista_mini_asignaturas():
    """Obtiene una lista de diccionarios con el identificador, el nombre y la abreviatura del grado al que corresponde la asignatura de cada asignatura, ordenados por el nombre del grado y luego por el nombre de la asignatura."""
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
        """Obtiene todos los grupos disponibles, ordenados por su identificador."""
        return Grupo.objects.all().order_by('grupoid')

    @staticmethod
    def retrieve(grupo_id):
        """Obtiene un grupo específico por su identificador. Devuelve el objeto Grupo correspondiente, o genera un error 404 si no se encuentra."""
        return get_object_or_404(Grupo, grupoid=grupo_id)

    @staticmethod
    def create(datos_grupo):
        """Crea un nuevo grupo con los datos proporcionados. Devuelve el objeto Grupo recién creado."""
        return Grupo.objects.create(**datos_grupo)

    @staticmethod
    def update(grupo_id, datos_actualizados):
        """Actualiza un grupo existente con los datos proporcionados. Devuelve el objeto Grupo actualizado, o genera un error 404 si no se encuentra el grupo a actualizar."""
        grupo = get_object_or_404(Grupo, grupoid=grupo_id)
        for campo, valor in datos_actualizados.items():
            setattr(grupo, campo, valor)
        grupo.save()
        return grupo

    @staticmethod
    def delete(grupo_id):
        """Elimina un grupo específico por su identificador. Devuelve None si la eliminación es exitosa, o genera un error 404 si no se encuentra el grupo a eliminar."""
        grupo = GrupoService.retrieve(grupo_id)
        grupo.delete()

def lista_mini_grupos():
    """Obtiene una lista de diccionarios con el identificador y el nombre de cada grupo, ordenados por su identificador."""
    return Grupo.objects.values('grupoid', 'nombre').order_by('grupoid')

class DocenteService:    

    @staticmethod
    def list():
        """Obtiene todos los docentes disponibles, ordenados por su código."""
        return Docente.objects.all().order_by('codigo')

    @staticmethod
    def retrieve(docente_id):
        """Obtiene un docente específico por su código. Devuelve el objeto Docente correspondiente, o genera un error 404 si no se encuentra."""
        return get_object_or_404(Docente, codigo=docente_id)

    @staticmethod
    def create(datos_docente):
        """Crea un nuevo docente con los datos proporcionados. Devuelve el objeto Docente recién creado."""
        return Docente.objects.create(**datos_docente)

    @staticmethod
    def update(docente_id, datos_actualizados):
        """Actualiza un docente existente con los datos proporcionados. Devuelve el objeto Docente actualizado, o genera un error 404 si no se encuentra el docente a actualizar."""
        docente = get_object_or_404(Docente, codigo=docente_id)
        for campo, valor in datos_actualizados.items():
            setattr(docente, campo, valor)
        docente.save()
        return docente

    @staticmethod
    def delete(docente_id):
        """Elimina un docente específico por su código. Devuelve None si la eliminación es exitosa, o genera un error 404 si no se encuentra el docente a eliminar."""
        docente = DocenteService.retrieve(docente_id)
        docente.delete()

def lista_mini_docentes():
    """Obtiene una lista de diccionarios con el código, nombre y apellidos de cada docente, ordenados por nombre y apellidos."""
    return Docente.objects.values('codigo', 'nombre', 'apellidos').order_by('nombre', 'apellidos')


class ImparteService:
    @staticmethod
    def list():
        """Obtiene una lista con el id de la relación, el código, nombre y apellidos del docente, el id y nombre de la asignatura y la abreviatura del grado al que pertenece la asignatura de cada relación entre docente y asignatura, ordenados por la abreviatura del grado, luego por el nombre de la asignatura y finalmente por los apellidos del docente."""
        return Imparte.objects.select_related(
            'codigo_docente', 
            'id_asignatura', 
            'id_asignatura__grado_id'
        ).annotate(
            docente_nombre=F('codigo_docente__nombre'),
            docente_apellidos=F('codigo_docente__apellidos'),
            asignatura_nombre=F('id_asignatura__nombre'),
            grado_abreviatura=F('id_asignatura__grado_id__abreviatura')
        ).values(
            'id',
            'codigo_docente',
            'docente_nombre',
            'docente_apellidos',
            'id_asignatura',
            'asignatura_nombre',
            'grado_abreviatura'
        ).order_by(
            'grado_abreviatura', 
            'asignatura_nombre', 
            'docente_apellidos'
        )

    @staticmethod
    def retrieve(id):
        """Obtiene una relación específica entre docente y asignatura por su id. Devuelve el objeto Imparte correspondiente, o genera un error 404 si no se encuentra."""
        return get_object_or_404(Imparte, id=id)

    @staticmethod
    def create(datos_imparte):
        """Crea una nueva relación entre docente y asignatura con los datos proporcionados. Devuelve el objeto Imparte recién creado."""
        return Imparte.objects.create(**datos_imparte)

    @staticmethod
    def update(id, datos_actualizados):
        """Actualiza una relación existente entre docente y asignatura con los datos proporcionados. Devuelve el objeto Imparte actualizado, o genera un error 404 si no se encuentra la relación a actualizar."""
        imparte = get_object_or_404(Imparte, id=id)
        for campo, valor in datos_actualizados.items():
            setattr(imparte, campo, valor)
        imparte.save()
        return imparte

    @staticmethod
    def delete(imparte_id):
        """Elimina una relación específica entre docente y asignatura por su id. Devuelve None si la eliminación es exitosa, o genera un error 404 si no se encuentra la relación a eliminar."""
        imparte = ImparteService.retrieve(imparte_id)
        imparte.delete()