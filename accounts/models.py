from django.contrib.auth.models import User
from django.db import models


class UserProfile(models.Model):
    ROLE_ADMIN = 'ADMIN'
    ROLE_STUDENT = 'STUDENT'
    ROLE_OWNER = 'OWNER'

    ROLE_CHOICES = [
        (ROLE_ADMIN, 'Admin'),
        (ROLE_STUDENT, 'Student'),
        (ROLE_OWNER, 'Owner'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_STUDENT)
    roll_number = models.CharField(max_length=50, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.user.username} ({self.role})"

    @property
    def is_admin(self) -> bool:
        return self.role == self.ROLE_ADMIN

    @property
    def is_student(self) -> bool:
        return self.role == self.ROLE_STUDENT

    @property
    def is_owner(self) -> bool:
        return self.role == self.ROLE_OWNER
