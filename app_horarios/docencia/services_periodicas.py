from .models import Grado

def obtener_grados():
    grados = Grado.objects.all().values('idgrado', 'nombre').order_by('nombre')
    return list(grados)