import re

def limpiar_nombre_aula(nombre_aula):
    """
    Limpiamos el nombre del aula quitando Aula, y convirtiendo lab. o lab en Laboratorio sino va seguido de aula.
    """

    if not nombre_aula:
        return ""
    
    aula = str(nombre_aula).strip()

    # Si encontramos el aula de empresa o el aula 0 no eliminamos el prefijo "Aula"
    aula = re.sub(r'(?i)^Aula\s+(?!Empresa|0\b)', '', aula)
    # Eliminamos cualquier texto entre paréntesis, incluyendo los paréntesis y los espacios alrededor
    aula = re.sub(r'\s*\(.*?\)', '', aula).strip()

    # Reemplazamos "Inf." por "Informática" solo si aparece al principio del nombre del aula, seguido de un espacio
    aula = re.sub(r'(?i)^Inf\.\s+', 'Informática ', aula)

    # Reemplazamos "Lab." por "Lab" solo si aparece al principio del nombre del aula, seguido de un espacio y un número de aula
    aula = re.sub(r'(?i)^Lab\.?\s+(?=\d{2}-[a-zA-Z]\d)', 'Lab ', aula)

    # Reemplazamos "Lab." por "Laboratorio" solo si aparece al principio del nombre del aula, seguido de un espacio y no va seguido de un número de aula
    aula = re.sub(r'(?i)^Lab\.?\s+(?!\d{2}-[a-zA-Z]\d)', 'Laboratorio ', aula)

    return aula.strip()
    
