from __future__ import absolute_import, unicode_literals
import os
from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

app = Celery("core")

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object("django.conf:settings", namespace="CELERY")

# Auto-discover tasks in registered Django apps.
app.autodiscover_tasks(["core", "team"])

# Celery Beat configuration to run task every day at 8 AM
app.conf.beat_schedule = {
    "update-teammember-coding-stats-every-day-at-8am": {
        "task": "team.tasks.update_teammember_coding_stats",
        "schedule": crontab(minute=0, hour=8),  # Run every day at 8 AM
    },
}

# Celery Beat scheduler needs to be loaded
app.conf.timezone = "UTC"  # Ensure using UTC, adjust this if you need another timezone


# CELERY COMMANDS
# provide with non-expiring token
# celery -A core worker -l INFO --pool=solo
# celery -A core beat -l INFO --scheduler django_celery_beat.schedulers:DatabaseScheduler
# go to http://127.0.0.1:8000/schedule_update_teammember_coding_stats/
