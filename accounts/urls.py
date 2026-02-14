from django.urls import path

from . import views

app_name = 'accounts'

urlpatterns = [
    path('', views.landing_view, name='landing'),
    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('admin-dashboard/', views.admin_dashboard, name='admin-dashboard'),
    path('student-dashboard/', views.student_dashboard, name='student-dashboard'),
    path('admin/students/', views.manage_students, name='manage-students'),
]
