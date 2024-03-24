from rest_framework import viewsets, permissions
from .models import Teammember
from rest_framework.response import Response
from .serializers import TeammemberSerializer


# Create your views here.


class TeammemberViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Teammember.objects.all()
    serializer_class = TeammemberSerializer

    def list(self, request):
        user = self.request.user
        queryset = Teammember.objects.all().filter(created_by=user)
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)
