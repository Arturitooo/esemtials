from rest_framework.routers import DefaultRouter
from .views import TeammemberViewSet

router = DefaultRouter()
router.register("teammember", TeammemberViewSet, basename="teammember")

urlpatterns = router.urls
