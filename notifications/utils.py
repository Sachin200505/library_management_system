from datetime import datetime

from .models import Notification


def notify_user(user, message, target_url='', category='general'):
    Notification.objects.create(user=user, message=message, target_url=target_url, category=category)


def mark_notification_read(notification):
    if not notification.read_at:
        notification.read_at = datetime.now()
        notification.save(update_fields=['read_at'])
