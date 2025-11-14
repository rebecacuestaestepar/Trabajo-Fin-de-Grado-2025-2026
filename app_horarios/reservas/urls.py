from django.urls import path
from .views import SolicitarReservaPuntualAPIView

urlpatterns = [
    path('reservas/puntuales/solicitar/', SolicitarReservaPuntualAPIView.as_view(),
         name='solicitar-reserva-puntual'),
]
