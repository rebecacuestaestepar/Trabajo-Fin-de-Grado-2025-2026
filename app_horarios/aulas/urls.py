from django.urls import path
from .views import AulasDisponiblesAPIView, ListaAulasAPIView
from .views_ocupacion import OcupacionAulaEventosAPIView

urlpatterns = [
    path("disponibles1/", AulasDisponiblesAPIView.as_view(), name="aulas-disponibles"),
    path("aulas/ocupacion/eventos", OcupacionAulaEventosAPIView.as_view()),
    path("", ListaAulasAPIView.as_view(), name="lista-aulas"),
]