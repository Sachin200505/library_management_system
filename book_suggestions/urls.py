from django.urls import path

from . import views

app_name = 'book_suggestions'

urlpatterns = [
    path('submit/', views.submit_suggestion, name='submit'),
    path('my/', views.my_suggestions, name='my-suggestions'),
    path('admin/', views.admin_list, name='admin-list'),
    path('admin/<int:pk>/update/', views.update_status, name='update-status'),
]
