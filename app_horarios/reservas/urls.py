from django.urls import path
from .views import (
    SolicitarReservaPuntualAPIView,
    AulasDisponiblesAPIView,
    ReservasPendientesListAPIView,
    ReservaPendienteDetailAPIView,
    ReservaAulasCandidatasAPIView,
    ReservaAprobarAPIView,
    ReservaRechazarAPIView,
)

urlpatterns = [
    path('reservas/puntuales/solicitar/', SolicitarReservaPuntualAPIView.as_view()),
         #name='solicitar-reserva-puntual'),
    path("aulas/disponibles/", AulasDisponiblesAPIView.as_view()),
    path("reservas/solicitar/", SolicitarReservaPuntualAPIView.as_view()),

    path("reservas/pendientes/", ReservasPendientesListAPIView.as_view()),
    path("reservas/<str:id>/", ReservaPendienteDetailAPIView.as_view()),
    path("reservas/<str:id>/aulas-candidatas/", ReservaAulasCandidatasAPIView.as_view()),
    path("reservas/<str:id>/aprobar/", ReservaAprobarAPIView.as_view()),
    path("reservas/<str:id>/rechazar/", ReservaRechazarAPIView.as_view()),
]
