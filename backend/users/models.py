from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
from django_rest_passwordreset.signals import reset_password_token_created
from django.dispatch import receiver
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
# Create your models here.


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is a required field")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractUser):
    SUBSCRIPTION_CHOICES = [
        ("basic", "Basic"),
    ]

    ROLE_CHOICES = [
        ("sm", "Scrum Master"),
        ("pm", "Project Manager"),
        ("po", "Product Owner"),
        ("dev", "Developer"),
        ("tl", "Team leader"),
        ("des", "Designer"),
        ("qa", "Quality Engineer"),
        ("head", "Head of Department"),
        ("ceo", "Chief executive officer"),
    ]

    username = models.CharField(max_length=64, unique=True, blank=False, null=False)
    email = models.EmailField(max_length=128, unique=True, null=False)
    subscription = models.CharField(
        max_length=32,
        choices=SUBSCRIPTION_CHOICES,
        default="basic",
        null=False,
        blank=False,
    )
    profile_photo = models.ImageField(
        upload_to="profile_photos/", null=True, blank=True
    )
    role = models.CharField(max_length=64, choices=ROLE_CHOICES, null=True, blank=True)

    objects = CustomUserManager()

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email"]


@receiver(reset_password_token_created)
def password_reset_token_created(reset_password_token, *args, **kwargs):
    sitelink = "http://localhost:5173/"
    token = "{}".format(reset_password_token.key)
    full_link = str(sitelink) + str("password-reset/") + str(token)
    print(token)
    print(full_link)

    context = {"full_link": full_link, "email_adress": reset_password_token.user.email}

    html_message = render_to_string("backend/resetpw_email.html", context=context)
    plain_message = strip_tags(html_message)

    msg = EmailMultiAlternatives(
        subject="Password reset request for {title}".format(
            title=reset_password_token.user.email
        ),
        body=plain_message,
        from_email="admin@esemtials.com",
        to=[reset_password_token.user.email],
    )

    msg.attach_alternative(html_message, "text/html")
    msg.send()
