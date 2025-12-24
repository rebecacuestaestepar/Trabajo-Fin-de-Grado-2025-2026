from django.urls import path
from .views import AulasDisponiblesAPIView

urlpatterns = [
    path("disponibles/", AulasDisponiblesAPIView.as_view(), name="aulas-disponibles"),
]