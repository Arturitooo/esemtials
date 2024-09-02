from rest_framework import serializers
from .models import Teammember, TeamMemberComment, TeamMemberGitData


class TeammemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teammember
        fields = "__all__"


class TeamMemberCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMemberComment
        fields = "__all__"


class TeamMemberGitDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMemberGitData
        fields = [
            "created_by",
            "teammember",
            "teammemberGitHosting",
            "teammemberGitProjectID",
            "teammemberGitUserID",
            "teammemberGitPersonalAccessToken",
        ]
        read_only_fields = ["created_by"]

    def create(self, validated_data):
        # Automatically set project_owner to current user
        validated_data["created_by"] = self.context["request"].user
        return TeamMemberGitData.objects.create(**validated_data)
