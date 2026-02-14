from django import forms

from .models import BookIssue


class IssueRequestForm(forms.ModelForm):
    class Meta:
        model = BookIssue
        fields = ['book']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            field.widget.attrs.update({'class': 'form-select'})
