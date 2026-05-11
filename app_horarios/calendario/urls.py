from django.urls import path
from .views import CargarCalendarioAPIView, ObtenerCalendarioCursoAPIView, ModificarDiaCalendarioAPIView

urlpatterns = [
    path('calendario/cargar/formulario/', CargarCalendarioAPIView.as_view()),
    path('calendario/curso/<str:id_curso>/', ObtenerCalendarioCursoAPIView.as_view()),
    path('calendario/dia/modificar/', ModificarDiaCalendarioAPIView.as_view()),
]
