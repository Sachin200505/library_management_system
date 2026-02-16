from django.core.management.base import BaseCommand
from django.utils import timezone

from reservations.models import Reservation
from notifications.utils import notify_user


class Command(BaseCommand):
    help = 'Expire reservations past their expiry time'

    def handle(self, *args, **options):
        now = timezone.now()
        expired = Reservation.objects.filter(status__in=[Reservation.STATUS_QUEUED, Reservation.STATUS_APPROVED], expires_at__lt=now)
        count = 0
        for res in expired:
            res.status = Reservation.STATUS_EXPIRED
            res.save(update_fields=['status'])
            notify_user(res.user, f"Your reservation for '{res.book.title}' expired.", category='reservation')
            count += 1
        self.stdout.write(self.style.SUCCESS(f'Expired {count} reservations'))
