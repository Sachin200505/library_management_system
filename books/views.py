from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.shortcuts import get_object_or_404, redirect, render

from accounts.decorators import role_required
from accounts.models import UserProfile

from .forms import AuthorForm, BookForm, CategoryForm
from .models import Author, Book, Category


@login_required
def book_list(request):
    query = request.GET.get('q', '')
    category_id = request.GET.get('category')

    books = Book.objects.select_related('author', 'category').all()
    if query:
        books = books.filter(title__icontains=query) | books.filter(author__name__icontains=query)
    if category_id:
        books = books.filter(category_id=category_id)

    paginator = Paginator(books.order_by('title'), 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    categories = Category.objects.all()
    return render(request, 'student/browse_books.html', {'page_obj': page_obj, 'categories': categories, 'query': query, 'selected_category': category_id})


@login_required
@role_required(UserProfile.ROLE_ADMIN)
def manage_books(request):
    books = Book.objects.select_related('author', 'category').order_by('-created_at')
    return render(request, 'admin/manage_books.html', {'books': books})


@login_required
@role_required(UserProfile.ROLE_ADMIN)
def create_book(request):
    if request.method == 'POST':
        form = BookForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Book added successfully.')
            return redirect('books:manage-books')
    else:
        form = BookForm()
    return render(request, 'admin/add_book.html', {'form': form, 'title': 'Add Book'})


@login_required
@role_required(UserProfile.ROLE_ADMIN)
def update_book(request, pk):
    book = get_object_or_404(Book, pk=pk)
    if request.method == 'POST':
        form = BookForm(request.POST, instance=book)
        if form.is_valid():
            form.save()
            messages.success(request, 'Book updated successfully.')
            return redirect('books:manage-books')
    else:
        form = BookForm(instance=book)
    return render(request, 'admin/add_book.html', {'form': form, 'title': 'Edit Book'})


@login_required
@role_required(UserProfile.ROLE_ADMIN)
def delete_book(request, pk):
    book = get_object_or_404(Book, pk=pk)
    book.delete()
    messages.info(request, 'Book deleted.')
    return redirect('books:manage-books')


@login_required
@role_required(UserProfile.ROLE_ADMIN)
def manage_authors(request):
    authors = Author.objects.order_by('name')
    if request.method == 'POST':
        form = AuthorForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Author saved.')
            return redirect('books:manage-authors')
    else:
        form = AuthorForm()
    return render(request, 'author_form.html', {'form': form, 'authors': authors})


@login_required
@role_required(UserProfile.ROLE_ADMIN)
def manage_categories(request):
    if not Category.objects.exists():
        Category.objects.bulk_create([
            Category(name='Fiction'),
            Category(name='Non-Fiction'),
            Category(name='Science'),
            Category(name='Technology'),
            Category(name='Arts'),
            Category(name='History'),
        ])
    categories = Category.objects.order_by('name')
    if request.method == 'POST':
        form = CategoryForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Category saved.')
            return redirect('books:manage-categories')
    else:
        form = CategoryForm()
    return render(request, 'category_form.html', {'form': form, 'categories': categories})


@login_required
def book_detail(request, pk):
    book = get_object_or_404(Book.objects.select_related('author', 'category'), pk=pk)
    return render(request, 'student/book_detail.html', {'book': book})
