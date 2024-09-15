from django.contrib import admin
from .models import (
    Teammember,
    TeamMemberComment,
    TeamMemberGitIntegrationData,
    TeammemberCodingStats,
)

# Register your models here.

admin.site.register(Teammember)
admin.site.register(TeamMemberComment)
admin.site.register(TeamMemberGitIntegrationData)
admin.site.register(TeammemberCodingStats)
