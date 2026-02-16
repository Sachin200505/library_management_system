from django.urls import path

from . import views

app_name = 'reservations'

urlpatterns = [
    path('book/<int:book_id>/', views.create_reservation, name='create'),
    path('my/', views.my_reservations, name='my-reservations'),
    path('cancel/<int:pk>/', views.cancel_reservation, name='cancel'),
    path('admin/', views.admin_list, name='admin-list'),
    path('admin/<int:pk>/approve/', views.approve_reservation, name='approve'),
    path('admin/<int:pk>/cancel/', views.cancel_admin, name='cancel-admin'),
]
