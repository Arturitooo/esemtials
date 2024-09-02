from django.contrib import admin
from .models import Teammember, TeamMemberComment, TeamMemberGitData

# Register your models here.

admin.site.register(Teammember)
admin.site.register(TeamMemberComment)
admin.site.register(TeamMemberGitData)
