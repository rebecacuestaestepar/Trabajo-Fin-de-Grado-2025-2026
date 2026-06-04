from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from rest_framework import status

from .serializers import EntityQuerySerializer, ImportDatabaseSerializer
from .services import servicio_exportar_base_datos, servicio_plantilla_base_datos, servicio_importar_base_datos

import traceback

class ExportarBaseDatosView(APIView):
    """
    GET /api/db/export/?entity=usuarios,docentes
    Genera un Excel con los datos de las tablas solicitadas.
     - 'entidad' puede ser 'all', una entidad específica ('aulas') o una combinación ('aulas,docentes'). Se resolverán las dependencias entre tablas automáticamente para incluir las necesarias.
     - El Excel se descarga directamente como un archivo adjunto.
    """
    
    def get(self, request):
        serializer = EntityQuerySerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        entidad = serializer.validated_data["entidad"]

        try:
            buffer_excel = servicio_exportar_base_datos(entidad)
            
            respuesta = HttpResponse(
                buffer_excel.getvalue(),
                content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )
            nombre_archivo = f"export_{entidad.replace(',', '_')}.xlsx"
            respuesta["Content-Disposition"] = f'attachment; filename="{nombre_archivo}"'
            return respuesta
            
        except Exception as e:
            traceback.print_exc()
            return Response({"error": f"Error al exportar: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PlantillaBaseDatosView(APIView):
    """
    GET /api/db/plantilla/?entidad=aulas
    Genera un Excel vacío solo con las cabeceras de las tablas. Útil para saber qué formato debe tener el Excel de importación.
     - 'entidad' puede ser 'all', una entidad específica ('aulas') o una combinación ('aulas,docentes'). Se resolverán las dependencias entre tablas automáticamente para incluir las necesarias.
    """
    
    def get(self, request):
        serializer = EntityQuerySerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        entidad = serializer.validated_data["entidad"]

        try:
            buffer_excel = servicio_plantilla_base_datos(entidad)
            
            respuesta = HttpResponse(
                buffer_excel.getvalue(),
                content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )
            nombre_archivo = f"plantilla_{entidad.replace(',', '_')}.xlsx"
            respuesta["Content-Disposition"] = f'attachment; filename="{nombre_archivo}"'
            return respuesta
            
        except Exception as e:
            traceback.print_exc()
            return Response({"error": f"Error al generar plantilla: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ImportarBaseDatosView(APIView):
    """ 
    POST /api/db/importar/ (Envía 'file' y 'entidad' en el FormData)
    Importa los datos de un Excel, vaciando las tablas correspondientes e insertando la nueva data.
     - 'entidad' puede ser 'all', una entidad específica ('aulas') o una combinación ('aulas,docentes').
     - El Excel debe tener las hojas/tablas correctas con las columnas adecuadas según la plantilla. Se resolverán las dependencias entre tablas automáticamente.
     - Advertencia: Esta operación sobrescribirá los datos existentes en las tablas afectadas.
    """
    parser_classes = [MultiPartParser]

    def post(self, request):
        serializer = ImportDatabaseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        archivo_obj = serializer.validated_data["archivo"]
        entidad = serializer.validated_data["entidad"]

        try:
            servicio_importar_base_datos(archivo_obj, entidad)
            return Response(
                {"message": f"Entidad(es) [{entidad}] importada(s) con éxito resolviendo dependencias."},
                status=status.HTTP_200_OK
            )
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            traceback.print_exc()  # Imprime el error completo en la consola para depuración
            return Response({"error": f"Fallo crítico en el servidor: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)