from functools import wraps

from django.contrib import messages
from django.shortcuts import redirect

from .models import UserProfile


def role_required(required_role):
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return redirect('accounts:login')
            
            # Owners can access anything
            if hasattr(request.user, 'profile') and request.user.profile.is_owner:
                return view_func(request, *args, **kwargs)
                
            if not hasattr(request.user, 'profile') or request.user.profile.role != required_role:
                messages.error(request, 'You do not have permission to access this page.')
                return redirect('accounts:dashboard')
            return view_func(request, *args, **kwargs)

        return _wrapped_view

    return decorator


def admin_required(view_func):
    """Shortcut decorator for admin-only views."""
    return role_required(UserProfile.ROLE_ADMIN)(view_func)


def student_required(view_func):
    """Shortcut decorator for student-only views."""
    return role_required(UserProfile.ROLE_STUDENT)(view_func)
