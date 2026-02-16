from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse_lazy

from accounts.decorators import role_required
from accounts.models import UserProfile
from notifications.utils import notify_user

from .forms import BookSuggestionAdminForm, BookSuggestionForm
from .models import BookSuggestion


@login_required
@role_required(UserProfile.ROLE_STUDENT)
def submit_suggestion(request):
    if request.method == 'POST':
        form = BookSuggestionForm(request.POST)
        if form.is_valid():
            suggestion = form.save(commit=False)
            suggestion.created_by = request.user
            suggestion.save()
            messages.success(request, 'Suggestion submitted successfully.')
            return redirect('book_suggestions:my-suggestions')
    else:
        form = BookSuggestionForm()
    return render(request, 'book_suggestions/submit.html', {'form': form})


@login_required
@role_required(UserProfile.ROLE_STUDENT)
def my_suggestions(request):
    suggestions = BookSuggestion.objects.filter(created_by=request.user)
    return render(request, 'book_suggestions/my_list.html', {'suggestions': suggestions})


@login_required
@role_required(UserProfile.ROLE_ADMIN)
def admin_list(request):
    suggestions = BookSuggestion.objects.select_related('created_by').all()
    return render(request, 'book_suggestions/admin_list.html', {'suggestions': suggestions})


@login_required
@role_required(UserProfile.ROLE_ADMIN)
def update_status(request, pk):
    suggestion = get_object_or_404(BookSuggestion, pk=pk)
    if request.method == 'POST':
        form = BookSuggestionAdminForm(request.POST, instance=suggestion)
        if form.is_valid():
            form.save()
            notify_user(
                user=suggestion.created_by,
                message=f"Your suggestion '{suggestion.title}' is now {suggestion.status.lower()}.",
                target_url=reverse_lazy('book_suggestions:my-suggestions'),
                category='suggestion',
            )
            messages.success(request, 'Status updated.')
            return redirect('book_suggestions:admin-list')
    else:
        form = BookSuggestionAdminForm(instance=suggestion)
    return render(request, 'book_suggestions/admin_detail.html', {'form': form, 'suggestion': suggestion})
