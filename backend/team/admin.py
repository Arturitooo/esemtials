from django.contrib import admin
from .models import Teammember, TeamMemberComment

# Register your models here.

admin.site.register(Teammember)
admin.site.register(TeamMemberComment)
