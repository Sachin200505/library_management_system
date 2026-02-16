from django.contrib.auth.models import User
from django.db import models

from transactions.models import Fine


class FinePayment(models.Model):
    STATUS_PENDING = 'PENDING'
    STATUS_PAID = 'PAID'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_PAID, 'Paid'),
    ]

    fine = models.ForeignKey(Fine, on_delete=models.CASCADE, related_name='payments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='fine_payments')
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    mode = models.CharField(max_length=50, default='Simulated')
    reference = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f"Payment {self.amount} for fine {self.fine_id}"
