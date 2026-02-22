from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import BookIssue, Fine
from .serializers import BookIssueSerializer, FineSerializer
from system_settings.utils import get_setting_value

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

@method_decorator(csrf_exempt, name='dispatch')
class BookIssueViewSet(viewsets.ModelViewSet):
    queryset = BookIssue.objects.all()
    serializer_class = BookIssueSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_profile = self.request.user.profile
        if user_profile.is_admin or user_profile.is_owner:
            return BookIssue.objects.all()
        return BookIssue.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, status=BookIssue.STATUS_REQUESTED)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def approve(self, request, pk=None):
        user_profile = request.user.profile
        if not (user_profile.is_admin or user_profile.is_owner):
            return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            
        issue = self.get_object()
        if issue.status != BookIssue.STATUS_REQUESTED:
            return Response({'detail': 'Issue is not in requested state'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check availability
        if issue.book.available_count < 1:
            return Response({'detail': 'Book not available'}, status=status.HTTP_400_BAD_REQUEST)

        issue.status = BookIssue.STATUS_ISSUED
        issue.issue_date = timezone.now().date()
        # Calculate due date based on settings (simplified here)
        issue.due_date = issue.issue_date + timezone.timedelta(days=int(get_setting_value('return_period_days', default=14)))
        issue.save()
        
        # Decrement book count
        issue.book.available_count -= 1
        issue.book.save()
        
        return Response(self.get_serializer(issue).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reject(self, request, pk=None):
        user_profile = request.user.profile
        if not (user_profile.is_admin or user_profile.is_owner):
            return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        issue = self.get_object()
        if issue.status != BookIssue.STATUS_REQUESTED:
            return Response({'detail': 'Issue is not in requested state'}, status=status.HTTP_400_BAD_REQUEST)

        issue.status = BookIssue.STATUS_REJECTED
        issue.save()
        return Response(self.get_serializer(issue).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def return_book(self, request, pk=None):
        user_profile = request.user.profile
        if not (user_profile.is_admin or user_profile.is_owner):
            return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        issue = self.get_object()
        if issue.status != BookIssue.STATUS_ISSUED:
            return Response({'detail': 'Book is not issued'}, status=status.HTTP_400_BAD_REQUEST)

        issue.status = BookIssue.STATUS_RETURNED
        issue.return_date = timezone.now().date()
        issue.save()

        # Increment book count
        issue.book.available_count += 1
        issue.book.save()
        
        # Calculate fine
        fine_amount = issue.compute_fine()
        if fine_amount > 0:
            Fine.objects.create(issue=issue, amount=fine_amount)

        return Response(self.get_serializer(issue).data)

class FineViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Fine.objects.all()
    serializer_class = FineSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_profile = self.request.user.profile
        if user_profile.is_admin or user_profile.is_owner:
            return Fine.objects.all()
        return Fine.objects.filter(issue__user=self.request.user)
