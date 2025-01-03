from __future__ import absolute_import, unicode_literals
from celery import shared_task
from datetime import datetime
import requests
from .models import Teammember


@shared_task
def update_teammember_coding_stats():
    token = "5746fb5063ffcfee9687cf776018eb4819684a06f5ad4bb1d1f604c26fe81fa9"

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Token {token}" if token else "",
    }
    # 1. Get all Teammember IDs with hasGitIntegration = True
    teammember_ids = Teammember.objects.filter(
        teammember_hasGitIntegration=True
    ).values_list("id", flat=True)

    # 2. Loop through the IDs and send the API request for each
    for teammember_id in teammember_ids:
        # 3. Create the request body
        now = (
            datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%fZ")[:-4] + "Z"
        )  # Format to match the given example
        request_body = {
            "latestUpdate": now,
            "body": {},
            "counters7": {},
            "counters30": {},
            "previous7": {},
            "previous30": {},
            "teammember": teammember_id,
        }

        # 4. Make the API call
        url = f"http://127.0.0.1:8000/team/teammember-coding-stats/{teammember_id}/update/"
        try:
            response = requests.put(url, json=request_body, headers=headers)
            response.raise_for_status()  # Raise an error if the response code is not 200
            print(f"git stats updated for the following teammember: {teammember_id}")
        except requests.RequestException as e:
            # Log or handle the error
            print(f"Error updating teammember {teammember_id}: {e}")

    return f"Processed {len(teammember_ids)} teammembers with Git integration."
