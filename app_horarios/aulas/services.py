from .models import Aula
from django.shortcuts import get_object_or_404

class AulaService:
        @staticmethod
        def list():
            return Aula.objects.all().order_by('id')
    
        @staticmethod
        def retrieve(aula_id):
            return get_object_or_404(Aula, id=aula_id)
    
        @staticmethod
        def create(datos_aula):
            return Aula.objects.create(**datos_aula)
    
        @staticmethod
        def update(aula_id, datos_actualizados):
            aula = get_object_or_404(Aula, id=aula_id)
            for campo, valor in datos_actualizados.items():
                setattr(aula, campo, valor)
            aula.save()
            return aula
    
        @staticmethod
        def destroy(aula_id):
            aula = AulaService.retrieve(aula_id)
            aula.delete()