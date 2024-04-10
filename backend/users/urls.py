from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register("register", RegisterViewset, basename="register")
router.register("login", LoginViewset, basename="login")
router.register("userslist", UsersListViewset, basename="userslist")
urlpatterns = router.urls
