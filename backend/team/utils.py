import requests
from datetime import datetime


def gitlab_verification_api_call(data):
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
    except requests.exceptions.RequestException as error:
        # Handle any errors that occur during the request
        return error


def gitlab_merge_requests_api_call(data):
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
                    # Add create_to_merge if requesttype is author_id and merged_at is available
                    **(
                        {
                            "create_to_merge": round(
                                (
                                    datetime.fromisoformat(
                                        record["merged_at"].replace("Z", "+00:00")
                                    )
                                    - datetime.fromisoformat(
                                        record["created_at"].replace("Z", "+00:00")
                                    )
                                ).total_seconds(),
                                0,  # provide no numbers after comma
                            )
                        }
                        if requestType == "author_id" and record.get("merged_at")
                        else {}
                    ),
                }
                for record in data
            }
            return mr_data_dict
        else:
            return f"GitLab API call failed with status code: {response.status_code}, response: {response.text}"
    except requests.exceptions.RequestException as e:
        # Handle any errors that occur during the request
        return {"success": False, "message": str(e)}


def gitlab_project_api_call(data):
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


def gitlab_commits_created_api_call(data):
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


def gitlab_commits_diff_api_call(data):
    # To make the api call you need to provide projects_list
    # get needed data to the variables
    created_commits_data_dict = data
    accessToken = data.get("accessToken")

    commits_diff_data_dict = {}

    for project_id, commits_list in created_commits_data_dict["commits_list"].items():
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
                            elif line.startswith("-") and not line.startswith("---"):
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


def gitlab_mrs_comments_api_call(data):
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
                # Initialize lists to store comment IDs and bodies for this MR
                comment_ids = []
                comment_bodies = []
                # Get the needed data for each commit
                for record in data:
                    comment_ids.append(record["id"])
                    comment_bodies.append(record["body"])
                mrs_comments_data_dict[mr_id] = {
                    "comment_ids": comment_ids,
                    "comment_bodies": comment_bodies,
                }
            else:
                return f"GitLab API call failed with status code: {response.status_code}, response: {response.text}"
        except requests.exceptions.RequestException as e:
            # Handle any errors that occur during the rMRequest
            return {"success": False, "message": str(e)}
    return mrs_comments_data_dict
