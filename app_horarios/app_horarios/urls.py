from django.urls import path
from .views import GradorPorCursoView, ListaHorariosView

urlpatterns = [
    path('', ListaHorariosView.as_view(), name='lista_horarios'),
    path('<str:id_curso>/grados/', GradorPorCursoView.as_view(), name='grados_por_curso'),
]