"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework.schemas import get_schema_view
from django.views.generic import TemplateView
from knox import views as knox_views

urlpatterns = [
    path("admin/", admin.site.urls),
    path(
        "api_schema/",
        get_schema_view(title="API Schema", description="Guide for the REST API"),
        name="api_schema",
    ),
    path(
        "api-swagger/",
        TemplateView.as_view(
            template_name="api_swagger.html", extra_context={"schema_url": "api_schema"}
        ),
        name="api-swagger",
    ),
    path("", include("users.urls")),
    # path("api/auth/", include("knox.urls")),
    path("logout/", knox_views.LogoutView.as_view(), name="knox_logout"),
    path("logout/", knox_views.LogoutAllView.as_view(), name="knox_logoutall"),
    path(
        "api/password_reset/",
        include("django_rest_passwordreset.urls", namespace="password_reset"),
    ),
    path("team/", include("team.urls")),
]
