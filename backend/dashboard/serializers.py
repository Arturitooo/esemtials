from django.utils import timezone
from rest_framework import serializers
from .models import Note


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = "__all__"

    def create(self, validated_data):
        # Automatically set note_owner to current user
        validated_data["note_owner"] = self.context["request"].user

        # Automatically set note_name if not provided
        validated_data["note_name"] = f"Note #{Note.objects.count() + 1}"

        # Automatically set note_content to an empty JSON object
        validated_data["note_content"] = {
            "blocks": [
                {
                    "key": "5q4ju",
                    "text": "",
                    "type": "unstyled",
                    "depth": 0,
                    "inlineStyleRanges": [],
                    "entityRanges": [],
                    "data": {},
                }
            ],
            "entityMap": {},
        }

        # Update note_updated date
        validated_data["note_updated"] = timezone.now()

        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Update note_updated date
        validated_data["note_updated"] = timezone.now()
        if "note_name" not in validated_data or not validated_data["note_name"]:
            validated_data["note_name"] = f"Note #{Note.objects.count() + 1}"

        return super().update(instance, validated_data)
