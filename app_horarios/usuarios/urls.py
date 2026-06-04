from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ListaMiniPermisosAPIView, ListaMiniRolesAPIView, LoginUniversidadAPIView, RolViewSet, UsuarioViewSet

from rest_framework_simplejwt.views import TokenRefreshView

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
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]