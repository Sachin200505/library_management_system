from datetime import timedelta

from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db import transaction
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone

from accounts.decorators import role_required
from accounts.models import UserProfile
from notifications.utils import notify_user
from transactions.models import BookIssue, Fine

from .forms import ReturnExtensionForm
from .models import ReturnExtensionRequest


@login_required
@role_required(UserProfile.ROLE_STUDENT)
def my_extensions(request):
    issues = BookIssue.objects.filter(user=request.user, status=BookIssue.STATUS_ISSUED).select_related('book')
    requests_qs = ReturnExtensionRequest.objects.filter(user=request.user).select_related('issue__book')
    return render(request, 'return_extensions/my_list.html', {'issues': issues, 'requests': requests_qs})


@login_required
@role_required(UserProfile.ROLE_STUDENT)
@transaction.atomic
def request_extension(request, issue_id):
    issue = get_object_or_404(BookIssue, pk=issue_id, user=request.user, status=BookIssue.STATUS_ISSUED)
    if request.method == 'POST':
        form = ReturnExtensionForm(request.POST)
        if form.is_valid():
            req = form.save(commit=False)
            req.issue = issue
            req.user = request.user
            req.save()
            messages.success(request, 'Extension request submitted.')
            return redirect('return_extensions:my-extensions')
    else:
        form = ReturnExtensionForm()
    return render(request, 'return_extensions/request.html', {'form': form, 'issue': issue})


@login_required
@role_required(UserProfile.ROLE_ADMIN)
def admin_list(request):
    reqs = ReturnExtensionRequest.objects.select_related('issue__book', 'user')
    return render(request, 'return_extensions/admin_list.html', {'requests': reqs})


@login_required
@role_required(UserProfile.ROLE_ADMIN)
@transaction.atomic
def approve_request(request, pk):
    req = get_object_or_404(ReturnExtensionRequest, pk=pk, status=ReturnExtensionRequest.STATUS_PENDING)
    issue = req.issue
    issue.due_date = (issue.due_date or timezone.now().date()) + timedelta(days=req.days_requested)
    issue.save(update_fields=['due_date'])
    req.status = ReturnExtensionRequest.STATUS_APPROVED
    req.processed_by = request.user
    req.processed_at = timezone.now()
    req.save(update_fields=['status', 'processed_by', 'processed_at'])
    # recompute fine if exists
    fine_amount = issue.compute_fine()
    if fine_amount > 0:
        Fine.objects.update_or_create(issue=issue, defaults={'amount': fine_amount, 'paid': False})
    notify_user(req.user, f"Your extension for '{issue.book.title}' was approved.", category='extension')
    messages.success(request, 'Extension approved.')
    return redirect('return_extensions:admin-list')


@login_required
@role_required(UserProfile.ROLE_ADMIN)
@transaction.atomic
def reject_request(request, pk):
    req = get_object_or_404(ReturnExtensionRequest, pk=pk, status=ReturnExtensionRequest.STATUS_PENDING)
    req.status = ReturnExtensionRequest.STATUS_REJECTED
    req.processed_by = request.user
    req.processed_at = timezone.now()
    req.save(update_fields=['status', 'processed_by', 'processed_at'])
    notify_user(req.user, f"Your extension for '{req.issue.book.title}' was rejected.", category='extension')
    messages.info(request, 'Extension rejected.')
    return redirect('return_extensions:admin-list')
