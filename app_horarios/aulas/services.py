from .models import Aula
from django.shortcuts import get_object_or_404

class AulaService:
        @staticmethod
        def listar_aulas():
            return Aula.objects.all().order_by('id')
    
        @staticmethod
        def obtener_aula_por_id(aula_id):
            return get_object_or_404(Aula, id=aula_id)
    
        @staticmethod
        def crear_aula(datos_aula):
            return Aula.objects.create(**datos_aula)
    
        @staticmethod
        def actualizar_aula(aula_id, datos_actualizados):
            aula = get_object_or_404(Aula, id=aula_id)
            for campo, valor in datos_actualizados.items():
                setattr(aula, campo, valor)
            aula.save()
            return aula
    
        @staticmethod
        def eliminar_aula(aula_id):
            aula = AulaService.obtener_aula_por_id(aula_id)
            aula.delete()