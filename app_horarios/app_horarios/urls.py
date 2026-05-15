from django.urls import path
from .views import ListaHorariosView

urlpatterns = [
    path('', ListaHorariosView.as_view(), name='lista_horarios'),
]