import requests
from datetime import datetime, timedelta
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
        accessToken = data.get("teammemberGitPersonalAccessToken")

        # provide api needed info
        url = f"https://gitlab.com/api/v4/groups/{groupID}/members"
        headers = {"PRIVATE-TOKEN": accessToken, "Content-Type": "application/json"}

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

    def perform_create(self, serializer):
        validated_data = serializer.validated_data
        # get related teammember integration data and define what
        teammember = get_object_or_404(Teammember, pk=validated_data["teammember"].pk)
        gitIntegrationData = TeamMemberGitIntegrationData.objects.filter(
            teammember=teammember
        )

        # set date limes to 30 days ago and convert to needed format
        data_limitation = str(datetime.today() - timedelta(days=30))
        dt_object = datetime.strptime(data_limitation, "%Y-%m-%d %H:%M:%S.%f")
        data_limitation_iso_format = dt_object.strftime("%Y-%m-%dT%H:%M:%SZ")

        # Add the 'data_limitation_iso_format' to the dictionary to use in api calls
        apiCallsInput = {
            "teammemberGitUserID": gitIntegrationData.git_user_id,
            "teammemberGitPersonalAccessToken": gitIntegrationData.git_personal_access_token,
            "data_limitation": data_limitation_iso_format,
        }

        # Make created mrs api call with gitlab_merge_requests_api_call
        apiCallsInput["requestType"] = "author_id"
        created_mrs_data = self.gitlab_merge_requests_api_call(apiCallsInput)
        print(created_mrs_data)

        # Make reviewed mrs api call with gitlab_merge_requests_api_call
        apiCallsInput["requestType"] = "reviewer_id"
        reviewed_mrs_data = self.gitlab_merge_requests_api_call(apiCallsInput)
        print(reviewed_mrs_data)
        del apiCallsInput["requestType"]

        # Make projects api call with gitlab_project_api_call
        merged_project_ids = set()
        for mr_id, mr_info in created_mrs_data.items():
            project_id = mr_info.get("project_id")
            if project_id:
                merged_project_ids.add(project_id)  # Add to the set to avoid duplicates
        for mr_id, mr_info in reviewed_mrs_data.items():
            project_id = mr_info.get("project_id")
            if project_id:
                merged_project_ids.add(project_id)  # Add to the set to avoid duplicates

        # Convert the set to a list
        merged_project_ids_list = list(merged_project_ids)
        apiCallsInput["projects_list"] = merged_project_ids_list
        mrs_projects_data = self.gitlab_project_api_call(apiCallsInput)
        print(mrs_projects_data)

        # Make commits created api call with gitlab_commits_created_api_call
        # apiCallsInput["projects_list"] = [...]
        commits_created_data = self.gitlab_commits_created_api_call(apiCallsInput)
        print(commits_created_data)
        del apiCallsInput["projects_list"]

        # Make commits difference api call with gitlab_commits_diff_api_call
        # apiCallsInput["commits_list"] = created_commits_data_dict
        apiCallsInput["commits_list"] = commits_created_data
        commits_diffs_data = self.gitlab_commits_diff_api_call(apiCallsInput)
        print(commits_diffs_data)

        # TODO make MRs comments api call with gitlab_commits_diff_api_call
        # apiCallsInput["mrs_list"] = mr_data_dict

    def gitlab_merge_requests_api_call(self, data):
        # To make the api call you need to provide if check author_id or reviewer_id
        # get needed data to the variables
        requestType = data.get("requestType")
        userID = data.get("teammemberGitUserID")
        accessToken = data.get("teammemberGitPersonalAccessToken")
        data_limitation = data.get("data_limitation")

        # provide api needed info
        url = f"https://gitlab.com/api/v4/merge_requests?{requestType}={userID}&created_after={data_limitation}"
        headers = {"PRIVATE-TOKEN": accessToken, "Content-Type": "application/json"}

        # make API call with basic error handling
        try:
            response = requests.get(url, headers=headers)
            if response.status_code >= 200 and response.status_code < 300:
                data = response.json()
                # Create a dictionary to store the MR data with MR ID as the key
                mr_data_dict = {
                    record["id"]: {
                        "project_id": record["project_id"],
                        "iid": record["iid"],
                        "created_at": record["created_at"],
                        "merged_at": record.get("merged_at"),
                    }
                    for record in data
                }
                return mr_data_dict
            else:
                return False
        except requests.exceptions.RequestException as e:
            # Handle any errors that occur during the request
            return {"success": False, "message": str(e)}

    def gitlab_project_api_call(self, data):
        # To make the api call you need to provide projects_list
        # get needed data to the variables
        projects_list = data.get("projects_list")
        accessToken = data.get("teammemberGitPersonalAccessToken")
        data_limitation = data.get("data_limitation")

        project_data_dict = {}

        for project in projects_list:
            # provide api needed info
            url = f"https://gitlab.com/api/v4/projects/{project}&created_after={data_limitation}"
            headers = {
                "PRIVATE-TOKEN": accessToken,
                "Content-Type": "application/json",
            }

            # make API call with basic error handling
            try:
                response = requests.get(url, headers=headers)
                if response.status_code >= 200 and response.status_code < 300:
                    data = response.json()
                    # Get the needed data
                    for record in data:
                        project_id = project
                        project_data_dict[project_id] = {
                            "project_name": record["name"],
                            "project_url": record["web_url"],
                        }
                else:
                    return False
            except requests.exceptions.RequestException as e:
                # Handle any errors that occur during the request
                return {"success": False, "message": str(e)}
        return project_data_dict

    def gitlab_commits_created_api_call(self, data):
        # To make the api call you need to provide projects_list
        # get needed data to the variables
        projects_list = data.get("projects_list")
        userID = data.get("teammemberGitUserID")
        accessToken = data.get("teammemberGitPersonalAccessToken")
        data_limitation = data.get("data_limitation")

        created_commits_data_dict = {}

        for project in projects_list:
            # provide api needed info
            url = f"https://gitlab.com/api/v4/projects/{project}/repository/commits?author_id={userID}&created_after={data_limitation}"
            headers = {
                "PRIVATE-TOKEN": accessToken,
                "Content-Type": "application/json",
            }

            # make API call with basic error handling
            try:
                response = requests.get(url, headers=headers)
                if response.status_code >= 200 and response.status_code < 300:
                    data = response.json()
                    # Initialize the list of commits for the project if not already present
                    if project not in created_commits_data_dict:
                        created_commits_data_dict[project] = []
                    # Get the needed data for each commit
                    for record in data:
                        commit_info = {
                            "commit_short_id": record["short_id"],
                            "created_at": record["created_at"],
                            "commit_web_url": record["web_url"],
                        }
                        # Append the commit data to the project's list of commits
                        created_commits_data_dict[project].append(commit_info)
                else:
                    return False
            except requests.exceptions.RequestException as e:
                # Handle any errors that occur during the request
                return {"success": False, "message": str(e)}
        return created_commits_data_dict

    def gitlab_commits_diff_api_call(self, data):
        # To make the api call you need to provide projects_list
        # get needed data to the variables
        created_commits_data_dict = data
        accessToken = data.get("teammemberGitPersonalAccessToken")
        data_limitation = data.get("data_limitation")

        commits_diff_data_dict = {}

        for project_id, commits_list in created_commits_data_dict.items():
            for commit in commits_list:
                commit_short_id = commit["commit_short_id"]
                # provide api needed info
                url = f"https://gitlab.com/api/v4/projects/{project_id}/repository/{commit_short_id}/diff&created_after={data_limitation}"
                headers = {
                    "PRIVATE-TOKEN": accessToken,
                    "Content-Type": "application/json",
                }

                # make API call with basic error handling
                try:
                    response = requests.get(url, headers=headers)
                    if response.status_code >= 200 and response.status_code < 300:
                        data = response.json()
                        # Variables to track lines added and removed
                        lines_added = 0
                        lines_removed = 0
                        added_lines_content = []
                        removed_lines_content = []
                        # Get the needed data for each commit
                        for file_diff in data:
                            diff_text = file_diff["diff"]
                            # Split the diff into lines and count added and removed lines
                            for line in diff_text.splitlines():
                                if line.startswith("+") and not line.startswith("+++"):
                                    lines_added += 1
                                    added_lines_content.append(line[1:].strip())
                                elif line.startswith("-") and not line.startswith(
                                    "---"
                                ):
                                    lines_removed += 1
                                    removed_lines_content.append(line[1:].strip())

                        commit_diff_info = {
                            "lines_added": lines_added,
                            "lines_removed": lines_removed,
                            "added_lines_content": added_lines_content,
                            "removed_lines_content": removed_lines_content,
                        }

                        # Append the diff data to the project's commits
                        if project_id not in commits_diff_data_dict:
                            commits_diff_data_dict[project_id] = []

                        commits_diff_data_dict[project_id].append(
                            {
                                "commit_short_id": commit_short_id,
                                "diff_data": commit_diff_info,
                            }
                        )

                    else:
                        return f"Failed to fetch diff for commit {commit_short_id} in project {project_id}"
                except requests.exceptions.RequestException as e:
                    # Handle any errors that occur during the request
                    return {"success": False, "message": str(e)}
        return commits_diff_data_dict

    def gitlab_mrs_comments_api_call(self, data):
        # To make the api call you need to provide mrs_list
        # get needed data to the variables
        mr_data_dict = data.get("mr_data_dict")
        accessToken = data.get("teammemberGitPersonalAccessToken")
        data_limitation = data.get("data_limitation")
        mrs_comments_data_dict = {}

        for mr_id, mr in mr_data_dict.items():
            mr_iid = mr["iid"]
            project_id = mr["project_id"]

            # provide api needed info
            url = f"https://gitlab.com/api/v4/projects/{project_id}/merge_requests/{mr_iid}/notes?created_after={data_limitation}"
            headers = {
                "PRIVATE-TOKEN": accessToken,
                "Content-Type": "application/json",
            }

            # make API call with basic error handling
            try:
                response = requests.get(url, headers=headers)
                if response.status_code >= 200 and response.status_code < 300:
                    data = response.json()
                    # Get the needed data for each commit
                    for record in data:
                        mrs_comments_data_dict[mr_id] = {
                            "id": record["id"],
                            "body": record["body"],
                        }
                else:
                    return False
            except requests.exceptions.RequestException as e:
                # Handle any errors that occur during the rMRequest
                return {"success": False, "message": str(e)}
        return mrs_comments_data_dict


class TeammemberCodingStatsUpdateAPIView(UpdateAPIView):
    queryset = TeammemberCodingStats.objects.all()
    serializer_class = TeammemberCodingStatsSerializer


class TeammemberCodingStatsDeleteAPIView(DestroyAPIView):
    queryset = TeammemberCodingStats.objects.all()
    serializer_class = TeammemberCodingStatsSerializer
