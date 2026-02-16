from django.contrib.auth.decorators import login_required
from django.shortcuts import render

from accounts.decorators import role_required
from accounts.models import UserProfile
from reservations.models import Reservation
from reviews.models import Review
from transactions.models import BookIssue, Fine


@login_required
@role_required(UserProfile.ROLE_STUDENT)
def dashboard(request):
    issues = BookIssue.objects.filter(user=request.user).select_related('book').order_by('-created_at')[:5]
    reservations = Reservation.objects.filter(user=request.user).select_related('book').order_by('-created_at')[:5]
    fines = Fine.objects.filter(issue__user=request.user).select_related('issue__book').order_by('-created_at')[:5]
    reviews = Review.objects.filter(user=request.user).select_related('book').order_by('-created_at')[:5]
    return render(
        request,
        'profile/dashboard.html',
        {
            'issues': issues,
            'reservations': reservations,
            'fines': fines,
            'reviews': reviews,
        },
    )
