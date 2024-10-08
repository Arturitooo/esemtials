from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register("register", RegisterViewset, basename="register")
router.register("login", LoginViewset, basename="login")
router.register("userslist", UsersListViewset, basename="userslist")
router.register("user-info", UserInfoView, basename="user-info")
urlpatterns = router.urls
