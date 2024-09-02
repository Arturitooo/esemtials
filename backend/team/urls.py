from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import (
    TeammemberViewSet,
    TeammemberCommentViewSet,
    TeammemberGitDataCreateAPIView,
    TeammemberGitDataDetailAPIView,
    TeammemberGitDataListAPIView,
    TeammemberGitDataUpdateAPIView,
    TeammemberGitDataDeleteAPIView,
)

router = DefaultRouter()
router.register("teammember", TeammemberViewSet, basename="teammember")
router.register(
    "teammember-comment", TeammemberCommentViewSet, basename="teammember-comment"
)

urlpatterns = [
    path(
        "teammember-gitdata/create/",
        TeammemberGitDataCreateAPIView.as_view(),
        name="teammember-gitdata-create",
    ),
    path(
        "teammember-gitdata/<int:pk>/",
        TeammemberGitDataDetailAPIView.as_view(),
        name="teammember-gitdata-detail",
    ),
    path(
        "teammember-gitdata/list/",
        TeammemberGitDataListAPIView.as_view(),
        name="teammember-gitdata-list",
    ),
    path(
        "teammember-gitdata/<int:pk>/update/",
        TeammemberGitDataUpdateAPIView.as_view(),
        name="teammember-gitdata-update",
    ),
    path(
        "teammember-gitdata/<int:pk>/delete/",
        TeammemberGitDataDeleteAPIView.as_view(),
        name="teammember-gitdata-delete",
    ),
]

# Append router URLs (for the viewsets)
urlpatterns += router.urls
