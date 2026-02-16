from django.contrib.auth.decorators import login_required
from django.db.models import Count, Sum
from django.shortcuts import render

from accounts.decorators import role_required
from accounts.models import UserProfile
from books.models import Book
from transactions.models import BookIssue, Fine


@login_required
@role_required(UserProfile.ROLE_ADMIN)
def dashboard(request):
    top_books = (
        BookIssue.objects.filter(status=BookIssue.STATUS_ISSUED)
        .values('book__title')
        .annotate(count=Count('id'))
        .order_by('-count')[:5]
    )
    monthly = (
        BookIssue.objects.extra(select={'month': "date_trunc('month', created_at)"})
        .values('month')
        .annotate(count=Count('id'))
        .order_by('month')
    )
    active_users = UserProfile.objects.filter(role=UserProfile.ROLE_STUDENT).count()
    fines = Fine.objects.aggregate(total=Sum('amount'))['total'] or 0

    return render(
        request,
        'analytics/dashboard.html',
        {
            'top_books': list(top_books),
            'monthly': list(monthly),
            'active_users': active_users,
            'fines': fines,
        },
    )
