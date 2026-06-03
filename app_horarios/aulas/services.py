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

def lista_mini_aulas():
    return Aula.objects.values('id', 'nombre').exclude(nombre__iexact='Aula 0').order_by('id')

def obtener_aulas_menu(campus=None):
        """
        Lógica de negocio para obtener las aulas destinadas a los selectores/menús.
        Excluye registros inválidos y filtra opcionalmente por campus.
        """
        # 1. Query base con las reglas de negocio unificadas
        queryset = Aula.objects.exclude(nombre__iexact="Aula 0").order_by("nombre")
        
        # 2. Aplicamos el filtro si se ha solicitado un campus específico
        if campus:
            queryset = queryset.filter(campus__iexact=campus)
            
        return queryset