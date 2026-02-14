from django.urls import path

from . import views

app_name = 'books'

urlpatterns = [
    path('', views.book_list, name='list'),
    path('book/<int:pk>/', views.book_detail, name='detail'),
    path('admin/manage/', views.manage_books, name='manage-books'),
    path('admin/books/add/', views.create_book, name='create-book'),
    path('admin/books/<int:pk>/edit/', views.update_book, name='update-book'),
    path('admin/books/<int:pk>/delete/', views.delete_book, name='delete-book'),
    path('admin/authors/', views.manage_authors, name='manage-authors'),
    path('admin/categories/', views.manage_categories, name='manage-categories'),
]
