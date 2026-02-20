from django.db import models
from django.contrib.auth.models import User

class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('LOGIN', 'User Login'),
        ('REGISTER', 'User Registration'),
        ('LOGOUT', 'User Logout'),
        ('DELETE_USER', 'Delete User'),
        ('UPDATE_USER', 'Update User'),
        ('CHANGE_PASSWORD', 'Change Password'),
        ('TOGGLE_ACTIVATION', 'Toggle User Activation'),
        ('OTHER', 'Other Action'),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='audit_logs')
    username = models.CharField(max_length=150, help_text="Snapshot of username in case user is deleted")
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    details = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.username} - {self.action} - {self.timestamp}"
