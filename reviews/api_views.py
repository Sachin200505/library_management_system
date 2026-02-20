from rest_framework import viewsets, permissions
from .models import Review
from .serializers import ReviewSerializer, ReviewAdminSerializer

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        user = self.request.user
        if user.is_authenticated and hasattr(user, 'profile'):
            if user.profile.is_admin or user.profile.is_owner:
                return ReviewAdminSerializer
        return ReviewSerializer

    def get_queryset(self):
        # Admins and Owners see all, Users see approved + their own pending/hidden
        user = self.request.user
        book_id = self.request.query_params.get('book')
        
        if user.is_authenticated and hasattr(user, 'profile'):
            user_profile = user.profile
            if user_profile.is_admin or user_profile.is_owner:
                queryset = Review.objects.all()
                if book_id:
                    queryset = queryset.filter(book_id=book_id)
                return queryset
        
        # For non-admins or unauthenticated
        queryset = Review.objects.filter(status=Review.STATUS_APPROVED)
        if user.is_authenticated:
            queryset = queryset | Review.objects.filter(user=user)
        
        if book_id:
            queryset = queryset.filter(book_id=book_id)
            
        return queryset.distinct()
