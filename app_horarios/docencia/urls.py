from django.urls import path
from .views import CargarHorarioExcelView

urlpatterns = [
    path('cargar-horario/', CargarHorarioExcelView.as_view(), name='cargar_horario_excel'),
]