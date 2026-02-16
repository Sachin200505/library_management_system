from django import forms

from .models import ReturnExtensionRequest


class ReturnExtensionForm(forms.ModelForm):
    class Meta:
        model = ReturnExtensionRequest
        fields = ['days_requested', 'reason']
        widgets = {
            'reason': forms.Textarea(attrs={'rows': 3}),
        }
