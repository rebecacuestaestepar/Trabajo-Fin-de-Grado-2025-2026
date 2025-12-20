from django.urls import path
from .views import FormularioCalendarioAPIView

urlpatterns = [
    path('calendario/cargar/formulario/', FormularioCalendarioAPIView.as_view()),
         #name='solicitar-reserva-puntual'),
]