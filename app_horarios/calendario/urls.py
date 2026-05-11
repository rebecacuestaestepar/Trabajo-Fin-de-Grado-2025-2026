from django.urls import path
from .views import CargarCalendarioAPIView

urlpatterns = [
    path('calendario/cargar/formulario/', CargarCalendarioAPIView.as_view()),
         #name='solicitar-reserva-puntual'),
]