from django.urls import path
from .views import (
    ProjectCreateAPIView,
    ProjectListAPIView,
    ProjectDetailAPIView,
    ProjectUpdateAPIView,
    ProjectDeleteAPIView,
    NoteCreateAPIView,
    NoteUpdateAPIView,
    NoteListAPIView,
    NoteDetailAPIView,
    NoteDeleteAPIView,
)


urlpatterns = [
    path("project/create/", ProjectCreateAPIView.as_view(), name="project-create"),
    path("project/list/", ProjectListAPIView.as_view(), name="project-list"),
    path("project/<int:pk>/", ProjectDetailAPIView.as_view(), name="project-detail"),
    path(
        "project/<int:pk>/update/",
        ProjectUpdateAPIView.as_view(),
        name="project-update",
    ),
    path(
        "project/<int:pk>/delete/",
        ProjectDeleteAPIView.as_view(),
        name="project-delete",
    ),
    path("note/create/", NoteCreateAPIView.as_view(), name="note-create"),
    path("note/<int:pk>/update/", NoteUpdateAPIView.as_view(), name="note-update"),
    path("note/list/", NoteListAPIView.as_view(), name="note-list"),
    path("note/<int:pk>/", NoteDetailAPIView.as_view(), name="note-detail"),
    path("note/<int:pk>/delete/", NoteDeleteAPIView.as_view(), name="note-delete"),
]
