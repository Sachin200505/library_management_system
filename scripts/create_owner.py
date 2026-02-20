import os
import sys
import django

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'library_management_system.settings')
django.setup()

from django.contrib.auth.models import User
from accounts.models import UserProfile

def create_owner():
    username = 'owner'
    email = 'owner@gmail.com'
    password = 'owner123'
    
    if User.objects.filter(username=username).exists():
        print(f"User '{username}' already exists.")
        user = User.objects.get(username=username)
    else:
        user = User.objects.create_user(username=username, email=email, password=password)
        print(f"User '{username}' created.")

    # Ensure profile exists and set role
    if not hasattr(user, 'profile'):
        UserProfile.objects.create(user=user, role=UserProfile.ROLE_OWNER)
    else:
        user.profile.role = UserProfile.ROLE_OWNER
        user.profile.save()
    
    print(f"Role set to OWNER for '{username}'. Credentials: {email} / {password}")

if __name__ == '__main__':
    create_owner()
