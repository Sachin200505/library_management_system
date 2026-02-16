from django.urls import path

from . import views

app_name = 'notifications'

urlpatterns = [
    path('', views.notification_list, name='list'),
    path('mark/<int:pk>/', views.mark_read, name='mark-read'),
    path('mark-all/', views.mark_all_read, name='mark-all'),
    path('unread-count/', views.unread_count, name='unread-count'),
]
