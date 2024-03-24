from rest_framework import serializers
from .models import Teammember


class TeammemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teammember
        fields = "__all__"
