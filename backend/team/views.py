from rest_framework import viewsets, permissions, response, status
from rest_framework.views import APIView
from .models import Teammember
from .serializers import TeammemberSerializer


class TeammemberViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Teammember.objects.all()
    serializer_class = TeammemberSerializer

    def list(self, request):
        user = self.request.user
        queryset = Teammember.objects.all().filter(created_by=user).order_by("-id")
        serializer = self.serializer_class(queryset, many=True)
        return response.Response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(created_by=request.user)
        return response.Response(serializer.data, status=status.HTTP_201_CREATED)


class TeammemberImageView(APIView):
    permission_classes = [permissions.AllowAny]  # Adjust permissions as needed

    def get(self, request, pk):
        try:
            teammember = Teammember.objects.get(pk=pk)
            if teammember.tm_photo:
                with open(teammember.tm_photo.path, "rb") as f:
                    return response.Response(f.read(), content_type="image/png")
            else:
                return response.Response(status=status.HTTP_404_NOT_FOUND)
        except Teammember.DoesNotExist:
            return response.Response(status=status.HTTP_404_NOT_FOUND)
