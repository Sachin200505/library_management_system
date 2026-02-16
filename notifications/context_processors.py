from .models import Notification


def unread_count(request):
    if request.user.is_authenticated:
        return {'navbar_unread_notifications': Notification.objects.filter(user=request.user, read_at__isnull=True).count()}
    return {'navbar_unread_notifications': 0}def unread_count(request):
    if request.user.is_authenticated:
        return {'unread_notifications_count': request.user.notifications.filter(read_at__isnull=True).count()}
    return {'unread_notifications_count': 0}
