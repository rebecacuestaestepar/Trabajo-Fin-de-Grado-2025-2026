from django.urls import path
from .views import CargarHorarioExcelView, ObtenerCursosView, SemestresPorGradoView

urlpatterns = [
    path('cargar-horario/', CargarHorarioExcelView.as_view(), name='cargar_horario_excel'),
    path('cursos/', ObtenerCursosView.as_view(), name='obtener_cursos'),
    path('semestres-grado/', SemestresPorGradoView.as_view(), name='semestres_por_grado'),
]