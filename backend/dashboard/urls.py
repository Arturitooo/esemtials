from django.urls import path
from .views import (
    NoteCreateAPIView,
    NoteUpdateAPIView,
    NoteListAPIView,
    NoteDetailAPIView,
    NoteDeleteAPIView,
)


urlpatterns = [
    path("note/create/", NoteCreateAPIView.as_view(), name="note-create"),
    path("note/<int:pk>/update/", NoteUpdateAPIView.as_view(), name="note-update"),
    path("note/list/", NoteListAPIView.as_view(), name="note-list"),
    path("note/<int:pk>/", NoteDetailAPIView.as_view(), name="note-detail"),
    path("note/<int:pk>/delete/", NoteDeleteAPIView.as_view(), name="note-delete"),
]
