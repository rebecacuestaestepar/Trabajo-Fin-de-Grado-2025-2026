from django.urls import path
from .views import ExportarBaseDatosView, ImportarBaseDatosView, PlantillaBaseDatosView
urlpatterns = [
    path('db/exportar/', ExportarBaseDatosView.as_view(), name='db-export'),
    path('db/plantilla/', PlantillaBaseDatosView.as_view(), name='db-template'),
    path('db/importar/', ImportarBaseDatosView.as_view(), name='db-import'),
]