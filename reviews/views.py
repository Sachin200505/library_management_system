from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.shortcuts import get_object_or_404, redirect, render

from accounts.decorators import role_required
from accounts.models import UserProfile
from books.models import Book
from notifications.utils import notify_user

from .forms import ReviewForm
from .models import Review


@login_required
@role_required(UserProfile.ROLE_STUDENT)
def submit_review(request, book_id):
    book = get_object_or_404(Book, pk=book_id)
    try:
        review = Review.objects.get(book=book, user=request.user)
    except Review.DoesNotExist:
        review = None

    if request.method == 'POST':
        form = ReviewForm(request.POST, instance=review)
        if form.is_valid():
            review_obj = form.save(commit=False)
            review_obj.book = book
            review_obj.user = request.user
            review_obj.status = Review.STATUS_PENDING
            try:
                review_obj.save()
                messages.success(request, 'Review submitted for moderation.')
            except IntegrityError:
                messages.error(request, 'You already reviewed this book.')
            return redirect('books:list')
    else:
        form = ReviewForm(instance=review)
    return render(request, 'reviews/submit.html', {'form': form, 'book': book})


@login_required
@role_required(UserProfile.ROLE_STUDENT)
def my_reviews(request):
    reviews = Review.objects.filter(user=request.user).select_related('book')
    return render(request, 'reviews/my_reviews.html', {'reviews': reviews})


@login_required
@role_required(UserProfile.ROLE_ADMIN)
def admin_list(request):
    reviews = Review.objects.select_related('book', 'user')
    return render(request, 'reviews/admin_list.html', {'reviews': reviews})


@login_required
@role_required(UserProfile.ROLE_ADMIN)
def change_status(request, pk, status):
    review = get_object_or_404(Review, pk=pk)
    if status in dict(Review.STATUS_CHOICES):
        review.status = status
        review.save(update_fields=['status'])
        notify_user(review.user, f"Your review for '{review.book.title}' was {status.lower()}.", category='general')
        messages.success(request, 'Status updated.')
    return redirect('reviews:admin-list')
