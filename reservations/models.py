from datetime import timedelta

from django.conf import settings
from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone

from books.models import Book
from system_settings.utils import get_setting_value


class Reservation(models.Model):
    STATUS_QUEUED = 'QUEUED'
    STATUS_APPROVED = 'APPROVED'
    STATUS_CANCELLED = 'CANCELLED'
    STATUS_EXPIRED = 'EXPIRED'

    STATUS_CHOICES = [
        (STATUS_QUEUED, 'Queued'),
        (STATUS_APPROVED, 'Approved'),
        (STATUS_CANCELLED, 'Cancelled'),
        (STATUS_EXPIRED, 'Expired'),
    ]

    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='reservations')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reservations')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_QUEUED)
    position = models.PositiveIntegerField(default=1)
    expires_at = models.DateTimeField(blank=True, null=True)
    approved_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['position', 'created_at']
        unique_together = ('book', 'user', 'status')

    def __str__(self) -> str:
        return f"Reservation {self.book.title} for {self.user.username}"

    def set_expiry(self):
        days = int(get_setting_value('reservation_expiry_days', default=3))
        self.expires_at = timezone.now() + timedelta(days=days)

    @property
    def is_active(self):
        return self.status in [self.STATUS_QUEUED, self.STATUS_APPROVED]
