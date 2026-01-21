from django.urls import path
from .views import AulasDisponiblesAPIView

urlpatterns = [
    path("disponibles1/", AulasDisponiblesAPIView.as_view(), name="aulas-disponibles"),
]