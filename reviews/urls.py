from django.urls import path

from . import views

app_name = 'reviews'

urlpatterns = [
    path('book/<int:book_id>/submit/', views.submit_review, name='submit'),
    path('my/', views.my_reviews, name='my-reviews'),
    path('admin/', views.admin_list, name='admin-list'),
    path('admin/<int:pk>/<str:status>/', views.change_status, name='change-status'),
]
