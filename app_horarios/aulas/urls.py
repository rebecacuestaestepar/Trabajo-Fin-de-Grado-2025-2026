from django.urls import path
from .views import ActualizarAulaAPIView, AulasDisponiblesAPIView, CrearAulaAPIView, DetalleAulaAPIView, EliminarAulaAPIView, ListaAulasAPIView, ListaAulasMiniAPIView
from .views_ocupacion import OcupacionAulaEventosAPIView

urlpatterns = [
    path("disponibles1/", AulasDisponiblesAPIView.as_view(), name="aulas-disponibles"),
    path("ocupacion", OcupacionAulaEventosAPIView.as_view()),
    path("", ListaAulasAPIView.as_view(), name="lista-aulas"),
    path("crear/", CrearAulaAPIView.as_view(), name="crear-aula"),
    path("actualizar/<int:aula_id>/", ActualizarAulaAPIView.as_view(), name="actualizar-aula"),
    path("eliminar/<int:aula_id>/", EliminarAulaAPIView.as_view(), name="eliminar-aula"),
    path("<int:aula_id>/", DetalleAulaAPIView.as_view(), name="detalle-aula"),
    path("lista/", ListaAulasMiniAPIView.as_view(), name="lista-aulas-mini"),
]