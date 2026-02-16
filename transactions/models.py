from datetime import date
from decimal import Decimal

from django.conf import settings
from django.contrib.auth.models import User
from django.db import models

from books.models import Book
from system_settings.utils import get_setting_value


class BookIssue(models.Model):
    STATUS_REQUESTED = 'REQUESTED'
    STATUS_ISSUED = 'ISSUED'
    STATUS_RETURNED = 'RETURNED'
    STATUS_REJECTED = 'REJECTED'

    STATUS_CHOICES = [
        (STATUS_REQUESTED, 'Requested'),
        (STATUS_ISSUED, 'Issued'),
        (STATUS_RETURNED, 'Returned'),
        (STATUS_REJECTED, 'Rejected'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='issues')
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='issues')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_REQUESTED)
    issue_date = models.DateField(blank=True, null=True)
    due_date = models.DateField(blank=True, null=True)
    return_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.book.title} - {self.user.username} ({self.status})"

    @property
    def is_overdue(self) -> bool:
        return self.status == self.STATUS_ISSUED and self.due_date and date.today() > self.due_date

    def compute_fine(self) -> Decimal:
        if not self.due_date:
            return Decimal('0')
        end_date = self.return_date or date.today()
        days_over = (end_date - self.due_date).days
        if days_over > 0:
            fine_per_day = Decimal(str(get_setting_value('fine_per_day', default=settings.FINE_PER_DAY)))
            return Decimal(days_over) * fine_per_day
        return Decimal('0')


class Fine(models.Model):
    issue = models.OneToOneField(BookIssue, on_delete=models.CASCADE, related_name='fine')
    amount = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"Fine {self.amount} for {self.issue}"
