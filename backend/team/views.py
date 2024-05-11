from rest_framework import viewsets, permissions
from rest_framework import status
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
        queryset = Teammember.objects.all().filter(created_by=user).order_by("-id")
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(created_by=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
