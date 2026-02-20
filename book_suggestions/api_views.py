from rest_framework import viewsets, permissions
from .models import BookSuggestion
from .serializers import BookSuggestionSerializer, BookSuggestionAdminSerializer

class BookSuggestionViewSet(viewsets.ModelViewSet):
    queryset = BookSuggestion.objects.all()
    serializer_class = BookSuggestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            user_profile = self.request.user.profile
            if user_profile.is_admin or user_profile.is_owner:
                return BookSuggestionAdminSerializer
        return BookSuggestionSerializer

    def get_queryset(self):
        user_profile = self.request.user.profile
        if user_profile.is_admin or user_profile.is_owner:
            return BookSuggestion.objects.all()
        return BookSuggestion.objects.filter(created_by=self.request.user)
