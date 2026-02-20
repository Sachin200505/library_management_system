from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import timedelta
from accounts.models import UserProfile
from books.models import Book
from transactions.models import BookIssue, Fine
from .models import AuditLog
from .serializers import AuditLogSerializer
import datetime

# Helper function to log actions
def log_action(user, action, details, request=None):
    ip = None
    if request:
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
    
    # Handle AnonymousUser
    if not user.is_authenticated:
        username = 'Anonymous'
        user_obj = None
    else:
        username = user.username
        user_obj = user

    try:
        AuditLog.objects.create(
            user=user_obj,
            username=username,
            action=action,
            details=details,
            ip_address=ip
        )
    except Exception as e:
        print(f"Failed to log action: {e}")

class IsOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'profile') and request.user.profile.is_owner

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        # The permission class already ensures only owners can access this view
        return AuditLog.objects.all().order_by('-timestamp')

class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def system_activity(self, request):
        try:
            # Return last 7 days activity for the chart
            end_date = timezone.now()
            start_date = end_date - timedelta(days=6)
            
            data = []
            for i in range(7):
                date = start_date + timedelta(days=i)
                # Filter by date range for the day
                day_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
                day_end = date.replace(hour=23, minute=59, second=59, microsecond=999999)
                
                day_logs = AuditLog.objects.filter(timestamp__range=(day_start, day_end))
                logins = day_logs.filter(action='LOGIN').count()
                actions = day_logs.exclude(action='LOGIN').count()
                
                data.append({
                    'name': date.strftime('%a'), # Mon, Tue
                    'logins': logins,
                    'actions': actions
                })
                
            return Response(data)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        user = request.user
        data = {}

        if user.profile.role == UserProfile.ROLE_ADMIN or user.profile.role == UserProfile.ROLE_OWNER:
            # Admin Stats
            total_books = Book.objects.count()
            active_users = UserProfile.objects.filter(role=UserProfile.ROLE_STUDENT).count()
            issued_books = BookIssue.objects.filter(status='ISSUED').count()
            overdue_books = BookIssue.objects.filter(status='ISSUED', due_date__lt=timezone.now().date()).count()
            total_fines = Fine.objects.aggregate(total=Sum('amount'))['total'] or 0
            collected_fines = Fine.objects.filter(paid=True).aggregate(total=Sum('amount'))['total'] or 0
            
            # Recent Activity (Last 5 issues/returns)
            recent_activity = BookIssue.objects.order_by('-updated_at')[:5].values(
                'id', 'book__title', 'user__username', 'status', 'updated_at'
            )

            # Top Books (Most Issued)
            top_books = BookIssue.objects.values('book__title').annotate(count=Count('id')).order_by('-count')[:5]

            # Monthly Activity (Last 6 months)
            # SQLite doesn't support TruncMonth deeply, so we might need a simpler approach or raw SQL if strict
            # For now, let's try a simple aggregation or just simulated/basic grouping if TruncMonth fails
            # Using simple iteration for now to be safe with potential SQLite limitations in some environments
            # or try TruncMonth if we are sure. Let's use TruncMonth and generic view.
            from django.db.models.functions import TruncMonth
            monthly_activity = BookIssue.objects.annotate(month=TruncMonth('issue_date')).values('month').annotate(count=Count('id')).order_by('-month')[:6]

            # Category Distribution (For Dashboard Pie Chart)
            category_distribution = Book.objects.values('category__name').annotate(count=Count('id')).order_by('-count')

            # Issue Status Distribution (For Dashboard Donut Chart)
            status_distribution = BookIssue.objects.values('status').annotate(count=Count('id')).order_by('status')

            # User Role Distribution
            admin_count = UserProfile.objects.filter(role=UserProfile.ROLE_ADMIN).count()
            student_count = UserProfile.objects.filter(role=UserProfile.ROLE_STUDENT).count()
            owner_count = UserProfile.objects.filter(role=UserProfile.ROLE_OWNER).count()

            data = {
                'total_books': total_books,
                'active_users': active_users,
                'active_issues': issued_books,
                'overdue_count': overdue_books,
                'total_fines': total_fines,
                'collected_fines': collected_fines,
                'recent_activity': list(recent_activity),
                'top_books': list(top_books),
                'monthly': list(monthly_activity),
                'category_distribution': list(category_distribution),
                'status_distribution': list(status_distribution),
                'user_distribution': {
                    'admins': admin_count,
                    'students': student_count,
                    'owners': owner_count
                },
                'fines': total_fines  # Added for frontend compatibility
            }
        else:
            # Student Stats
            my_issues = BookIssue.objects.filter(user=user)
            issued_count = my_issues.filter(status='ISSUED').count()
            requested_count = my_issues.filter(status='REQUESTED').count()
            overdue_count = my_issues.filter(status='ISSUED', due_date__lt=timezone.now().date()).count()
            my_fines = Fine.objects.filter(issue__user=user, paid=False).aggregate(total=Sum('amount'))['total'] or 0
            
            # Recent Activity
            recent_activity = my_issues.order_by('-updated_at')[:5].values(
                'id', 'book__title', 'status', 'updated_at'
            )

            # Current Active Issues
            current_issues = my_issues.filter(status='ISSUED').values(
                'id', 'book__title', 'book__author__name', 'issue_date', 'due_date'
            )

            data = {
                'issued_books': issued_count,
                'pending_requests': requested_count,
                'overdue_count': overdue_count,
                'fines_due': my_fines,
                'recent_activity': list(recent_activity),
                'current_issues': list(current_issues)
            }

        return Response(data)
