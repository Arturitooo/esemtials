from rest_framework import viewsets, permissions, response, status
from rest_framework.exceptions import NotFound
from .models import Teammember, TeamMemberComment
from .serializers import TeammemberSerializer, TeamMemberCommentSerializer


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
