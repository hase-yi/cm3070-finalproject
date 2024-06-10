from django.urls import path

from core.views import CookieTokenObtainPairView, CookieTokenRefreshView, secured


urlpatterns = [
    path("secured/", secured, name="requires_jwt"),
    path("token/", CookieTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", CookieTokenRefreshView.as_view(), name="token_refresh"),
]
