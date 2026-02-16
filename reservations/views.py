from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db import transaction
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone

from accounts.decorators import role_required
from accounts.models import UserProfile
from books.models import Book
from notifications.utils import notify_user

from .models import Reservation


def _resequence(book):
    queue = Reservation.objects.filter(book=book, status=Reservation.STATUS_QUEUED).order_by('created_at')
    for idx, res in enumerate(queue, start=1):
        if res.position != idx:
            res.position = idx
            res.save(update_fields=['position'])


@login_required
@role_required(UserProfile.ROLE_STUDENT)
def create_reservation(request, book_id):
    book = get_object_or_404(Book, pk=book_id)
    if book.is_available:
        messages.info(request, 'Book is available to issue, no reservation needed.')
        return redirect('books:list')

    existing_active = Reservation.objects.filter(book=book, user=request.user, status__in=[Reservation.STATUS_QUEUED, Reservation.STATUS_APPROVED]).exists()
    if existing_active:
        messages.warning(request, 'You already have a reservation for this book.')
        return redirect('reservations:my-reservations')

    with transaction.atomic():
        position = Reservation.objects.filter(book=book, status=Reservation.STATUS_QUEUED).count() + 1
        reservation = Reservation.objects.create(book=book, user=request.user, position=position)
        reservation.set_expiry()
        reservation.save(update_fields=['expires_at'])
    messages.success(request, 'Reservation placed. You will be notified when approved.')
    return redirect('reservations:my-reservations')


@login_required
@role_required(UserProfile.ROLE_STUDENT)
def my_reservations(request):
    reservations = Reservation.objects.filter(user=request.user).select_related('book').order_by('status', 'position')
    return render(request, 'reservations/my_list.html', {'reservations': reservations})


@login_required
@role_required(UserProfile.ROLE_STUDENT)
def cancel_reservation(request, pk):
    reservation = get_object_or_404(Reservation, pk=pk, user=request.user, status__in=[Reservation.STATUS_QUEUED, Reservation.STATUS_APPROVED])
    book = reservation.book
    reservation.status = Reservation.STATUS_CANCELLED
    reservation.save(update_fields=['status'])
    _resequence(book)
    messages.info(request, 'Reservation cancelled.')
    return redirect('reservations:my-reservations')


@login_required
@role_required(UserProfile.ROLE_ADMIN)
def admin_list(request):
    reservations = Reservation.objects.select_related('book', 'user').order_by('book__title', 'position')
    return render(request, 'reservations/admin_list.html', {'reservations': reservations})


@login_required
@role_required(UserProfile.ROLE_ADMIN)
def approve_reservation(request, pk):
    reservation = get_object_or_404(Reservation, pk=pk, status=Reservation.STATUS_QUEUED)
    reservation.status = Reservation.STATUS_APPROVED
    reservation.approved_at = timezone.now()
    reservation.set_expiry()
    reservation.save(update_fields=['status', 'approved_at', 'expires_at'])
    notify_user(reservation.user, f"Your reservation for '{reservation.book.title}' has been approved.", target_url='', category='reservation')
    messages.success(request, 'Reservation approved.')
    return redirect('reservations:admin-list')


@login_required
@role_required(UserProfile.ROLE_ADMIN)
def cancel_admin(request, pk):
    reservation = get_object_or_404(Reservation, pk=pk, status__in=[Reservation.STATUS_QUEUED, Reservation.STATUS_APPROVED])
    book = reservation.book
    reservation.status = Reservation.STATUS_CANCELLED
    reservation.save(update_fields=['status'])
    _resequence(book)
    messages.info(request, 'Reservation cancelled.')
    return redirect('reservations:admin-list')
