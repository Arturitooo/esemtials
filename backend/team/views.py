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
        teammember.teammember_hasGitIntegration = integration_status

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
                return f"GitLab API call failed with status code: {response.status_code}, response: {response.text}"
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
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        body = {}
        teammember_id = self.request.data.get("teammember")
        # get related teammember integration data and define what
        teammember = get_object_or_404(Teammember, pk=teammember_id, created_by=user)
        gitIntegrationData = TeamMemberGitIntegrationData.objects.filter(
            teammember=teammember
        ).first()

        # set date limes to 30 days ago and convert to needed format
        data_limitation = str(datetime.today() - timedelta(days=30))
        dt_object = datetime.strptime(data_limitation, "%Y-%m-%d %H:%M:%S.%f")
        data_limitation_iso_format = dt_object.strftime("%Y-%m-%dT%H:%M:%SZ")

        # Add the 'data_limitation_iso_format' to the dictionary to use in api calls
        if gitIntegrationData:
            # Prepare the apiCallsInput
            apiCallsInput = {
                "groupID": gitIntegrationData.teammemberGitGroupID,
                "userID": gitIntegrationData.teammemberGitUserID,
                "accessToken": gitIntegrationData.teammemberGitPersonalAccessToken,
                "data_limitation": data_limitation_iso_format,
            }

        # Make created mrs api call with gitlab_merge_requests_api_call
        apiCallsInput["requestType"] = "author_id"
        created_mrs_data = self.gitlab_merge_requests_api_call(apiCallsInput)

        # Make reviewed mrs api call with gitlab_merge_requests_api_call
        apiCallsInput["requestType"] = "reviewer_id"
        reviewed_mrs_data = self.gitlab_merge_requests_api_call(apiCallsInput)
        del apiCallsInput["requestType"]

        # 3. Extract MR IDs and prepare the list for mrs_list
        mrs_ids = set()  # Use a set to avoid duplicate IDs

        # Add created MRs IDs to the set
        for mr_id in created_mrs_data.keys():
            mrs_ids.add(mr_id)

        # Convert the set to a list and add to apiCallsInput
        apiCallsInput["mrs_list"] = list(mrs_ids)

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

        # Convert the set to a list and add it to api calls input
        merged_project_ids_list = list(merged_project_ids)
        apiCallsInput["projects_list"] = merged_project_ids_list

        # Make Project api call
        mrs_projects_data = self.gitlab_project_api_call(apiCallsInput)
        del apiCallsInput["mrs_list"]

        # Make commits created api call with gitlab_commits_created_api_call
        commits_created_data = self.gitlab_commits_created_api_call(apiCallsInput)
        del apiCallsInput["projects_list"]

        # Make commits difference api call with gitlab_commits_diff_api_call
        # apiCallsInput["commits_list"] = created_commits_data_dict
        apiCallsInput["commits_list"] = commits_created_data
        commits_diffs_data = self.gitlab_commits_diff_api_call(apiCallsInput)
        del apiCallsInput["commits_list"]

        # Fetch MRs comments api call with gitlab_commits_diff_api_call
        # Combine both dictionaries
        combined_mrs_data = created_mrs_data.copy()  # Start with created_mrs_data
        combined_mrs_data.update(reviewed_mrs_data)  # Merge in reviewed_mrs_data
        apiCallsInput["mrs_data"] = combined_mrs_data
        mrs_comments_data = self.gitlab_mrs_comments_api_call(apiCallsInput)

        # Structure the data in a reasonable way
        # Adding the project data to the body and initializing the groups of data to be provided later
        for project_id, project_data in mrs_projects_data.items():
            body[project_id] = {
                "project_name": project_data["project_name"],
                "project_url": project_data["project_url"],
                "created_mrs_data": [],
                "reviewed_mrs_data": [],
                "created_commits_data": [],
                "counters7": [],
                "counters24": [],
            }

        # Merge comments with the MR data into one variable
        for mr_id, comment_data in mrs_comments_data.items():
            # Add comment data to the respective MR in created_mrs_data if it exists
            if mr_id in created_mrs_data:
                created_mrs_data[mr_id]["comment_id"] = comment_data["comment_id"]
                created_mrs_data[mr_id]["comment_body"] = comment_data["comment_body"]

            # Add comment data to the respective MR in reviewed_mrs_data if it exists and not in created_mrs_data
            if mr_id in reviewed_mrs_data and mr_id not in created_mrs_data:
                reviewed_mrs_data[mr_id]["comment_id"] = comment_data["comment_id"]
                reviewed_mrs_data[mr_id]["comment_body"] = comment_data["comment_body"]

        # Function to add MR data to the appropriate project section
        def add_mr_data_to_project(project_id, mr_data_list, section_name):
            for mr_id, mr_data in mr_data_list.items():
                # Check for comments and assign False if missing
                mr_data["comment_id"] = mr_data.get("comment_id", False)
                mr_data["comment_body"] = mr_data.get("comment_body", False)

                # Append MR data to the respective section in the project body
                body[project_id][section_name].append(
                    {
                        "mr_id": mr_id,
                        "iid": mr_data["iid"],
                        "created_at": mr_data["created_at"],
                        "merged_at": mr_data["merged_at"],
                        "comment_id": mr_data["comment_id"],
                        "comment_body": mr_data["comment_body"],
                    }
                )

        # Add the MR data to the 'created_mrs_data' and 'reviewed_mrs_data' lists for each project
        for project_id in body.keys():
            if project_id in created_mrs_data:
                add_mr_data_to_project(project_id, created_mrs_data, "created_mrs_data")
            if project_id in reviewed_mrs_data:
                add_mr_data_to_project(
                    project_id, reviewed_mrs_data, "reviewed_mrs_data"
                )

        # Add the Commit data to the 'created_commits_data' list for that project and initialize diff data
        for project_id, commit_data_list in commits_created_data.items():
            # Ensure the project ID exists in the body
            if project_id not in body:
                body[project_id] = {"created_commits_data": []}

            for commit_data in commit_data_list:
                body[project_id]["created_commits_data"].append(
                    {
                        "commit_short_id": commit_data["commit_short_id"],
                        "created_at": commit_data["created_at"],
                        "commit_web_url": commit_data["commit_web_url"],
                        "diff_data": [],  # Initialize as an empty list
                    }
                )

        # Add the commit diff data
        for project_id, commit_comments_data_list in commits_diffs_data.items():
            for commit_comments_data in commit_comments_data_list:
                # Find the correct commit in the body's created_commits_data list
                for commit in body[project_id]["created_commits_data"]:
                    if (
                        commit["commit_short_id"]
                        == commit_comments_data["commit_short_id"]
                    ):
                        # Access 'diff_data' from commit_comments_data
                        diff_data = commit_comments_data["diff_data"]

                        # Append diff data to the respective commit's diff_data list
                        commit["diff_data"].append(
                            {
                                "lines_added": diff_data["lines_added"],
                                "lines_removed": diff_data["lines_removed"],
                                "added_lines_content": diff_data["added_lines_content"],
                                "removed_lines_content": diff_data[
                                    "removed_lines_content"
                                ],
                            }
                        )
        # TODO stats calculation

        print("body")
        print(body)

    def gitlab_merge_requests_api_call(self, data):
        # To make the api call you need to provide if check author_id or reviewer_id
        # get needed data to the variables
        requestType = data.get("requestType")
        userID = data.get("userID")
        accessToken = data.get("accessToken")
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
                return f"GitLab API call failed with status code: {response.status_code}, response: {response.text}"
        except requests.exceptions.RequestException as e:
            # Handle any errors that occur during the request
            return {"success": False, "message": str(e)}

    def gitlab_project_api_call(self, data):
        # To make the api call you need to provide projects_list
        # get needed data to the variables
        projects_list = data.get("projects_list")
        accessToken = data.get("accessToken")

        project_data_dict = {}

        for project in projects_list:
            # provide api needed info
            url = f"https://gitlab.com/api/v4/projects/{project}"
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
                    project_id = project
                    project_data_dict[project_id] = {
                        "project_name": data["name"],
                        "project_url": data["web_url"],
                    }
                else:
                    return f"Project GitLab API call failed with status code: {response.status_code}, response: {response.text}"
            except requests.exceptions.RequestException as e:
                # Handle any errors that occur during the request
                return {"success": False, "message": str(e)}
        return project_data_dict

    def gitlab_commits_created_api_call(self, data):
        # To make the api call you need to provide projects_list
        # get needed data to the variables
        projects_list = data.get("projects_list")
        userID = data.get("teammemberGitUserID")
        accessToken = data.get("accessToken")
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
                    commits = response.json()
                    # Initialize the list of commits for the project if not already present
                    if project not in created_commits_data_dict:
                        created_commits_data_dict[project] = []
                    # Get the needed data for each commit
                    # Iterate over each commit and extract relevant details
                    for commit in commits:
                        commit_info = {
                            "commit_short_id": commit.get("short_id"),
                            "created_at": commit.get("created_at"),
                            "commit_web_url": commit.get("web_url"),
                        }
                        # Append each commit's data to the list for the respective project
                        created_commits_data_dict[project].append(commit_info)
                else:
                    return f"GitLab API call failed with status code: {response.status_code}, response: {response.text}"
            except requests.exceptions.RequestException as e:
                # Handle any errors that occur during the request
                return {"success": False, "message": str(e)}
        return created_commits_data_dict

    def gitlab_commits_diff_api_call(self, data):
        # To make the api call you need to provide projects_list
        # get needed data to the variables
        created_commits_data_dict = data
        accessToken = data.get("accessToken")

        commits_diff_data_dict = {}

        for project_id, commits_list in created_commits_data_dict[
            "commits_list"
        ].items():
            for commit in commits_list:
                if isinstance(commit, dict):
                    commit_short_id = commit["commit_short_id"]
                else:
                    # Handle case where commit is a string
                    commit_short_id = commit
                # provide api needed info
                url = f"https://gitlab.com/api/v4/projects/{project_id}/repository/commits/{commit_short_id}/diff"
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

        mrs_data = data.get("mrs_data")
        accessToken = data.get("accessToken")
        data_limitation = data.get("data_limitation")
        mrs_comments_data_dict = {}

        for mr_id, mr in mrs_data.items():
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
                            "comment_id": record["id"],
                            "comment_body": record["body"],
                        }
                else:
                    return f"GitLab API call failed with status code: {response.status_code}, response: {response.text}"
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
