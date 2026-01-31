from django.urls import path
from .views import (
    SolicitarReservaPuntualAPIView,
    AulasDisponiblesAPIView,
    ReservasPendientesListAPIView,
    ReservaPendienteDetailAPIView,
    ReservaAulasCandidatasAPIView,
    ReservaAprobarAPIView,
    ReservaRechazarAPIView,
    ReservaAprobarMasivoAPIView,
    ReservaRechazarMasivoAPIView,
    ReservasTodasAPIView,
    ReservasEliminarMasivoAPIView,

)

urlpatterns = [
    #path('reservas/puntuales/solicitar/', SolicitarReservaPuntualAPIView.as_view()),
         #name='solicitar-reserva-puntual'),
    path("aulas/disponibles/", AulasDisponiblesAPIView.as_view()),
    path("reservas/solicitar/", SolicitarReservaPuntualAPIView.as_view()),

    path("reservas/pendientes/", ReservasPendientesListAPIView.as_view()),
    path("reservas/aprobar-masivo/", ReservaAprobarMasivoAPIView.as_view()),
    path("reservas/rechazar-masivo/", ReservaRechazarMasivoAPIView.as_view()),
    path("reservas/todas/", ReservasTodasAPIView.as_view()),
    path("reservas/eliminar-masivo/", ReservasEliminarMasivoAPIView.as_view()),
    path("reservas/<str:id>/", ReservaPendienteDetailAPIView.as_view()),
    path("reservas/<str:id>/aulas-candidatas/", ReservaAulasCandidatasAPIView.as_view()),
    path("reservas/<str:id>/aprobar/", ReservaAprobarAPIView.as_view()),
    path("reservas/<str:id>/rechazar/", ReservaRechazarAPIView.as_view()),
    
    
]
