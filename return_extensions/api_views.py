from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from .models import ReturnExtensionRequest
from .serializers import ReturnExtensionRequestSerializer
from transactions.models import BookIssue, Fine
from notifications.utils import notify_user

class ReturnExtensionViewSet(viewsets.ModelViewSet):
    serializer_class = ReturnExtensionRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_profile = self.request.user.profile
        if user_profile.is_admin or user_profile.is_owner:
            return ReturnExtensionRequest.objects.all()
        return ReturnExtensionRequest.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, status=ReturnExtensionRequest.STATUS_PENDING)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def approve(self, request, pk=None):
        user_profile = request.user.profile
        if not (user_profile.is_admin or user_profile.is_owner):
            return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        req = self.get_object()
        if req.status != ReturnExtensionRequest.STATUS_PENDING:
             return Response({'detail': 'Request not pending'}, status=status.HTTP_400_BAD_REQUEST)

        issue = req.issue
        issue.due_date = (issue.due_date or timezone.now().date()) + timedelta(days=req.days_requested)
        issue.save()
        
        req.status = ReturnExtensionRequest.STATUS_APPROVED
        req.processed_by = request.user
        req.processed_at = timezone.now()
        req.save()
        
        # Recompute fine
        fine_amount = issue.compute_fine()
        if fine_amount > 0:
            Fine.objects.update_or_create(issue=issue, defaults={'amount': fine_amount, 'paid': False})
        else:
             # Look for existing fine to clear/update? Logic might vary but let's stick to update_or_create
             pass

        notify_user(req.user, f"Your extension for '{issue.book.title}' was approved.", category='extension')
        return Response(self.get_serializer(req).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reject(self, request, pk=None):
        user_profile = request.user.profile
        if not (user_profile.is_admin or user_profile.is_owner):
            return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        req = self.get_object()
        if req.status != ReturnExtensionRequest.STATUS_PENDING:
             return Response({'detail': 'Request not pending'}, status=status.HTTP_400_BAD_REQUEST)
        
        req.status = ReturnExtensionRequest.STATUS_REJECTED
        req.processed_by = request.user
        req.processed_at = timezone.now()
        req.save()
        
        notify_user(req.user, f"Your extension for '{req.issue.book.title}' was rejected.", category='extension')
        return Response(self.get_serializer(req).data)
