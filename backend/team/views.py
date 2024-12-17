import requests
from datetime import datetime, timedelta
from django.shortcuts import get_object_or_404
from .models import (
    Teammember,
    TeamMemberComment,
    TeamMemberGitIntegrationData,
    TeammemberCodingStats,
)
from django.forms.models import model_to_dict
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
from .utils import (
    gitlab_verification_api_call,
    gitlab_merge_requests_api_call,
    gitlab_project_api_call,
    gitlab_commits_created_api_call,
    gitlab_commits_diff_api_call,
    gitlab_mrs_comments_api_call,
)


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
        data = request.data.copy()  # Make a mutable copy
        if "teammember_hasGitIntegration" not in data:
            data["teammember_hasGitIntegration"] = None
        serializer = self.get_serializer(data=data)
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
        data = request.data.copy()  # Make a mutable copy
        if "teammember_hasGitIntegration" not in data:
            data["teammember_hasGitIntegration"] = None
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=data, partial=partial)
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

        try:
            # Perform API verification
            integration_status = gitlab_verification_api_call(validated_data)

            if integration_status:
                teammember.teammember_hasGitIntegration = True
            else:
                teammember.teammember_hasGitIntegration = False

            teammember.save()

            # Save the serializer if the integration succeeded
            serializer.save(created_by=self.request.user)

        except (requests.exceptions.RequestException, KeyError, ValueError) as error:
            # Handle any error during the API call or data validation
            teammember.teammember_hasGitIntegration = False
            teammember.save()

            # Raise validation error for invalid data
            raise ValidationError(
                {
                    "detail": "GitLab integration failed due to invalid data or API error."
                }
            )


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
        integration_status = gitlab_verification_api_call(serializer.validated_data)

        if integration_status:
            teammember.teammember_hasGitIntegration = True
        else:
            teammember.teammember_hasGitIntegration = False

        teammember.save()


class TeamMemberGitIntegrationDataDeleteAPIView(DestroyAPIView):
    queryset = TeamMemberGitIntegrationData.objects.all()
    serializer_class = TeamMemberGitIntegrationDataSerializer
    permission_classes = [IsAuthenticated]


class TeammemberCodingStatsListAPIView(ListAPIView):
    serializer_class = TeammemberCodingStatsSerializer

    def get_queryset(self):
        # Get the list of team member IDs from the request query parameters
        teammember_ids = self.request.query_params.getlist("ids")

        # Filter the queryset based on the provided IDs
        if teammember_ids:
            return TeammemberCodingStats.objects.filter(
                teammember_id__in=teammember_ids
            )
        return (
            TeammemberCodingStats.objects.none()
        )  # Return an empty queryset if no IDs are provided

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)

        # Create a custom response to include only the required fields
        response_data = [
            {
                "teammember": coding_stat.teammember.id,  # Assuming you want the team member ID
                "counters7": coding_stat.counters7,
                "counters30": coding_stat.counters30,
            }
            for coding_stat in queryset
        ]

        return response.Response(response_data, status=status.HTTP_200_OK)

    # example: http://127.0.0.1:8000/team/teammember-coding-stats/?ids=8&ids=9


class TeammemberCodingStatsDetailAPIView(RetrieveAPIView):
    queryset = TeammemberCodingStats.objects.all()
    serializer_class = TeammemberCodingStatsSerializer

    def get_object(self):
        # Get the team member ID from the URL parameters
        teammember_id = self.kwargs.get("teammember_id")

        # Retrieve the CodingStats instance based on the teammember ID
        try:
            return TeammemberCodingStats.objects.get(teammember_id=teammember_id)
        except TeammemberCodingStats.DoesNotExist:
            # Handle the case where the team member coding stats do not exist
            raise NotFound(
                detail="Coding stats not found for the specified team member."
            )

    def retrieve(self, request, *args, **kwargs):
        # Call the superclass retrieve method to get the object
        coding_stats = self.get_object()
        serializer = self.get_serializer(coding_stats)

        # Remove the `body` field from the serialized data
        data = serializer.data
        data.pop("body", None)

        # Return the serialized data
        return response.Response(data, status=status.HTTP_200_OK)


class TeammemberCodingStatsCreateAPIView(CreateAPIView):
    queryset = TeammemberCodingStats.objects.all()
    serializer_class = TeammemberCodingStatsSerializer
    permission_classes = [permissions.IsAuthenticated]

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
        data_limitation30 = str(datetime.today() - timedelta(days=30))
        dt_object30 = datetime.strptime(data_limitation30, "%Y-%m-%d %H:%M:%S.%f")
        data_limitation_iso_format30 = dt_object30.strftime("%Y-%m-%dT%H:%M:%SZ")

        # set date limes to 60 days ago and convert to needed format
        data_limitation60 = str(datetime.today() - timedelta(days=60))
        dt_object60 = datetime.strptime(data_limitation60, "%Y-%m-%d %H:%M:%S.%f")
        data_limitation_iso_format60 = dt_object60.strftime("%Y-%m-%dT%H:%M:%SZ")

        # set date limes to 7 days ago and convert to needed format
        data_limitation7 = str(datetime.today() - timedelta(days=7))
        dt_object7 = datetime.strptime(data_limitation7, "%Y-%m-%d %H:%M:%S.%f")
        data_limitation7_iso_format = dt_object7.strftime("%Y-%m-%dT%H:%M:%SZ")

        # set date limes to 14 days ago and convert to needed format
        data_limitation14 = str(datetime.today() - timedelta(days=14))
        dt_object14 = datetime.strptime(data_limitation14, "%Y-%m-%d %H:%M:%S.%f")
        data_limitation14_iso_format = dt_object14.strftime("%Y-%m-%dT%H:%M:%SZ")

        # Add the 'data_limitation_iso_format' to the dictionary to use in api calls
        if gitIntegrationData:
            # Prepare the apiCallsInput
            apiCallsInput = {
                "groupID": gitIntegrationData.teammemberGitGroupID,
                "userID": gitIntegrationData.teammemberGitUserID,
                "accessToken": gitIntegrationData.teammemberGitPersonalAccessToken,
                "data_limitation": data_limitation_iso_format60,
            }

        # Make created mrs api call with gitlab_merge_requests_api_call
        apiCallsInput["requestType"] = "author_id"
        created_mrs_data = gitlab_merge_requests_api_call(apiCallsInput)

        # Make reviewed mrs api call with gitlab_merge_requests_api_call
        apiCallsInput["requestType"] = "reviewer_id"
        reviewed_mrs_data = gitlab_merge_requests_api_call(apiCallsInput)
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
        mrs_projects_data = gitlab_project_api_call(apiCallsInput)
        del apiCallsInput["mrs_list"]

        # Make commits created api call with gitlab_commits_created_api_call
        commits_created_data = gitlab_commits_created_api_call(apiCallsInput)
        del apiCallsInput["projects_list"]

        # Make commits difference api call with gitlab_commits_diff_api_call
        # apiCallsInput["commits_list"] = created_commits_data_dict
        apiCallsInput["commits_list"] = commits_created_data
        commits_diffs_data = gitlab_commits_diff_api_call(apiCallsInput)
        del apiCallsInput["commits_list"]

        # Fetch MRs comments api call with gitlab_commits_diff_api_call
        # Combine both dictionaries
        combined_mrs_data = created_mrs_data.copy()  # Start with created_mrs_data
        combined_mrs_data.update(reviewed_mrs_data)  # Merge in reviewed_mrs_data
        apiCallsInput["mrs_data"] = combined_mrs_data
        mrs_comments_data = gitlab_mrs_comments_api_call(apiCallsInput)

        # Structure the data in a reasonable way
        # Adding the project data to the body and initializing the groups of data to be provided later
        for project_id, project_data in mrs_projects_data.items():
            body[project_id] = {
                "project_name": project_data["project_name"],
                "project_url": project_data["project_url"],
                "created_mrs_data": [],
                "reviewed_mrs_data": [],
                "created_commits_data": [],
            }

        # Before adding MRs data - merge the comments and the MRs info into one variable
        for mr_id, comment_data in mrs_comments_data.items():
            # Check if the MR ID exists in the created_mrs_data
            if mr_id in created_mrs_data:
                # Add the comment data to the respective MR in created_mrs_data
                created_mrs_data[mr_id]["comment_ids"] = comment_data["comment_ids"]
                created_mrs_data[mr_id]["comment_bodies"] = comment_data[
                    "comment_bodies"
                ]

        for mr_id, comment_data in mrs_comments_data.items():
            # Check if the MR ID exists in the reviewed_mrs_data
            if mr_id in reviewed_mrs_data and mr_id not in created_mrs_data:
                # Add the comment data to the respective MR in reviewed_mrs_data
                reviewed_mrs_data[mr_id]["comment_ids"] = comment_data["comment_ids"]
                reviewed_mrs_data[mr_id]["comment_bodies"] = comment_data[
                    "comment_bodies"
                ]

        # Add the MR data to the 'created_mrs_data' list for that project
        # initialise variable for mrs chart created at data and counting the timeframes
        today = datetime.now()
        last_7_days = today - timedelta(days=7)
        last_30_days = today - timedelta(days=30)
        previous_7_days = today - timedelta(days=14)
        previous_30_days = today - timedelta(days=60)

        # Initialize the specified time sets
        mrs_created_last_7_days_data = {}
        mrs_created_last_30_days_data = {}
        mrs_reviewed_last_7_days_data = {}
        mrs_reviewed_last_30_days_data = {}
        mrs_created_previous_7_days_data = {}
        mrs_created_previous_30_days_data = {}
        mrs_reviewed_previous_7_days_data = {}
        mrs_reviewed_previous_30_days_data = {}
        mr_created_chart_data = {}

        for i in range(30):
            date = today - timedelta(days=i)  # Subtract i days from today
            date_str = date.strftime("%Y-%m-%d")  # Format the date as "YYYY-MM-DD"
            mr_created_chart_data[date_str] = 0  # Initialize with value 0

        # Reverse the dictionary to have the latest date as the last item
        mr_created_chart_data = dict(reversed(list(mr_created_chart_data.items())))

        for mr_id, mr_data in created_mrs_data.items():
            project_id = mr_data["project_id"]

            # check if there are comments for the mr
            if not mr_data.get("comment_ids"):
                mr_data["comment_ids"] = False
            if not mr_data.get("comment_bodies"):
                mr_data["comment_bodies"] = False

            # Check if the project_id exists in the body
            body[project_id]["created_mrs_data"].append(
                {
                    "mr_id": mr_id,
                    "iid": mr_data["iid"],
                    "created_at": mr_data["created_at"],
                    "merged_at": mr_data["merged_at"],
                    "create_to_merge": mr_data["create_to_merge"],
                    "comment_ids": mr_data["comment_ids"],
                    "comment_bodies": mr_data["comment_bodies"],
                }
            )

            # Generate data for MRs chart - created MRs
            created_at_simplified = datetime.strptime(
                mr_data["created_at"], "%Y-%m-%dT%H:%M:%S.%fZ"
            ).strftime("%Y-%m-%d")

            if created_at_simplified in mr_created_chart_data:
                mr_created_chart_data[created_at_simplified] += 1

        # Add the MR data to the 'reviewed_mrs_data' list for that project
        # initialise variable for mrs chart reviewed at data
        mr_reviewed_chart_data = {}

        for i in range(30):
            date = today - timedelta(days=i)  # Subtract i days from today
            date_str = date.strftime("%Y-%m-%d")  # Format the date as "YYYY-MM-DD"
            mr_reviewed_chart_data[date_str] = 0  # Initialize with value 0

        # Reverse the dictionary to have the latest date as the last item
        mr_reviewed_chart_data = dict(reversed(list(mr_reviewed_chart_data.items())))

        for mr_id, mr_data in reviewed_mrs_data.items():
            project_id = mr_data["project_id"]

            # Check if there are comments for the mr
            if not mr_data.get("comment_ids"):
                mr_data["comment_ids"] = False
            if not mr_data.get("comment_bodies"):
                mr_data["comment_bodies"] = False

            # Check if the project_id exists in the body
            body[project_id]["reviewed_mrs_data"].append(
                {
                    "mr_id": mr_id,
                    "iid": mr_data["iid"],
                    "created_at": mr_data["created_at"],
                    "merged_at": mr_data["merged_at"],
                    "comment_ids": mr_data["comment_ids"],
                    "comment_bodies": mr_data["comment_bodies"],
                }
            )

            # Generate data for MRs chart - created MRs
            created_at_simplified = datetime.strptime(
                mr_data["created_at"], "%Y-%m-%dT%H:%M:%S.%fZ"
            ).strftime("%Y-%m-%d")

            if created_at_simplified in mr_reviewed_chart_data:
                mr_reviewed_chart_data[created_at_simplified] += 1

        for date_str, value in mr_created_chart_data.items():
            date = datetime.strptime(date_str, "%Y-%m-%d")  # Convert string to datetime
            if date >= last_7_days:
                mrs_created_last_7_days_data[date_str] = value  # Add to 7 days set
            if date <= last_7_days and date >= previous_7_days:
                mrs_created_previous_7_days_data[date_str] = value
            if date >= last_30_days:
                mrs_created_last_30_days_data[date_str] = value  # Add to 30 days set
            if date <= last_30_days and date >= previous_30_days:
                mrs_created_previous_30_days_data[date_str] = value

        for date_str, value in mr_reviewed_chart_data.items():
            date = datetime.strptime(date_str, "%Y-%m-%d")  # Convert string to datetime
            if date >= last_7_days:
                mrs_reviewed_last_7_days_data[date_str] = value  # Add to 7 days set
            if date <= last_7_days and date >= previous_7_days:
                mrs_reviewed_previous_7_days_data[date_str] = value
            if date >= last_30_days:
                mrs_reviewed_last_30_days_data[date_str] = value  # Add to 30 days set
            if date <= last_30_days and date >= previous_30_days:
                mrs_reviewed_previous_30_days_data[date_str] = value

        # Convert to lists to easly render the chart
        last_7_days_xAxis = list(mrs_created_last_7_days_data.keys())
        mrs_created_last_7_days_yAxis = list(mrs_created_last_7_days_data.values())
        last_30_days_xAxis = list(mrs_created_last_30_days_data.keys())
        mrs_created_last_30_days_yAxis = list(mrs_created_last_30_days_data.values())
        mrs_reviewed_last_7_days_yAxis = list(mrs_reviewed_last_7_days_data.values())
        mrs_reviewed_last_30_days_yAxis = list(mrs_reviewed_last_30_days_data.values())

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

        active_projects30_list = []
        active_projects7_list = []
        # Loop through each project to get number of projects
        for project, project_data in body.items():
            # initialize the stats
            active_projects30 = created_mrs_counter30 = reviewed_mrs_counter30 = (
                create_to_merge30
            ) = create_to_merge30sum = comments_in_created_mrs30 = created_commits30 = (
                lines_added30
            ) = lines_removed30 = 0

            previous_active_projects30 = previous_created_mrs_counter30 = (
                previous_reviewed_mrs_counter30
            ) = previous_create_to_merge30 = previous_create_to_merge30sum = (
                previous_comments_in_created_mrs30
            ) = previous_created_commits30 = previous_lines_added30 = (
                previous_lines_removed30
            ) = 0

            active_projects7 = created_mrs_counter7 = reviewed_mrs_counter7 = (
                create_to_merge7
            ) = create_to_merge7sum = comments_in_created_mrs7 = created_commits7 = (
                lines_added7
            ) = lines_removed7 = 0

            previous_active_projects7 = previous_created_mrs_counter7 = (
                previous_reviewed_mrs_counter7
            ) = previous_create_to_merge7 = previous_create_to_merge7sum = (
                previous_comments_in_created_mrs7
            ) = previous_created_commits7 = previous_lines_added7 = (
                previous_lines_removed7
            ) = 0

            # Loop through each MR created to count active projects
            for created_mr in project_data["created_mrs_data"]:
                if created_mr["created_at"] > data_limitation7_iso_format:
                    create_to_merge7sum += created_mr["create_to_merge"]
                    create_to_merge30sum += created_mr["create_to_merge"]
                    created_mrs_counter7 += 1
                    created_mrs_counter30 += 1

                    # generate project set of data
                    temp_project_name = mrs_projects_data[project]["project_name"]
                    temp_project_url = mrs_projects_data[project]["project_url"]
                    project_info = {
                        project: {
                            "project_name": temp_project_name,
                            "project_url": temp_project_url,
                        }
                    }

                    if project_info not in active_projects7_list:
                        active_projects7_list.append(project_info)
                    if project_info not in active_projects30_list:
                        active_projects30_list.append(project_info)

                    for comment in created_mr["comment_ids"]:
                        comments_in_created_mrs7 += 1
                        comments_in_created_mrs30 += 1

                if (
                    data_limitation7_iso_format
                    > created_mr["created_at"]
                    > data_limitation_iso_format30
                ):
                    # generate project set of data
                    temp_project_name = mrs_projects_data[project]["project_name"]
                    temp_project_url = mrs_projects_data[project]["project_url"]
                    project_info = {
                        project: {
                            "project_name": temp_project_name,
                            "project_url": temp_project_url,
                        }
                    }

                    create_to_merge30sum += created_mr["create_to_merge"]
                    if project_info not in active_projects30_list:
                        active_projects30_list.append(project_info)
                    created_mrs_counter30 += 1
                    for comment in created_mr["comment_ids"]:
                        comments_in_created_mrs30 += 1
                if (
                    data_limitation7_iso_format
                    > created_mr["created_at"]
                    > data_limitation14_iso_format
                ):
                    previous_created_mrs_counter7 += 1
                    previous_create_to_merge7sum += created_mr["create_to_merge"]
                    for comment in created_mr["comment_ids"]:
                        previous_comments_in_created_mrs7 += 1

                if (
                    data_limitation_iso_format30
                    > created_mr["created_at"]
                    > data_limitation_iso_format60
                ):
                    previous_create_to_merge30sum += created_mr["create_to_merge"]
                    previous_created_mrs_counter30 += 1
                    for comment in created_mr["comment_ids"]:
                        previous_comments_in_created_mrs30 += 1

                if created_mrs_counter30 == 0:
                    create_to_merge30 = 0
                else:
                    create_to_merge30 = create_to_merge30sum / created_mrs_counter30

                if previous_created_mrs_counter30 == 0:
                    previous_create_to_merge30 = 0
                else:
                    previous_create_to_merge30 = (
                        previous_created_mrs_counter30 / previous_created_mrs_counter30
                    )

                if created_mrs_counter7 == 0:
                    create_to_merge7 = 0
                else:
                    create_to_merge7 = create_to_merge7sum / created_mrs_counter7

                if previous_created_mrs_counter7 == 0:
                    previous_create_to_merge7 = 0
                else:
                    previous_create_to_merge7 = (
                        previous_create_to_merge7sum / previous_created_mrs_counter7
                    )

            # Loop through each MR reviewed
            for reviewed_mr in project_data["reviewed_mrs_data"]:
                if reviewed_mr["created_at"] > data_limitation7_iso_format:
                    reviewed_mrs_counter7 += 1
                    reviewed_mrs_counter30 += 1
                elif (
                    data_limitation7_iso_format
                    > reviewed_mr["created_at"]
                    > data_limitation_iso_format30
                ):
                    reviewed_mrs_counter30 += 1

                if (
                    data_limitation7_iso_format
                    > reviewed_mr["created_at"]
                    > data_limitation14_iso_format
                ):
                    previous_reviewed_mrs_counter7 += 1
                elif (
                    data_limitation_iso_format30
                    > reviewed_mr["created_at"]
                    > data_limitation_iso_format60
                ):
                    previous_reviewed_mrs_counter30 += 1

            # If there were MRs created or reviewed - count as an active project
            if created_mrs_counter7 > 0 or reviewed_mrs_counter7 > 0:
                active_projects7 += 1
            if created_mrs_counter30 > 0 or reviewed_mrs_counter30 > 0:
                active_projects30 += 1
            if previous_created_mrs_counter7 > 0 or previous_reviewed_mrs_counter7 > 0:
                previous_active_projects7 += 1
            if (
                previous_created_mrs_counter30 > 0
                or previous_reviewed_mrs_counter30 > 0
            ):
                previous_active_projects30 += 1

            # Initialise the commit chart data
            commit_chart_data = {
                (today - timedelta(days=i)).strftime("%Y-%m-%d"): [0, 0]
                for i in range(30)
            }

            # Reverse the dictionary to have the latest date as the last item
            commit_chart_data = dict(reversed(list(commit_chart_data.items())))
            commits_added_lines_last_30_days_yAxis = []
            commits_removed_lines_last_30_days_yAxis = []
            commits_added_lines_last_7_days_yAxis = []
            commits_removed_lines_last_7_days_yAxis = []

            # Loop through each Commit created
            for commit in project_data["created_commits_data"]:
                if commit["created_at"] > data_limitation7_iso_format:
                    created_commits7 += 1
                    created_commits30 += 1

                    # provide simmplified date for commits
                    commit_created_at_simplified = datetime.strptime(
                        commit["created_at"].replace("+00:00", "Z"),
                        "%Y-%m-%dT%H:%M:%S.%fZ",
                    ).strftime("%Y-%m-%d")

                    for diff_item in commit["diff_data"]:
                        commit_chart_data[commit_created_at_simplified][0] += int(
                            diff_item["lines_added"]
                        )
                        commit_chart_data[commit_created_at_simplified][1] -= int(
                            diff_item["lines_removed"]
                        )
                        lines_added7 += int(diff_item["lines_added"])
                        lines_added30 += int(diff_item["lines_added"])
                        lines_removed7 += int(diff_item["lines_removed"])
                        lines_removed30 += int(diff_item["lines_removed"])

                elif (
                    data_limitation7_iso_format
                    > commit["created_at"]
                    > data_limitation_iso_format30
                ):
                    created_commits30 += 1
                    # provide simmplified date for commits
                    commit_created_at_simplified = datetime.strptime(
                        commit["created_at"].replace("+00:00", "Z"),
                        "%Y-%m-%dT%H:%M:%S.%fZ",
                    ).strftime("%Y-%m-%d")

                    for diff_item in commit["diff_data"]:
                        commit_chart_data[commit_created_at_simplified][0] += int(
                            diff_item["lines_added"]
                        )
                        commit_chart_data[commit_created_at_simplified][1] -= int(
                            diff_item["lines_removed"]
                        )
                        lines_added30 += int(diff_item["lines_added"])
                        lines_removed30 += int(diff_item["lines_removed"])

                if (
                    data_limitation7_iso_format
                    > commit["created_at"]
                    > data_limitation14_iso_format
                ):
                    previous_created_commits7 += 1

                    # provide simmplified date for commits
                    commit_created_at_simplified = datetime.strptime(
                        commit["created_at"].replace("+00:00", "Z"),
                        "%Y-%m-%dT%H:%M:%S.%fZ",
                    ).strftime("%Y-%m-%d")

                    for diff_item in commit["diff_data"]:
                        previous_lines_added7 += int(diff_item["lines_added"])
                        previous_lines_removed7 += int(diff_item["lines_removed"])

                elif (
                    data_limitation_iso_format30
                    > commit["created_at"]
                    > data_limitation_iso_format60
                ):
                    previous_created_commits30 += 1
                    # provide simmplified date for commits
                    commit_created_at_simplified = datetime.strptime(
                        commit["created_at"].replace("+00:00", "Z"),
                        "%Y-%m-%dT%H:%M:%S.%fZ",
                    ).strftime("%Y-%m-%d")

                    for diff_item in commit["diff_data"]:
                        previous_lines_added30 += int(diff_item["lines_added"])
                        previous_lines_removed30 += int(diff_item["lines_removed"])

            for daily_data in commit_chart_data.values():
                commits_added_lines_last_30_days_yAxis.append(int(daily_data[0]))
                commits_removed_lines_last_30_days_yAxis.append(int(daily_data[1]))

            commits_added_lines_last_7_days_yAxis = (
                commits_added_lines_last_30_days_yAxis[-7:]
            )
            commits_removed_lines_last_7_days_yAxis = (
                commits_removed_lines_last_30_days_yAxis[-7:]
            )

            body[project]["counters7"] = {
                "active_projects7": active_projects7,
                "created_mrs_counter7": created_mrs_counter7,
                "reviewed_mrs_counter7": reviewed_mrs_counter7,
                "create_to_merge7": create_to_merge7,
                "comments_in_created_mrs7": comments_in_created_mrs7,
                "created_commits7": created_commits7,
                "lines_added7": lines_added7,
                "lines_removed7": lines_removed7,
                "charts_last_7_days_xAxis": last_7_days_xAxis,
                "mrs_created_last_7_days_yAxis": mrs_created_last_7_days_yAxis,
                "mrs_reviewed_last_7_days_yAxis": mrs_reviewed_last_7_days_yAxis,
                "commits_added_lines_last_7_days_yAxis": commits_added_lines_last_7_days_yAxis,
                "commits_removed_lines_last_7_days_yAxis": commits_removed_lines_last_7_days_yAxis,
            }

            body[project]["counters30"] = {
                "active_projects30": active_projects30,
                "created_mrs_counter30": created_mrs_counter30,
                "reviewed_mrs_counter30": reviewed_mrs_counter30,
                "create_to_merge30": create_to_merge30,
                "comments_in_created_mrs30": comments_in_created_mrs30,
                "created_commits30": created_commits30,
                "lines_added30": lines_added30,
                "lines_removed30": lines_removed30,
                "charts_last_30_days_xAxis": last_30_days_xAxis,
                "mrs_created_last_30_days_yAxis": mrs_created_last_30_days_yAxis,
                "mrs_reviewed_last_30_days_yAxis": mrs_reviewed_last_30_days_yAxis,
                "commits_added_lines_last_30_days_yAxis": commits_added_lines_last_30_days_yAxis,
                "commits_removed_lines_last_30_days_yAxis": commits_removed_lines_last_30_days_yAxis,
            }

            body[project]["previous30"] = {
                "previous_active_projects30": previous_active_projects30,
                "previous_created_mrs_counter30": previous_created_mrs_counter30,
                "previous_reviewed_mrs_counter30": previous_reviewed_mrs_counter30,
                "previous_create_to_merge30": previous_create_to_merge30,
                "previous_comments_in_created_mrs30": previous_comments_in_created_mrs30,
                "previous_created_commits30": previous_created_commits30,
                "previous_lines_added30": previous_lines_added30,
                "previous_lines_removed30": previous_lines_removed30,
            }

            body[project]["previous7"] = {
                "previous_active_projects7": previous_active_projects7,
                "previous_created_mrs_counter7": previous_created_mrs_counter7,
                "previous_reviewed_mrs_counter7": previous_reviewed_mrs_counter7,
                "previous_create_to_merge7": previous_create_to_merge7,
                "previous_comments_in_created_mrs7": previous_comments_in_created_mrs7,
                "previous_created_commits7": previous_created_commits7,
                "previous_lines_added7": previous_lines_added7,
                "previous_lines_removed7": previous_lines_removed7,
            }

        # global counters

        global_active_projects7 = 0
        global_created_mrs_counter7 = 0
        global_reviewed_mrs_counter7 = 0
        global_create_to_merge7 = 0
        global_comments_in_created_mrs7 = 0
        global_created_commits7 = 0
        global_lines_added7 = 0
        global_lines_removed7 = 0
        global_mrs_created_last_7_days_xAxis = []
        global_mrs_reviewed_last_7_days_xAxis = []
        global_mrs_created_last_7_days_yAxis = []
        global_mrs_reviewed_last_7_days_yAxis = []
        tmp_commits_added_lines_last_7_days_yAxis = [0, 0, 0, 0, 0, 0, 0]
        tmp_commits_removed_lines_last_7_days_yAxis = [0, 0, 0, 0, 0, 0, 0]

        global_previous_active_projects7 = 0
        global_previous_created_mrs_counter7 = 0
        global_previous_reviewed_mrs_counter7 = 0
        global_previous_create_to_merge7 = 0
        global_previous_comments_in_created_mrs7 = 0
        global_previous_created_commits7 = 0
        global_previous_lines_added7 = 0
        global_previous_lines_removed7 = 0

        global_active_projects30 = 0
        global_created_mrs_counter30 = 0
        global_reviewed_mrs_counter30 = 0
        global_create_to_merge30 = 0
        global_comments_in_created_mrs30 = 0
        global_created_commits30 = 0
        global_lines_added30 = 0
        global_lines_removed30 = 0
        global_mrs_created_last_30_days_xAxis = []
        global_mrs_reviewed_last_30_days_xAxis = []
        global_mrs_created_last_30_days_yAxis = [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
        ]
        global_mrs_reviewed_last_30_days_yAxis = [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
        ]
        global_commits_added_lines_last_30_days_yAxis = []
        global_commits_removed_lines_last_30_days_yAxis = []
        tmp_commits_added_lines_last_30_days_yAxis = [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
        ]
        tmp_commits_removed_lines_last_30_days_yAxis = [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
        ]
        global_previous_active_projects30 = 0
        global_previous_created_mrs_counter30 = 0
        global_previous_reviewed_mrs_counter30 = 0
        global_previous_create_to_merge30 = 0
        global_previous_comments_in_created_mrs30 = 0
        global_previous_created_commits30 = 0
        global_previous_lines_added30 = 0
        global_previous_lines_removed30 = 0

        for project, project_data in body.items():
            global_active_projects7 += project_data["counters7"]["active_projects7"]
            global_previous_active_projects7 += project_data["previous7"][
                "previous_active_projects7"
            ]
            global_created_mrs_counter7 += project_data["counters7"][
                "created_mrs_counter7"
            ]
            global_previous_created_mrs_counter7 += project_data["previous7"][
                "previous_created_mrs_counter7"
            ]
            global_reviewed_mrs_counter7 += project_data["counters7"][
                "reviewed_mrs_counter7"
            ]
            global_previous_reviewed_mrs_counter7 += project_data["previous7"][
                "previous_reviewed_mrs_counter7"
            ]
            global_create_to_merge7 += project_data["counters7"]["create_to_merge7"]
            global_previous_create_to_merge7 += project_data["previous7"][
                "previous_create_to_merge7"
            ]
            global_comments_in_created_mrs7 += project_data["counters7"][
                "comments_in_created_mrs7"
            ]
            global_previous_comments_in_created_mrs7 += project_data["previous7"][
                "previous_comments_in_created_mrs7"
            ]
            global_created_commits7 += project_data["counters7"]["created_commits7"]
            global_previous_created_commits7 += project_data["previous7"][
                "previous_created_commits7"
            ]
            global_lines_added7 += project_data["counters7"]["lines_added7"]
            global_previous_lines_added7 += project_data["previous7"][
                "previous_lines_added7"
            ]
            global_lines_removed7 += project_data["counters7"]["lines_removed7"]
            global_previous_lines_removed7 += project_data["previous7"][
                "previous_lines_removed7"
            ]
            global_mrs_created_last_7_days_xAxis = last_7_days_xAxis
            tmp_mrs_created_last_7_days_yAxis = [0, 0, 0, 0, 0, 0, 0]
            global_mrs_created_last_7_days_yAxis = [
                a + b
                for a, b in zip(
                    tmp_mrs_created_last_7_days_yAxis,
                    project_data["counters7"]["mrs_created_last_7_days_yAxis"],
                )
            ]
            global_mrs_reviewed_last_7_days_xAxis = last_7_days_xAxis
            tmp_mrs_reviewed_last_7_days_yAxis = [0, 0, 0, 0, 0, 0, 0]
            global_mrs_reviewed_last_7_days_yAxis = [
                a + b
                for a, b in zip(
                    tmp_mrs_reviewed_last_7_days_yAxis,
                    project_data["counters7"]["mrs_reviewed_last_7_days_yAxis"],
                )
            ]
            global_commits_added_lines_last_7_days_yAxis = [
                a + b
                for a, b in zip(
                    tmp_commits_added_lines_last_7_days_yAxis,
                    project_data["counters7"]["commits_added_lines_last_7_days_yAxis"],
                )
            ]
            tmp_commits_added_lines_last_7_days_yAxis = (
                global_commits_added_lines_last_7_days_yAxis
            )
            global_commits_removed_lines_last_7_days_yAxis = [
                a + b
                for a, b in zip(
                    tmp_commits_removed_lines_last_7_days_yAxis,
                    project_data["counters7"][
                        "commits_removed_lines_last_7_days_yAxis"
                    ],
                )
            ]
            tmp_commits_removed_lines_last_7_days_yAxis = (
                global_commits_removed_lines_last_7_days_yAxis
            )

            global_active_projects30 += project_data["counters30"]["active_projects30"]
            global_previous_active_projects30 += project_data["previous30"][
                "previous_active_projects30"
            ]
            global_created_mrs_counter30 += project_data["counters30"][
                "created_mrs_counter30"
            ]
            global_previous_created_mrs_counter30 += project_data["previous30"][
                "previous_created_mrs_counter30"
            ]
            global_reviewed_mrs_counter30 += project_data["counters30"][
                "reviewed_mrs_counter30"
            ]
            global_previous_reviewed_mrs_counter30 += project_data["previous30"][
                "previous_reviewed_mrs_counter30"
            ]
            global_create_to_merge30 += project_data["counters30"]["create_to_merge30"]
            global_previous_create_to_merge30 += project_data["previous30"][
                "previous_create_to_merge30"
            ]
            global_comments_in_created_mrs30 += project_data["counters30"][
                "comments_in_created_mrs30"
            ]
            global_previous_comments_in_created_mrs30 += project_data["previous30"][
                "previous_comments_in_created_mrs30"
            ]
            global_created_commits30 += project_data["counters30"]["created_commits30"]
            global_previous_created_commits30 += project_data["previous30"][
                "previous_created_commits30"
            ]
            global_lines_added30 += project_data["counters30"]["lines_added30"]
            global_previous_lines_added30 += project_data["previous30"][
                "previous_lines_added30"
            ]
            global_lines_removed30 += project_data["counters30"]["lines_removed30"]
            global_previous_lines_removed30 += project_data["previous30"][
                "previous_lines_removed30"
            ]
            global_mrs_created_last_30_days_xAxis = last_30_days_xAxis
            tmp_mrs_created_last_30_days_yAxis = [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
            ]
            global_mrs_created_last_30_days_yAxis = [
                a + b
                for a, b in zip(
                    tmp_mrs_created_last_30_days_yAxis,
                    project_data["counters30"]["mrs_created_last_30_days_yAxis"],
                )
            ]
            global_mrs_reviewed_last_30_days_xAxis = last_30_days_xAxis
            tmp_mrs_reviewed_last_30_days_xAxis = [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
            ]
            global_mrs_reviewed_last_30_days_yAxis = [
                a + b
                for a, b in zip(
                    tmp_mrs_reviewed_last_30_days_xAxis,
                    project_data["counters30"]["mrs_reviewed_last_30_days_yAxis"],
                )
            ]

            global_commits_added_lines_last_30_days_yAxis = [
                a + b
                for a, b in zip(
                    tmp_commits_added_lines_last_30_days_yAxis,
                    project_data["counters30"][
                        "commits_added_lines_last_30_days_yAxis"
                    ],
                )
            ]
            tmp_commits_added_lines_last_30_days_yAxis = (
                global_commits_added_lines_last_30_days_yAxis
            )

            global_commits_removed_lines_last_30_days_yAxis = [
                a + b
                for a, b in zip(
                    tmp_commits_removed_lines_last_30_days_yAxis,
                    project_data["counters30"][
                        "commits_removed_lines_last_30_days_yAxis"
                    ],
                )
            ]
            tmp_commits_removed_lines_last_30_days_yAxis = (
                global_commits_removed_lines_last_30_days_yAxis
            )

        global_counters7 = {
            "active_projects7": global_active_projects7,
            "active_projects7_list": active_projects7_list,
            "created_mrs_counter7": global_created_mrs_counter7,
            "reviewed_mrs_counter7": global_reviewed_mrs_counter7,
            "create_to_merge7": global_create_to_merge7 / global_active_projects7,
            "comments_in_created_mrs7": global_comments_in_created_mrs7,
            "created_commits7": global_created_commits7,
            "commits_frequency7": round(global_created_commits7 / 7, 1),
            "lines_added7": global_lines_added7,
            "lines_removed7": global_lines_removed7,
            "mrs_created_last_7_days_xAxis": global_mrs_created_last_7_days_xAxis,
            "mrs_created_last_7_days_yAxis": global_mrs_created_last_7_days_yAxis,
            "mrs_reviewed_last_7_days_xAxis": global_mrs_reviewed_last_7_days_xAxis,
            "mrs_reviewed_last_7_days_yAxis": global_mrs_reviewed_last_7_days_yAxis,
            "commits_added_lines_last_7_days_yAxis": global_commits_added_lines_last_7_days_yAxis,
            "commits_removed_lines_last_7_days_yAxis": global_commits_removed_lines_last_7_days_yAxis,
        }

        global_previous_counters7 = {
            "previous_active_projects7": global_previous_active_projects7,
            "previous_created_mrs_counter7": global_previous_created_mrs_counter7,
            "previous_reviewed_mrs_counter7": global_previous_reviewed_mrs_counter7,
            "previous_create_to_merge7": global_previous_create_to_merge7
            / global_previous_active_projects7,
            "previous_comments_in_created_mrs7": global_previous_comments_in_created_mrs7,
            "previous_created_commits7": global_previous_created_commits7,
            "previous_commits_frequency7": round(
                global_previous_created_commits7 / 7, 1
            ),
            "previous_lines_added7": global_previous_lines_added7,
            "previous_lines_removed7": global_previous_lines_removed7,
        }

        global_counters30 = {
            "active_projects30": global_active_projects30,
            "active_projects30_list": active_projects30_list,
            "created_mrs_counter30": global_created_mrs_counter30,
            "reviewed_mrs_counter30": global_reviewed_mrs_counter30,
            "create_to_merge30": global_create_to_merge30 / global_active_projects30,
            "comments_in_created_mrs30": global_comments_in_created_mrs30,
            "created_commits30": global_created_commits30,
            "commits_frequency30": round(global_created_commits30 / 30, 1),
            "lines_added30": global_lines_added30,
            "lines_removed30": global_lines_removed30,
            "mrs_created_last_30_days_xAxis": global_mrs_created_last_30_days_xAxis,
            "mrs_created_last_30_days_yAxis": global_mrs_created_last_30_days_yAxis,
            "mrs_reviewed_last_30_days_xAxis": global_mrs_reviewed_last_30_days_xAxis,
            "mrs_reviewed_last_30_days_yAxis": global_mrs_reviewed_last_30_days_yAxis,
            "commits_added_lines_last_30_days_yAxis": global_commits_added_lines_last_30_days_yAxis,
            "commits_removed_lines_last_30_days_yAxis": global_commits_removed_lines_last_30_days_yAxis,
        }

        global_previous_counters30 = {
            "previous_active_projects30": global_previous_active_projects30,
            "previous_created_mrs_counter30": global_previous_created_mrs_counter30,
            "previous_reviewed_mrs_counter30": global_previous_reviewed_mrs_counter30,
            "previous_create_to_merge30": global_previous_create_to_merge30
            / global_previous_active_projects30,
            "previous_comments_in_created_mrs30": global_previous_comments_in_created_mrs30,
            "previous_created_commits30": global_previous_created_commits30,
            "previous_commits_frequency30": round(
                global_previous_created_commits30 / 30, 1
            ),
            "previous_lines_added30": global_previous_lines_added30,
            "previous_lines_removed30": global_previous_lines_removed30,
        }

        # save serialized data to database
        serializer.save(
            teammember=teammember,
            body=body,
            counters7=global_counters7,
            counters30=global_counters30,
            previous7=global_previous_counters7,
            previous30=global_previous_counters30,
        )


class TeammemberCodingStatsUpdateAPIView(UpdateAPIView):
    queryset = TeammemberCodingStats.objects.all()
    serializer_class = TeammemberCodingStatsSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # Fetch teammember_id from the URL
        teammember_id = int(self.kwargs.get("teammember_id"))
        user = self.request.user

        # Ensure the user owns the related Teammember
        teammember = get_object_or_404(Teammember, id=teammember_id, created_by=user)

        # Fetch the coding stats for the Teammember
        return get_object_or_404(TeammemberCodingStats, teammember=teammember)

    def perform_update(self, serializer):
        user = self.request.user
        teammember_id = self.kwargs.get("teammember_id")
        teammemberCodingStats = self.get_object()
        updateBody = {}

        # Get the related teammember
        teammember = get_object_or_404(Teammember, id=teammember_id, created_by=user)

        # Verify Git integration data (optional logic)
        gitIntegrationData = TeamMemberGitIntegrationData.objects.filter(
            teammember=teammember
        ).first()

        if gitIntegrationData:
            git_integration_dict = model_to_dict(gitIntegrationData)
            integration_status = gitlab_verification_api_call(git_integration_dict)

            if integration_status is False:
                # integration got broken so change it's status in the teammember model
                teammember.teammember_hasGitIntegration = False
                teammember.save()

                return ValidationError(
                    {"detail": "Git integration verification failed."}
                )

        # get info about latest coding stats update
        teammemberCodingStats = TeammemberCodingStats.objects.get(
            teammember_id=teammember_id
        )

        data_limitation = teammemberCodingStats.latestUpdate
        data_limitation_iso_format = data_limitation.strftime("%Y-%m-%dT%H:%M:%SZ")

        apiCallsInput = {
            "groupID": gitIntegrationData.teammemberGitGroupID,
            "userID": gitIntegrationData.teammemberGitUserID,
            "accessToken": gitIntegrationData.teammemberGitPersonalAccessToken,
            "data_limitation": data_limitation_iso_format,
        }

        # Make created mrs api call with gitlab_merge_requests_api_call
        apiCallsInput["requestType"] = "author_id"
        created_mrs_data = gitlab_merge_requests_api_call(apiCallsInput)

        # Make reviewed mrs api call with gitlab_merge_requests_api_call
        apiCallsInput["requestType"] = "reviewer_id"
        reviewed_mrs_data = gitlab_merge_requests_api_call(apiCallsInput)
        del apiCallsInput["requestType"]

        # Extract MR IDs and prepare the list for mrs_list
        mrs_ids = set()  # Use a set to avoid duplicate IDs
        # Add created MRs IDs to the set
        for mr_id in created_mrs_data.keys():
            mrs_ids.add(mr_id)

        # Convert the set to a list and add to apiCallsInput
        apiCallsInput["mrs_list"] = list(mrs_ids)

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
        mrs_projects_data = gitlab_project_api_call(apiCallsInput)
        del apiCallsInput["mrs_list"]

        # Make commits created api call with gitlab_commits_created_api_call
        commits_created_data = gitlab_commits_created_api_call(apiCallsInput)
        del apiCallsInput["projects_list"]

        # Make commits difference api call with gitlab_commits_diff_api_call
        # apiCallsInput["commits_list"] = created_commits_data_dict
        apiCallsInput["commits_list"] = commits_created_data
        commits_diffs_data = gitlab_commits_diff_api_call(apiCallsInput)
        del apiCallsInput["commits_list"]

        # Fetch MRs comments api call with gitlab_commits_diff_api_call
        # Combine both dictionaries
        combined_mrs_data = created_mrs_data.copy()  # Start with created_mrs_data
        combined_mrs_data.update(reviewed_mrs_data)  # Merge in reviewed_mrs_data
        apiCallsInput["mrs_data"] = combined_mrs_data
        mrs_comments_data = gitlab_mrs_comments_api_call(apiCallsInput)

        # Structure the data in a reasonable way
        # Adding the project data to the body and initializing the groups of data to be provided later
        for project_id, project_data in mrs_projects_data.items():
            updateBody[project_id] = {
                "project_name": project_data["project_name"],
                "project_url": project_data["project_url"],
                "created_mrs_data": [],
                "reviewed_mrs_data": [],
                "created_commits_data": [],
            }

        # Before adding MRs data - merge the comments and the MRs info into one variable
        for mr_id, comment_data in mrs_comments_data.items():
            # Check if the MR ID exists in the created_mrs_data
            if mr_id in created_mrs_data:
                # Add the comment data to the respective MR in created_mrs_data
                created_mrs_data[mr_id]["comment_ids"] = comment_data["comment_ids"]
                created_mrs_data[mr_id]["comment_bodies"] = comment_data[
                    "comment_bodies"
                ]

        for mr_id, comment_data in mrs_comments_data.items():
            # Check if the MR ID exists in the reviewed_mrs_data
            if mr_id in reviewed_mrs_data and mr_id not in created_mrs_data:
                # Add the comment data to the respective MR in reviewed_mrs_data
                reviewed_mrs_data[mr_id]["comment_ids"] = comment_data["comment_ids"]
                reviewed_mrs_data[mr_id]["comment_bodies"] = comment_data[
                    "comment_bodies"
                ]

        for mr_id, mr_data in created_mrs_data.items():
            project_id = mr_data["project_id"]

            # check if there are comments for the mr
            if not mr_data.get("comment_ids"):
                mr_data["comment_ids"] = False
            if not mr_data.get("comment_bodies"):
                mr_data["comment_bodies"] = False

            # Check if the project_id exists in the body
            updateBody[project_id]["created_mrs_data"].append(
                {
                    "mr_id": mr_id,
                    "iid": mr_data["iid"],
                    "created_at": mr_data["created_at"],
                    "merged_at": mr_data["merged_at"],
                    "create_to_merge": mr_data["create_to_merge"],
                    "comment_ids": mr_data["comment_ids"],
                    "comment_bodies": mr_data["comment_bodies"],
                }
            )

        for mr_id, mr_data in reviewed_mrs_data.items():
            project_id = mr_data["project_id"]

            # Check if there are comments for the mr
            if not mr_data.get("comment_ids"):
                mr_data["comment_ids"] = False
            if not mr_data.get("comment_bodies"):
                mr_data["comment_bodies"] = False

            # Check if the project_id exists in the body
            updateBody[project_id]["reviewed_mrs_data"].append(
                {
                    "mr_id": mr_id,
                    "iid": mr_data["iid"],
                    "created_at": mr_data["created_at"],
                    "merged_at": mr_data["merged_at"],
                    "comment_ids": mr_data["comment_ids"],
                    "comment_bodies": mr_data["comment_bodies"],
                }
            )

        # Add the Commit data to the 'created_commits_data' list for that project and initialize diff data
        for project_id, commit_data_list in commits_created_data.items():
            # Ensure the project ID exists in the body
            if project_id not in updateBody:
                updateBody[project_id] = {"created_commits_data": []}

            for commit_data in commit_data_list:
                updateBody[project_id]["created_commits_data"].append(
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
                for commit in updateBody[project_id]["created_commits_data"]:
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

        # TODO FIX append the data to the database records
        # TODO check why there are duplicates in the
        for project_id, project_data in updateBody.items():
            # handle a case when new project was added
            if project_id not in teammemberCodingStats.body:
                teammemberCodingStats.body[project_id] = project_data
            else:
                teammemberCodingStats.body[project_id]["created_mrs_data"].union(
                    updateBody[project_id]["created_mrs_data"]
                )
                teammemberCodingStats.body[project_id]["reviewed_mrs_data"].union(
                    updateBody[project_id]["reviewed_mrs_data"]
                )
                teammemberCodingStats.body[project_id]["created_commits_data"].union(
                    updateBody[project_id]["created_commits_data"]
                )

        print(teammemberCodingStats.body)

        # TODO recalculate the counters in projects and globally
        # TODO save updated model


class TeammemberCodingStatsDeleteAPIView(DestroyAPIView):
    queryset = TeammemberCodingStats.objects.all()
    serializer_class = TeammemberCodingStatsSerializer

    def get_object(self):
        # Get the team member ID from the URL parameters
        teammember_id = self.kwargs.get("teammember_id")

        # Retrieve the CodingStats instance based on the teammember ID
        try:
            return TeammemberCodingStats.objects.get(teammember_id=teammember_id)
        except TeammemberCodingStats.DoesNotExist:
            # Handle the case where the team member coding stats do not exist
            raise NotFound(
                detail="Coding stats not found for the specified team member."
            )

    def destroy(self, request, *args, **kwargs):
        # Call the superclass retrieve method to get the object
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        self.perform_destroy(instance)
        return response.Response(status=status.HTTP_204_NO_CONTENT)
