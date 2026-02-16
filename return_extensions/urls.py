from django.urls import path

from . import views

app_name = 'return_extensions'

urlpatterns = [
    path('my/', views.my_extensions, name='my-extensions'),
    path('request/<int:issue_id>/', views.request_extension, name='request'),
    path('admin/', views.admin_list, name='admin-list'),
    path('admin/<int:pk>/approve/', views.approve_request, name='approve'),
    path('admin/<int:pk>/reject/', views.reject_request, name='reject'),
]
