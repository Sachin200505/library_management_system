from .models import Notification

__all__ = ["unread_count"]


def unread_count(request):
    """Expose unread notification counts for templates and navbar badges."""
    user = getattr(request, "user", None)

    if user and user.is_authenticated:
        count = Notification.objects.filter(user=user, read_at__isnull=True).count()
    else:
        count = 0

    return {
        "navbar_unread_notifications": count,
        "unread_notifications_count": count,
    }
