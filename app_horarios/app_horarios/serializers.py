from rest_framework import serializers
from .services import ENTIDADES

def validar_entidades_string(valor: str) -> str:
    """Valida que el parámetro sea 'all' o combinaciones válidas de las entidades."""
    if not valor or valor.strip().lower() == "all":
        return "all"
        
    partes = [p.strip().lower() for p in valor.split(",")]
    for parte in partes:
        if parte not in ENTIDADES:
            raise serializers.ValidationError(
                f"'{parte}' no es una entidad válida. Opciones: {list(ENTIDADES.keys())} o 'all'"
            )
    return valor

class EntityQuerySerializer(serializers.Serializer):
    """Valida los parámetros GET (?entidad=...) de exportación y plantilla."""
    entidad = serializers.CharField(required=False, default="all")

    def validate_entidad(self, valor):
        return validar_entidades_string(valor)

class ImportDatabaseSerializer(serializers.Serializer):
    """Valida el formulario POST de importación."""
    archivo = serializers.FileField(required=True)
    entidad = serializers.CharField(required=False, default="all")

    def validate_entidad(self, valor):
        return validar_entidades_string(valor)