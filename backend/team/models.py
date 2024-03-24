from django.db import models
from users.models import CustomUser


TM_POSITION = [
    ("sm", "Scrum Master"),
    ("fe_dev", "Frontend Developer"),
    ("be_dev", "Backend Developer"),
    ("devops", "DevOps"),
    ("des", "Designer"),
    ("qa", "Quality Engineer"),
    ("ba", "Business Analyst"),
    ("sa", "Solution Architect"),
]

TM_SENIORITY = [
    ("intern", "Internship"),
    ("junior", "Junior level"),
    ("regular", "Mid-level"),
    ("senior", "Senior level"),
    ("expert", "Expert level"),
]

# Create your models here.


class Teammember(models.Model):
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE, default=None)
    tm_name = models.CharField(max_length=64, blank=False, null=False)
    tm_lname = models.CharField(max_length=128, blank=False, null=False)
    tm_seniority = models.CharField(
        max_length=64, choices=TM_SENIORITY, blank=True, null=True
    )
    tm_position = models.CharField(
        max_length=64, choices=TM_POSITION, blank=False, null=False
    )
    tm_joined = models.DateField(null=False)
    tm_summary = models.TextField(max_length=250, null=True, blank=True)
    tm_photo = models.ImageField(upload_to="profile_pictures/", null=True, blank=True)

    def __str__(self):
        return f"{self.tm_name} {self.tm_lname}"
