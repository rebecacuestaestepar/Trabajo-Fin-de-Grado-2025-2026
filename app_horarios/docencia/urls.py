from django.urls import include, path
from .views_horario import CargarHorarioExcelView, MoverSerieReservasView, ObtenerAsignaturasPorGradoYSemestreView, ObtenerCursosView, ValidarRestriccionesView, SemestresPorGradoView, GradosPorCursoView, ListaHorariosView
from .views import GradoViewSet, AsignaturaViewSet, GrupoViewSet, DocenteViewSet, ImparteViewSet, ListaMiniDocentesView, ListaMiniGruposView, ListaMiniGradosView, ListaMiniAsignaturasView
from .views_periodicas import EliminarReservaPeriodicaView, ObtenerGradosView, ObtenerCursosGradoView, ObtenerSemestresPorGradoView, ObtenerAsignaturasPorGradoCursoSemestreView, ObtenerGruposAsignaturaView, ObtenerAulasLibresView, CrearReservaPeriodicaView, ObtenerDatosReservaPeriodicaView, ReservaDesdeHorarioAsignaturasView
from rest_framework.routers import DefaultRouter

routerGrado = DefaultRouter()
routerGrado.register(r'grados', GradoViewSet, basename='grado')

routerAsignatura = DefaultRouter()
routerAsignatura.register(r'asignaturas', AsignaturaViewSet, basename='asignatura')
routerGrupo = DefaultRouter()
routerGrupo.register(r'grupos', GrupoViewSet, basename='grupo')
routerDocente = DefaultRouter()
routerDocente.register(r'docentes', DocenteViewSet, basename='docente')
routerImparte = DefaultRouter()
routerImparte.register(r'imparte', ImparteViewSet, basename='imparte')

urlpatterns = [
    path('', ListaHorariosView.as_view(), name='lista_horarios'),
    path('<str:id_curso>/grados/', GradosPorCursoView.as_view(), name='grados_por_curso'),
    path('cargar-horario/', CargarHorarioExcelView.as_view(), name='cargar_horario_excel'),
    path('cursos/', ObtenerCursosView.as_view(), name='obtener_cursos'),
    path('<str:id_grado>/semestres/', SemestresPorGradoView.as_view(), name='semestres_por_grado'),
    path('<str:id_grado>/asignaturas/semestre/<str:id_semestre>/', ObtenerAsignaturasPorGradoYSemestreView.as_view(), name='asignaturas_por_grado_semestre'),
    path('grados/lista/', ObtenerGradosView.as_view(), name='obtener_grados'),
    path('grados/<str:id_grado>/cursos/', ObtenerCursosGradoView.as_view(), name='obtener_cursos_grado'),
    path('grados/<str:id_grado>/cursos/<str:curso_grado>/semestres/', ObtenerSemestresPorGradoView.as_view(), name='obtener_semestres_por_grado_curso'),
    path('grados/<str:id_grado>/cursos/<str:curso_grado>/semestres/<str:semestre>/asignaturas/', ObtenerAsignaturasPorGradoCursoSemestreView.as_view(), name='obtener_asignaturas_por_grado_curso_semestre'),
    path('grupos/<str:id_asignatura>/', ObtenerGruposAsignaturaView.as_view(), name='obtener_grupos_asignatura'),
    path('aulas-libres/', ObtenerAulasLibresView.as_view(), name='obtener_aulas_libres'),
    path('crear-reserva-periodica/', CrearReservaPeriodicaView.as_view(), name='crear_reserva_periodica'),
    path('datos-reserva-periodica/<int:id_reserva>/', ObtenerDatosReservaPeriodicaView.as_view(), name='obtener_datos_reserva_periodica'),
    path('cargar-asignaturas/grado/<int:id_grado>/semestre/<int:semestre>/', ReservaDesdeHorarioAsignaturasView.as_view(), name='reserva_desde_horario_grado'),
    path('validar-restricciones/', ValidarRestriccionesView.as_view(), name='validar_restricciones'),
    path('mover-reserva-periodica/', MoverSerieReservasView.as_view(), name='validar_movimiento_reserva_periodica'),
    path('eliminar-reserva-periodica/', EliminarReservaPeriodicaView.as_view(), name='eliminar_reserva_periodica'),

    path('', include(routerGrado.urls)),
    path('', include(routerAsignatura.urls)),
    path('', include(routerGrupo.urls)),
    path('', include(routerDocente.urls)),
    path('', include(routerImparte.urls)),
    path('mini-grados/', ListaMiniGradosView.as_view(), name='lista_mini_grados'),
    path('mini-asignaturas/', ListaMiniAsignaturasView.as_view(), name='lista_mini_asignaturas'),
    path('mini-docentes/', ListaMiniDocentesView.as_view(), name='lista_mini_docentes'),
    path('mini-grupos/', ListaMiniGruposView.as_view(), name='lista_mini_grupos'),
    
]