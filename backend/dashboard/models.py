from django.db import models
from users.models import CustomUser

# Create your models here.


class Note(models.Model):
    note_owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    note_name = models.CharField(max_length=32, blank=True, null=True)
    note_content = models.JSONField(blank=True, null=True)
    note_updated = models.DateTimeField(null=False)

    def __str__(self):
        return f"{self.note_owner} {self.note_name}"
