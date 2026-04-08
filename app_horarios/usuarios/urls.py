from django.urls import path
from .views import LoginUniversidadAPIView

urlpatterns = [
    path('login/', LoginUniversidadAPIView.as_view(), name='api_login'),
]