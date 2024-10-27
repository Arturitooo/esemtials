from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import (
    TeammemberViewSet,
    TeammemberCommentViewSet,
    TeamMemberGitIntegrationDataCreateAPIView,
    TeamMemberGitIntegrationDataDetailAPIView,
    TeamMemberGitIntegrationDataListAPIView,
    TeamMemberGitIntegrationDataUpdateAPIView,
    TeamMemberGitIntegrationDataDeleteAPIView,
    TeammemberCodingStatsCreateAPIView,
    TeammemberCodingStatsListAPIView,
    TeammemberCodingStatsDetailAPIView,
    TeammemberCodingStatsUpdateAPIView,
    TeammemberCodingStatsDeleteAPIView,
)

router = DefaultRouter()
router.register("teammember", TeammemberViewSet, basename="teammember")
router.register(
    "teammember-comment", TeammemberCommentViewSet, basename="teammember-comment"
)

urlpatterns = [
    path(
        "teammember-gitintegration/create/",
        TeamMemberGitIntegrationDataCreateAPIView.as_view(),
        name="teammember-gitintegration-create",
    ),
    path(
        "teammember-gitintegration/<int:pk>/",
        TeamMemberGitIntegrationDataDetailAPIView.as_view(),
        name="teammember-gitintegration-detail",
    ),
    path(
        "teammember-gitintegration/list/",
        TeamMemberGitIntegrationDataListAPIView.as_view(),
        name="teammember-gitintegration-list",
    ),
    path(
        "teammember-gitintegration/<int:pk>/update/",
        TeamMemberGitIntegrationDataUpdateAPIView.as_view(),
        name="teammember-gitintegration-update",
    ),
    path(
        "teammember-gitintegration/<int:pk>/delete/",
        TeamMemberGitIntegrationDataDeleteAPIView.as_view(),
        name="teammember-gitintegration-delete",
    ),
    # TeammemberCodingStats URLs
    path(
        "teammember-coding-stats/create/",
        TeammemberCodingStatsCreateAPIView.as_view(),
        name="teammember-coding-stats-create",
    ),
    path(
        "teammember-coding-stats/",
        TeammemberCodingStatsListAPIView.as_view(),
        name="teammember-coding-stats-list",
    ),
    path(
        "teammember-coding-stats/<int:teammember_id>/",
        TeammemberCodingStatsDetailAPIView.as_view(),
        name="teammember-coding-stats-detail",
    ),
    path(
        "teammember-coding-stats/<int:pk>/update/",
        TeammemberCodingStatsUpdateAPIView.as_view(),
        name="teammember-coding-stats-update",
    ),
    path(
        "teammember-coding-stats/<int:pk>/delete/",
        TeammemberCodingStatsDeleteAPIView.as_view(),
        name="teammember-coding-stats-delete",
    ),
]

# Append router URLs (for the viewsets)
urlpatterns += router.urls
