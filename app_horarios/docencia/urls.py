from django.urls import path
from .views import CargarHorarioExcelView, ObtenerAsignaturasPorGradoCursoSemestreView, ObtenerAsignaturasPorGradoYSemestreView, ObtenerCursosGradoView, ObtenerCursosView, ObtenerGradosView, ObtenerGruposAsignaturaView, ObtenerSemestresPorGradoView, SemestresPorGradoView

urlpatterns = [
    path('cargar-horario/', CargarHorarioExcelView.as_view(), name='cargar_horario_excel'),
    path('cursos/', ObtenerCursosView.as_view(), name='obtener_cursos'),
    path('<str:id_grado>/semestres/', SemestresPorGradoView.as_view(), name='semestres_por_grado'),
    path('<str:id_grado>/asignaturas/semestre/<str:id_semestre>/', ObtenerAsignaturasPorGradoYSemestreView.as_view(), name='asignaturas_por_grado_semestre'),
    path('grados/', ObtenerGradosView.as_view(), name='obtener_grados'),
    path('grados/<str:id_grado>/cursos/', ObtenerCursosGradoView.as_view(), name='obtener_cursos_grado'),
    path('grados/<str:id_grado>/cursos/<str:curso_grado>/semestres/', ObtenerSemestresPorGradoView.as_view(), name='obtener_semestres_por_grado_curso'),
    path('grados/<str:id_grado>/cursos/<str:curso_grado>/semestres/<str:semestre>/asignaturas/', ObtenerAsignaturasPorGradoCursoSemestreView.as_view(), name='obtener_asignaturas_por_grado_curso_semestre'),
    path('grupos/<str:id_asignatura>/', ObtenerGruposAsignaturaView.as_view(), name='obtener_grupos_asignatura'),
]