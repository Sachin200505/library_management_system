from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db import transaction
from django.shortcuts import get_object_or_404, redirect, render

from accounts.decorators import role_required
from accounts.models import UserProfile
from notifications.utils import notify_user
from transactions.models import Fine

from .forms import FinePaymentForm
from .models import FinePayment


@login_required
@role_required(UserProfile.ROLE_STUDENT)
@transaction.atomic
def pay_fine(request, fine_id):
    fine = get_object_or_404(Fine, pk=fine_id, issue__user=request.user, paid=False)
    if request.method == 'POST':
        form = FinePaymentForm(request.POST)
        if form.is_valid():
            payment = form.save(commit=False)
            payment.fine = fine
            payment.user = request.user
            payment.status = FinePayment.STATUS_PAID
            payment.save()
            fine.paid = True
            fine.save(update_fields=['paid'])
            notify_user(request.user, f"Fine payment of {payment.amount} recorded.", category='fine')
            messages.success(request, 'Payment recorded as paid (simulated).')
            return redirect('fine_payments:my-payments')
    else:
        form = FinePaymentForm(initial={'amount': fine.amount, 'mode': 'Simulated', 'reference': 'SIM-'})
    return render(request, 'fine_payments/pay.html', {'form': form, 'fine': fine})


@login_required
@role_required(UserProfile.ROLE_STUDENT)
def my_payments(request):
    payments = FinePayment.objects.filter(user=request.user).select_related('fine__issue__book')
    return render(request, 'fine_payments/my_payments.html', {'payments': payments})


@login_required
@role_required(UserProfile.ROLE_ADMIN)
def admin_payments(request):
    payments = FinePayment.objects.select_related('fine__issue__book', 'user')
    return render(request, 'fine_payments/admin_list.html', {'payments': payments})
