import re

def limpiar_nombre_aula(nombre_aula):
    """
    Limpiamos el nombre del aula quitando Aula, y convirtiendo lab. o lab en Laboratorio sino va seguido de aula.
    """

    if not nombre_aula:
        return ""
    
    aula = str(nombre_aula).strip()

    aula = re.sub(r'(?i)^Aula\s+(?!Empresa|0\b)', '', aula)
    aula = re.sub(r'\s*\(.*?\)', '', aula).strip()

    aula = re.sub(r'(?i)^Inf\.\s+', 'Informática ', aula)

    aula = re.sub(r'(?i)^Lab\.?\s+(?=\d{2}-[a-zA-Z]\d)', 'Lab', aula)

    aula = re.sub(r'(?i)^Lab\.?\s+', 'Laboratorio ', aula)

    return aula.strip()
    
