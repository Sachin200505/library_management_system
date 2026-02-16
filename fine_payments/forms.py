from django import forms

from .models import FinePayment


class FinePaymentForm(forms.ModelForm):
    class Meta:
        model = FinePayment
        fields = ['amount', 'mode', 'reference']
