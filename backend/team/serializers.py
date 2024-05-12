from rest_framework import serializers
from .models import Teammember


class TeammemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teammember
        fields = "__all__"

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Prepend server address to tm_photo field if it exists
        if "tm_photo" in data and data["tm_photo"]:
            data["tm_photo"] = "http://127.0.0.1:8000" + data["tm_photo"]
        return data
