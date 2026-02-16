from django.core.management.base import BaseCommand

from accounts.models import UserProfile
from accounts.signals import sync_user_role_group, ensure_default_groups


class Command(BaseCommand):
    help = "Ensure every user profile is aligned with its role-based Group membership."

    def handle(self, *args, **options):
        ensure_default_groups()
        synced = 0
        for profile in UserProfile.objects.select_related('user').all():
            sync_user_role_group(profile)
            synced += 1
        self.stdout.write(self.style.SUCCESS(f"Synced role groups for {synced} user(s)."))
