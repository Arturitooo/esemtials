from __future__ import absolute_import, unicode_literals
import os
from celery import Celery

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

app = Celery("core")

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object("django.conf:settings", namespace="CELERY")

# Auto-discover tasks in registered Django apps.
app.autodiscover_tasks(["core", "team"])


# CELERY COMMANDS
# provide with non-expiring token
# celery -A core worker -l INFO --pool=solo
# celery -A core beat -l INFO --scheduler django_celery_beat.schedulers:DatabaseScheduler
# go to http://127.0.0.1:8000/schedule_update_teammember_coding_stats/
