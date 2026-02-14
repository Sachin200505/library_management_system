from django import forms

from .models import Author, Book, Category


class AuthorForm(forms.ModelForm):
    class Meta:
        model = Author
        fields = ['name', 'bio']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            field.widget.attrs.update({'class': 'form-control'})


class CategoryForm(forms.ModelForm):
    class Meta:
        model = Category
        fields = ['name']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            field.widget.attrs.update({'class': 'form-control'})


class BookForm(forms.ModelForm):
    author_name = forms.CharField(label='Author', max_length=150)
    category = forms.ChoiceField(label='Category', required=False)
    new_category = forms.CharField(label='Or add new category', max_length=100, required=False)

    class Meta:
        model = Book
        fields = ['isbn', 'title', 'author_name', 'category', 'new_category', 'quantity', 'available_count', 'description', 'published_year']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        category_choices = [(str(cat.id), cat.name) for cat in Category.objects.all()]
        category_choices.append(('__other__', 'Other'))
        self.fields['category'].choices = category_choices
        for name, field in self.fields.items():
            css_class = 'form-control'
            if isinstance(field.widget, forms.Select):
                css_class = 'form-select'
            field.widget.attrs.update({'class': css_class})
        # Prepopulate author_name when editing
        if self.instance and self.instance.pk:
            self.fields['author_name'].initial = self.instance.author.name
            if self.instance.category:
                self.fields['category'].initial = str(self.instance.category.id)

    def clean(self):
        cleaned = super().clean()
        category_val = cleaned.get('category')
        new_category = cleaned.get('new_category')
        if (category_val == '__other__' and not new_category) or (not category_val and not new_category):
            raise forms.ValidationError('Select a category or add a new one.')

        if category_val and category_val != '__other__':
            try:
                self.cleaned_category_obj = Category.objects.get(id=category_val)
            except Category.DoesNotExist:
                raise forms.ValidationError('Selected category not found.')
        else:
            self.cleaned_category_obj = None

        # Replace raw choice value with actual object/None so ModelForm doesn't assign "__other__"
        cleaned['category'] = self.cleaned_category_obj
        return cleaned

    def save(self, commit=True):
        author_name = (self.cleaned_data.get('author_name') or '').strip()
        new_category_name = (self.cleaned_data.get('new_category') or '').strip()
        category_obj = self.cleaned_category_obj

        author_obj, _ = Author.objects.get_or_create(name=author_name)
        if new_category_name:
            category_obj, _ = Category.objects.get_or_create(name=new_category_name)

        book = super().save(commit=False)
        book.author = author_obj
        book.category = category_obj
        if book.available_count > book.quantity:
            book.available_count = book.quantity
        if commit:
            book.save()
        return book
