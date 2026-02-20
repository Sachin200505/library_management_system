from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import FinePayment
from .serializers import FinePaymentSerializer
from transactions.models import Fine

class FinePaymentViewSet(viewsets.ModelViewSet):
    serializer_class = FinePaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.profile.is_admin:
            return FinePayment.objects.all()
        return FinePayment.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        if not (request.user.profile.is_admin or request.user.profile.is_owner):
            return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            
        from django.db.models import Sum, Count
        from django.db.models.functions import TruncMonth, TruncDay
        from django.utils import timezone
        
        # 1. Overview
        total_collected = FinePayment.objects.filter(status=FinePayment.STATUS_PAID).aggregate(t=Sum('amount'))['t'] or 0
        total_pending = Fine.objects.filter(paid=False).aggregate(t=Sum('amount'))['t'] or 0
        
        # 2. Recent Transactions
        recent = FinePayment.objects.filter(status=FinePayment.STATUS_PAID).order_by('-created_at')[:10]
        recent_data = FinePaymentSerializer(recent, many=True).data
        
        # 3. Monthly Revenue (Last 6 months)
        six_months_ago = timezone.now() - timezone.timedelta(days=180)
        monthly = FinePayment.objects.filter(
            status=FinePayment.STATUS_PAID, 
            created_at__gte=six_months_ago
        ).annotate(
            period=TruncMonth('created_at')
        ).values('period').annotate(
            total=Sum('amount'), 
            count=Count('id')
        ).order_by('period')
        
        # Format monthly data
        monthly_data = []
        for m in monthly:
            monthly_data.append({
                'name': m['period'].strftime('%b %Y'),
                'revenue': m['total'],
                'count': m['count']
            })
            
        return Response({
            'total_collected': total_collected,
            'total_pending': total_pending,
            'recent_transactions': recent_data,
            'revenue_trends': monthly_data
        })
