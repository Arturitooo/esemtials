from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TeammemberViewSet

router = DefaultRouter()
router.register(r"teammembers", TeammemberViewSet, basename="teammembers")

urlpatterns = [
    path("", include(router.urls)),
]
