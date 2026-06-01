from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ListaMiniPermisosAPIView, ListaMiniRolesAPIView, LoginUniversidadAPIView, RolViewSet, UsuarioViewSet

routerUsuario = DefaultRouter()
routerUsuario.register(r'usuarios', UsuarioViewSet, basename='usuario')
routerRol = DefaultRouter()
routerRol.register(r'roles', RolViewSet, basename='rol')

urlpatterns = [
    path('login/', LoginUniversidadAPIView.as_view(), name='api_login'),

    path('', include(routerUsuario.urls)),
    path('', include(routerRol.urls)),
    path('mini-roles/', ListaMiniRolesAPIView.as_view(), name='lista_mini_roles'),
    path('mini-permisos/', ListaMiniPermisosAPIView.as_view(), name='lista_mini_permisos'),
]