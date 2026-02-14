from datetime import date

from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db.models import Sum
from django.shortcuts import redirect, render

from .decorators import role_required
from .forms import LoginForm, RegisterForm
from .models import UserProfile


def landing_view(request):
    if request.user.is_authenticated:
        return redirect('accounts:dashboard')
    return render(request, 'landing.html')


def register_view(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Account created. Please log in.')
            return redirect('accounts:login')
    else:
        form = RegisterForm()
    return render(request, 'auth/register.html', {'form': form})


def login_view(request):
    if request.user.is_authenticated:
        return redirect('accounts:dashboard')

    if request.method == 'POST':
        form = LoginForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            messages.success(request, f'Welcome back {user.username}!')
            return redirect('accounts:dashboard')
    else:
        form = LoginForm()
    return render(request, 'auth/login.html', {'form': form})


def logout_view(request):
    logout(request)
    messages.info(request, 'You have been logged out.')
    return redirect('accounts:login')


@login_required
def dashboard_view(request):
    if request.user.profile.role == UserProfile.ROLE_ADMIN:
        return redirect('accounts:admin-dashboard')
    return redirect('accounts:student-dashboard')


@login_required
@role_required(UserProfile.ROLE_ADMIN)
def admin_dashboard(request):
    from books.models import Book
    from transactions.models import BookIssue, Fine

    total_books = Book.objects.count()
    issued_books = BookIssue.objects.filter(status=BookIssue.STATUS_ISSUED).count()
    students = UserProfile.objects.filter(role=UserProfile.ROLE_STUDENT).count()
    overdue = BookIssue.objects.filter(status=BookIssue.STATUS_ISSUED, due_date__lt=date.today()).count()
    fines_collected = Fine.objects.aggregate(total=Sum('amount'))['total'] or 0

    stats = {
        'total_books': total_books,
        'issued_books': issued_books,
        'students': students,
        'overdue': overdue,
        'fines_collected': fines_collected,
    }
    recent_requests = BookIssue.objects.select_related('book', 'user').order_by('-created_at')[:5]
    return render(request, 'admin/dashboard.html', {'stats': stats, 'recent_requests': recent_requests})


@login_required
@role_required(UserProfile.ROLE_STUDENT)
def student_dashboard(request):
    from books.models import Book
    from transactions.models import BookIssue

    latest_books = Book.objects.select_related('author', 'category').order_by('-id')[:5]
    my_issues = BookIssue.objects.filter(user=request.user).select_related('book').order_by('-created_at')
    return render(request, 'student/dashboard.html', {'latest_books': latest_books, 'my_issues': my_issues})


@login_required
@role_required(UserProfile.ROLE_ADMIN)
def manage_students(request):
    students = UserProfile.objects.select_related('user').filter(role=UserProfile.ROLE_STUDENT).order_by('-created_at')
    return render(request, 'admin/manage_students.html', {'students': students})
