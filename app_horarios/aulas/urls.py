from django.urls import include, path
from .views import AulaViewSet, AulasDisponiblesAPIView, ListaAulasAPIView, ListaMiniAulasAPIView
from .views_ocupacion import OcupacionAulaEventosAPIView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'', AulaViewSet, basename='aula')

urlpatterns = [
    path("disponibles1/", AulasDisponiblesAPIView.as_view(), name="aulas-disponibles"),
    path("ocupacion", OcupacionAulaEventosAPIView.as_view()),
    path("lista/", ListaAulasAPIView.as_view(), name="lista-aulas"),
    path("lista-mini/", ListaMiniAulasAPIView.as_view(), name="lista-mini-aulas"),
    path("", include(router.urls)),
    
]