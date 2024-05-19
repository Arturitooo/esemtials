from rest_framework import serializers
from .models import Teammember, TeamMemberComment


class TeammemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teammember
        fields = "__all__"


class TeamMemberCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMemberComment
        fields = "__all__"
