from .models import Notification


def unread_count(request):
    """Expose unread notification counts for templates and navbar badges."""
    if request.user.is_authenticated:
        count = Notification.objects.filter(user=request.user, read_at__isnull=True).count()
        return {
            'navbar_unread_notifications': count,
            'unread_notifications_count': count,
        }

    return {
        'navbar_unread_notifications': 0,
        'unread_notifications_count': 0,
    }
