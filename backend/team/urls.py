from rest_framework.routers import DefaultRouter
from .views import TeammemberViewSet, TeammemberCommentViewSet

router = DefaultRouter()
router.register("teammember", TeammemberViewSet, basename="teammember")
router.register(
    "teammember-comment", TeammemberCommentViewSet, basename="teammember-comment"
)


urlpatterns = router.urls
