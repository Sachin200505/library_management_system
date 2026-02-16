from datetime import date

from django.core.management.base import BaseCommand

from notifications.utils import notify_user
from transactions.models import BookIssue


class Command(BaseCommand):
    help = 'Send due/overdue warnings to users'

    def handle(self, *args, **options):
        due_today = BookIssue.objects.filter(status=BookIssue.STATUS_ISSUED, due_date=date.today())
        overdue = BookIssue.objects.filter(status=BookIssue.STATUS_ISSUED, due_date__lt=date.today())
        for issue in due_today:
            notify_user(issue.user, f"'{issue.book.title}' is due today.", category='issue')
        for issue in overdue:
            notify_user(issue.user, f"'{issue.book.title}' is overdue. Please return or request extension.", category='issue')
        self.stdout.write(self.style.SUCCESS(f'Warnings sent: {due_today.count()} due, {overdue.count()} overdue'))
