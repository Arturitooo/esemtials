from rest_framework.generics import (
    CreateAPIView,
    UpdateAPIView,
    ListAPIView,
    RetrieveAPIView,
    DestroyAPIView,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework import permissions

from .models import Note
from .serializers import NoteSerializer

# Create your views here.


class IsNoteOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Check if the requesting user is the note owner
        return obj.note_owner == request.user


class NoteCreateAPIView(CreateAPIView):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save()  # Automatically sets note_owner, note_name, and note_updated


class NoteUpdateAPIView(UpdateAPIView):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated, IsNoteOwner]

    def perform_update(self, serializer):
        if not self.request.user.is_staff:  # Allow staff members to update any note
            note = self.get_object()
            if note.note_owner != self.request.user:
                raise PermissionDenied("You don't have permission to update this note.")
        serializer.save()  # Automatically updates note_updated


class NoteListAPIView(ListAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(note_owner=user).order_by("-note_updated")


class NoteDetailAPIView(RetrieveAPIView):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated, IsNoteOwner]


class NoteDeleteAPIView(DestroyAPIView):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]
