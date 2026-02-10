from django.urls import path
from .views import AulasDisponiblesAPIView, ListaAulasAPIView

urlpatterns = [
    path("disponibles1/", AulasDisponiblesAPIView.as_view(), name="aulas-disponibles"),
    path("", ListaAulasAPIView.as_view(), name="lista-aulas"),
]