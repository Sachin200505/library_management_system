from django.contrib.auth.models import User
from django.db import models


class Notification(models.Model):
    CATEGORY_CHOICES = [
        ('issue', 'Issue'),
        ('reservation', 'Reservation'),
        ('suggestion', 'Suggestion'),
        ('extension', 'Return Extension'),
        ('fine', 'Fine'),
        ('general', 'General'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    target_url = models.CharField(max_length=255, blank=True)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='general')
    read_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f"Notification for {self.user}"

    @property
    def is_read(self) -> bool:
        return self.read_at is not None
