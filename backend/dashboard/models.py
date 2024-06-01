from django.db import models
from users.models import CustomUser
from django.utils import timezone

# Create your models here.


class Project(models.Model):
    project_owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    project_name = models.CharField(max_length=32, blank=False, null=False)
    project_description = models.TextField(max_length=512, blank=True, null=True)
    project_created = models.DateTimeField(default=timezone.now)
    project_updated = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.project_owner} {self.project_name}"


class Note(models.Model):
    note_owner = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, blank=False, null=False
    )
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, blank=False, null=False
    )
    note_name = models.CharField(max_length=32, blank=True, null=True)
    note_content = models.JSONField(blank=True, null=True)
    note_updated = models.DateTimeField(null=False)

    def __str__(self):
        return f"{self.note_owner} {self.note_name}"
