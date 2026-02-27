from rest_framework import permissions

class IsAdminOrOwner(permissions.BasePermission):
    """
    Allow access if the user is authenticated and has either 'ADMIN' or 'OWNER' role.
    Also allows staff users.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Allow staff users as a fallback
        if request.user.is_staff:
            return True
            
        # Check profile exists and has appropriate role (case-insensitive)
        profile = getattr(request.user, 'profile', None)
        if not profile:
            return False
            
        role = str(profile.role).upper().strip()
        return role in ['ADMIN', 'OWNER']

class IsOwner(permissions.BasePermission):
    """
    Allow access only if the user is authenticated and has the 'OWNER' role.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        profile = getattr(request.user, 'profile', None)
        if not profile:
            return False
            
        return str(profile.role).upper().strip() == 'OWNER'
