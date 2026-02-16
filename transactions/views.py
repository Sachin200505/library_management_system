from datetime import date, timedelta

from django.conf import settings
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db import models, transaction
from django.shortcuts import get_object_or_404, redirect, render

from accounts.decorators import role_required
from accounts.models import UserProfile
from books.models import Book
from notifications.utils import notify_user
from system_settings.utils import get_setting_value

from .forms import IssueRequestForm
from .models import BookIssue, Fine


@login_required
@role_required(UserProfile.ROLE_STUDENT)
def request_issue(request, book_id=None):
    if request.method == 'POST':
        form = IssueRequestForm(request.POST)
        if form.is_valid():
            book = form.cleaned_data['book']
            existing_open = BookIssue.objects.filter(user=request.user, book=book, status__in=[BookIssue.STATUS_REQUESTED, BookIssue.STATUS_ISSUED]).exists()
            if existing_open:
                messages.warning(request, 'You already have this book requested or issued.')
                return redirect('books:list')
            BookIssue.objects.create(user=request.user, book=book, status=BookIssue.STATUS_REQUESTED)
            messages.success(request, 'Issue request submitted.')
            return redirect('transactions:my-issues')
    else:
        initial_data = {}
        if book_id:
            initial_data['book'] = get_object_or_404(Book, pk=book_id)
        form = IssueRequestForm(initial=initial_data)
    return render(request, 'student/request_book.html', {'form': form})


@login_required
@role_required(UserProfile.ROLE_STUDENT)
def my_issues(request):
    issues = BookIssue.objects.filter(user=request.user).select_related('book').order_by('-created_at')
    return render(request, 'student/issued_books.html', {'issues': issues})


@login_required
@role_required(UserProfile.ROLE_ADMIN)
def issue_requests(request):
    requests_qs = BookIssue.objects.filter(status=BookIssue.STATUS_REQUESTED).select_related('book', 'user')
    return render(request, 'admin/issue_requests.html', {'requests': requests_qs})

@login_required
@role_required(UserProfile.ROLE_ADMIN)
def issued_books(request):
    issues = BookIssue.objects.filter(status=BookIssue.STATUS_ISSUED).select_related('book', 'user')
    return render(request, 'return_books.html', {'issues': issues})

@login_required
@role_required(UserProfile.ROLE_ADMIN)
@transaction.atomic
def approve_issue(request, pk):
    issue = get_object_or_404(BookIssue, pk=pk, status=BookIssue.STATUS_REQUESTED)
    book = issue.book
    if not book.is_available:
        messages.error(request, 'Book not available.')
        return redirect('transactions:issue-requests')

    issue.status = BookIssue.STATUS_ISSUED
    issue.issue_date = date.today()
    issue_days = int(get_setting_value('max_issue_days', default=settings.ISSUE_DURATION_DAYS))
    issue.due_date = date.today() + timedelta(days=issue_days)
    issue.save()

    book.available_count = max(book.available_count - 1, 0)
    book.save()

    messages.success(request, 'Issue approved.')
    notify_user(issue.user, f"Your request for '{book.title}' was approved.", category='issue')
    return redirect('transactions:issue-requests')


@login_required
@role_required(UserProfile.ROLE_ADMIN)
@transaction.atomic
def reject_issue(request, pk):
    issue = get_object_or_404(BookIssue, pk=pk, status=BookIssue.STATUS_REQUESTED)
    issue.status = BookIssue.STATUS_REJECTED
    issue.save()
    messages.info(request, 'Issue rejected.')
    notify_user(issue.user, f"Your request for '{issue.book.title}' was rejected.", category='issue')
    return redirect('transactions:issue-requests')


@login_required
@role_required(UserProfile.ROLE_ADMIN)
@transaction.atomic
def mark_returned(request, pk):
    issue = get_object_or_404(BookIssue, pk=pk, status=BookIssue.STATUS_ISSUED)
    issue.status = BookIssue.STATUS_RETURNED
    issue.return_date = date.today()
    issue.save()

    book = issue.book
    book.available_count = min(book.available_count + 1, book.quantity)
    book.save()

    fine_amount = issue.compute_fine()
    if fine_amount > 0:
        Fine.objects.update_or_create(issue=issue, defaults={'amount': fine_amount, 'paid': False})
    messages.success(request, 'Book marked as returned.')
    notify_user(issue.user, f"'{book.title}' was marked as returned.", category='issue')
    return redirect('transactions:issue-requests')


@login_required
@role_required(UserProfile.ROLE_STUDENT)
def fines_view(request):
    issues = BookIssue.objects.filter(user=request.user).select_related('book', 'fine').order_by('-created_at')
    return render(request, 'student/fines.html', {'issues': issues})


@login_required
@role_required(UserProfile.ROLE_ADMIN)
def reports_view(request):
    fines = Fine.objects.aggregate(total=models.Sum('amount'))['total'] or 0
    overdue = BookIssue.objects.filter(status=BookIssue.STATUS_ISSUED, due_date__lt=date.today()).count()
    issued = BookIssue.objects.filter(status=BookIssue.STATUS_ISSUED).count()
    students = UserProfile.objects.filter(role=UserProfile.ROLE_STUDENT).count()
    issued_list = BookIssue.objects.filter(status=BookIssue.STATUS_ISSUED).select_related('book', 'user').order_by('-issue_date')
    report = {'fines': fines, 'overdue': overdue, 'issued': issued, 'students': students}
    return render(request, 'admin/reports.html', {'report': report, 'issued': issued_list})
