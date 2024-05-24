from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver
from users.models import CustomUser

TM_POSITION = [
    ("sm", "Scrum Master"),
    ("fe_dev", "Frontend Developer"),
    ("be_dev", "Backend Developer"),
    ("fs_dev", "Fullstack Developer"),
    ("devops", "DevOps"),
    ("des", "Designer"),
    ("qa", "Quality Engineer"),
    ("ba", "Business Analyst"),
    ("sa", "Solution Architect"),
]

TM_SENIORITY = [
    ("intern", "Internship"),
    ("junior", "Junior"),
    ("regular", "Medium"),
    ("senior", "Senior"),
    ("expert", "Expert"),
]


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
    tm_stack = models.TextField(max_length=256, null=True, blank=True)
    tm_joined = models.DateField(null=True, blank=True)
    tm_summary = models.TextField(max_length=512, null=True, blank=True)
    tm_photo = models.ImageField(
        upload_to="teammembers_profile_pictures/", null=True, blank=True
    )

    def __str__(self):
        return f"{self.tm_name} {self.tm_lname}"


# Signal handler to delete the photo file
@receiver(post_delete, sender=Teammember)
def delete_photo_on_delete(sender, instance, **kwargs):
    if instance.tm_photo:
        instance.tm_photo.delete(False)


class TeamMemberComment(models.Model):
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE, default=None)
    teammember = models.ForeignKey(Teammember, on_delete=models.CASCADE, default=None)
    isPositive = models.BooleanField(null=False, blank=False)
    commentContent = models.TextField(max_length=1024, null=False, blank=False)
    updateDate = models.DateTimeField(null=False)
