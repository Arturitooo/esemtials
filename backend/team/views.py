import requests
from django.db import IntegrityError
from django.shortcuts import get_object_or_404
from .models import (
    Teammember,
    TeamMemberComment,
    TeamMemberGitIntegrationData,
    TeammemberCodingStats,
)
from .serializers import (
    TeammemberSerializer,
    TeamMemberCommentSerializer,
    TeamMemberGitIntegrationDataSerializer,
    TeammemberCodingStatsSerializer,
)
from rest_framework import viewsets, permissions, response, status
from rest_framework.exceptions import NotFound, ValidationError

from rest_framework.generics import (
    CreateAPIView,
    UpdateAPIView,
    ListAPIView,
    RetrieveAPIView,
    DestroyAPIView,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied


class TeammemberViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TeammemberSerializer

    def get_queryset(self):
        # Filter queryset to only include team members created by the authenticated user
        user = self.request.user
        return Teammember.objects.filter(created_by=user).order_by("tm_lname")

    def list(self, request, *args, **kwargs):
        # List all team members for the authenticated user
        queryset = self.get_queryset()
        serializer = self.serializer_class(queryset, many=True)
        return response.Response(serializer.data)

    def create(self, request, *args, **kwargs):
        # Create a new team member for the authenticated user
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(created_by=request.user)
        return response.Response(serializer.data, status=status.HTTP_201_CREATED)

    def retrieve(self, request, *args, **kwargs):
        # Retrieve a specific team member if the user is the creator
        instance = self.get_object()
        if instance.created_by != request.user:
            return response.Response(status=status.HTTP_403_FORBIDDEN)
        serializer = self.get_serializer(instance)
        return response.Response(serializer.data)

    def update(self, request, *args, **kwargs):
        # Update a specific team member if the user is the creator
        instance = self.get_object()
        if instance.created_by != request.user:
            return response.Response(status=status.HTTP_403_FORBIDDEN)
        serializer = self.get_serializer(
            instance, data=request.data, partial=kwargs.pop("partial", False)
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return response.Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        # Delete a specific team member if the user is the creator
        instance = self.get_object()
        if instance.created_by != request.user:
            return response.Response(status=status.HTTP_403_FORBIDDEN)
        self.perform_destroy(instance)
        return response.Response(status=status.HTTP_204_NO_CONTENT)


class TeammemberCommentViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TeamMemberCommentSerializer

    def get_queryset(self):
        # Filter queryset to only include comments created by the authenticated user
        user = self.request.user
        return TeamMemberComment.objects.filter(created_by=user).order_by("-id")

    def list(self, request, *args, **kwargs):
        # Get the 'id' parameter from the query parameters
        teammember_id = request.query_params.get("id")

        # Ensure the 'id' parameter is provided
        if teammember_id is None:
            return response.Response(
                {"detail": "Teammember id parameter is required."}, status=400
            )

        # Ensure the 'id' parameter is valid
        if not teammember_id.isdigit():
            return response.Response(
                {"detail": "Teammember id parameter must be an integer."}, status=400
            )

        # Filter the queryset based on the provided teammember id
        queryset = self.get_queryset().filter(teammember_id=teammember_id)

        # Check if any comments exist for the given teammember id
        if not queryset.exists():
            raise NotFound(detail="No comments found for the specified teammember id.")

        serializer = self.serializer_class(queryset, many=True)
        return response.Response(serializer.data)

    def create(self, request, *args, **kwargs):
        # Create a comments for the authenticated user
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(created_by=request.user)
        return response.Response(serializer.data, status=status.HTTP_201_CREATED)

    def retrieve(self, request, *args, **kwargs):
        # Retrieve a specific comment if the user is the creator
        instance = self.get_object()
        if instance.created_by != request.user:
            return response.Response(status=status.HTTP_403_FORBIDDEN)
        serializer = self.get_serializer(instance)
        return response.Response(serializer.data)

    def update(self, request, *args, **kwargs):
        # Update a specific comment if the user is the creator
        instance = self.get_object()
        if instance.created_by != request.user:
            return response.Response(status=status.HTTP_403_FORBIDDEN)
        serializer = self.get_serializer(
            instance, data=request.data, partial=kwargs.pop("partial", False)
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return response.Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        # Delete a specific comments if the user is the creator
        instance = self.get_object()
        if instance.created_by != request.user:
            return response.Response(status=status.HTTP_403_FORBIDDEN)
        self.perform_destroy(instance)
        return response.Response(status=status.HTTP_204_NO_CONTENT)


class TeamMemberGitIntegrationDataCreateAPIView(CreateAPIView):
    queryset = TeamMemberGitIntegrationData.objects.all()
    serializer_class = TeamMemberGitIntegrationDataSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        validated_data = serializer.validated_data
        # get related teammember instance
        teammember = get_object_or_404(Teammember, pk=validated_data["teammember"].pk)

        # perform testing API call and based on result change the Teammember
        integration_status = self.gitlab_verification_api_call(validated_data)
        if integration_status:
            teammember.teammember_hasGitIntegration = True
        else:
            teammember.teammember_hasGitIntegration = False

        teammember.save()

        try:
            serializer.save(created_by=self.request.user)
        except IntegrityError:
            raise ValidationError(
                "This team member already has Git data associated with them."
            )

    def gitlab_verification_api_call(self, data):
        # get needed data to the variables
        groupID = data.get("teammemberGitGroupID")
        userID = data.get("teammemberGitUserID")
        acccessToken = data.get("teammemberGitPersonalAccessToken")

        # provide api needed info
        url = f"https://gitlab.com/api/v4/groups/{groupID}/members"
        headers = {"PRIVATE-TOKEN": acccessToken, "Content-Type": "application/json"}

        # make API call
        try:
            response = requests.get(url, headers=headers)
            if response.status_code >= 200 and response.status_code < 300:
                members = response.json()
                member_ids = [member["id"] for member in members]
                return str(userID) in map(str, member_ids)
            else:
                return False
        except requests.exceptions.RequestException as e:
            # Handle any errors that occur during the request
            return {"success": False, "message": str(e)}


class TeamMemberGitIntegrationDataDetailAPIView(RetrieveAPIView):
    queryset = TeamMemberGitIntegrationData.objects.all()
    serializer_class = TeamMemberGitIntegrationDataSerializer
    permission_classes = [IsAuthenticated]


class TeamMemberGitIntegrationDataListAPIView(ListAPIView):
    serializer_class = TeamMemberGitIntegrationDataSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return TeamMemberGitIntegrationData.objects.filter(created_by=user).order_by(
            "-pk"
        )


class TeamMemberGitIntegrationDataUpdateAPIView(UpdateAPIView):
    queryset = TeamMemberGitIntegrationData.objects.all()
    serializer_class = TeamMemberGitIntegrationDataSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        instance = serializer.save()

        # Get the related Teammember instance
        teammember = get_object_or_404(Teammember, pk=instance.teammember.pk)

        # Perform GitLab verification and update team member integration status
        integration_status = self.gitlab_verification_api_call(
            serializer.validated_data
        )

        if integration_status:
            teammember.teammember_hasGitIntegration = True
        else:
            teammember.teammember_hasGitIntegration = False

        teammember.save()

    def gitlab_verification_api_call(self, data):
        groupID = data.get("teammemberGitGroupID")
        userID = data.get("teammemberGitUserID")
        accessToken = data.get("teammemberGitPersonalAccessToken")

        url = f"https://gitlab.com/api/v4/groups/{groupID}/members"
        headers = {"PRIVATE-TOKEN": accessToken, "Content-Type": "application/json"}

        try:
            response = requests.get(url, headers=headers)
            if response.status_code >= 200 and response.status_code < 300:
                members = response.json()
                member_ids = [member["id"] for member in members]
                return str(userID) in map(str, member_ids)
            else:
                return False
        except requests.exceptions.RequestException as error:
            # Handle any errors that occur during the request
            return error


class TeamMemberGitIntegrationDataDeleteAPIView(DestroyAPIView):
    queryset = TeamMemberGitIntegrationData.objects.all()
    serializer_class = TeamMemberGitIntegrationDataSerializer
    permission_classes = [IsAuthenticated]


class TeammemberCodingStatsListAPIView(ListAPIView):
    queryset = TeammemberCodingStats.objects.all()
    serializer_class = TeammemberCodingStatsSerializer


class TeammemberCodingStatsDetailAPIView(RetrieveAPIView):
    queryset = TeammemberCodingStats.objects.all()
    serializer_class = TeammemberCodingStatsSerializer


class TeammemberCodingStatsCreateAPIView(CreateAPIView):
    queryset = TeammemberCodingStats.objects.all()
    serializer_class = TeammemberCodingStatsSerializer


class TeammemberCodingStatsUpdateAPIView(UpdateAPIView):
    queryset = TeammemberCodingStats.objects.all()
    serializer_class = TeammemberCodingStatsSerializer


class TeammemberCodingStatsDeleteAPIView(DestroyAPIView):
    queryset = TeammemberCodingStats.objects.all()
    serializer_class = TeammemberCodingStatsSerializer
