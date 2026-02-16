from django import forms

from .models import BookSuggestion


class BookSuggestionForm(forms.ModelForm):
    class Meta:
        model = BookSuggestion
        fields = ['title', 'author', 'category', 'reason']
        widgets = {
            'reason': forms.Textarea(attrs={'rows': 3}),
        }


class BookSuggestionAdminForm(forms.ModelForm):
    class Meta:
        model = BookSuggestion
        fields = ['status', 'admin_note']
        widgets = {
            'admin_note': forms.Textarea(attrs={'rows': 3}),
        }
