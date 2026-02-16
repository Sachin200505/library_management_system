from django.contrib.auth.models import Group, User
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import UserProfile


ROLE_GROUP_MAP = {
    UserProfile.ROLE_ADMIN: 'Admin',
    UserProfile.ROLE_STUDENT: 'Student',
}


def ensure_default_groups():
    """Create the role groups if they do not exist."""
    for name in ROLE_GROUP_MAP.values():
        Group.objects.get_or_create(name=name)


def sync_user_role_group(profile: UserProfile):
    """Keep the user's group membership in sync with their profile role."""
    ensure_default_groups()
    desired_group_name = ROLE_GROUP_MAP.get(profile.role)
    if not desired_group_name:
        return

    desired_group = Group.objects.filter(name=desired_group_name).first()
    if not desired_group:
        return

    # Remove the opposite role group only (avoid disturbing other custom groups).
    for role, group_name in ROLE_GROUP_MAP.items():
        if role != profile.role:
            group = Group.objects.filter(name=group_name).first()
            if group:
                profile.user.groups.remove(group)

    profile.user.groups.add(desired_group)


@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()


@receiver(post_save, sender=UserProfile)
def assign_role_group(sender, instance, **kwargs):
    """Ensure every profile is aligned with its role group."""
    sync_user_role_group(instance)


# Ensure groups exist at startup.
ensure_default_groups()
