from django.urls import path
from .views import CargarHorarioExcelView, ObtenerAsignaturasPorGradoYSemestreView, ObtenerCursosView, SemestresPorGradoView

urlpatterns = [
    path('cargar-horario/', CargarHorarioExcelView.as_view(), name='cargar_horario_excel'),
    path('cursos/', ObtenerCursosView.as_view(), name='obtener_cursos'),
    path('<str:id_grado>/semestres/', SemestresPorGradoView.as_view(), name='semestres_por_grado'),
    path('<str:id_grado>/asignaturas/semestre/<str:id_semestre>/', ObtenerAsignaturasPorGradoYSemestreView.as_view(), name='asignaturas_por_grado_semestre'),
]