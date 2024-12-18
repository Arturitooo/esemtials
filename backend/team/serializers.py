from rest_framework import serializers
from time import timezone
from .models import (
    Teammember,
    TeamMemberComment,
    TeamMemberGitIntegrationData,
    TeammemberCodingStats,
)


class TeammemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teammember
        fields = "__all__"

    def to_internal_value(self, data):
        if "teammember_hasGitIntegration" not in data:
            data["teammember_hasGitIntegration"] = None
        return super().to_internal_value(data)


class TeamMemberCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMemberComment
        fields = "__all__"


class TeamMemberGitIntegrationDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMemberGitIntegrationData
        fields = [
            "id",
            "created_by",
            "teammember",
            "teammemberGitHosting",
            "teammemberGitGroupID",
            "teammemberGitUserID",
            "teammemberGitPersonalAccessToken",
        ]
        read_only_fields = ["created_by"]

    def create(self, validated_data):
        # Automatically set project_owner to current user
        validated_data["created_by"] = self.context["request"].user
        return TeamMemberGitIntegrationData.objects.create(**validated_data)


class TeammemberCodingStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeammemberCodingStats
        fields = "__all__"
