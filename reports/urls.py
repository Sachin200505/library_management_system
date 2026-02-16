from django.urls import path

from . import views

app_name = 'reports'

urlpatterns = [
    path('', views.reports_home, name='home'),
    path('issued/csv/', views.export_issued_csv, name='issued-csv'),
    path('issued/pdf/', views.export_issued_pdf, name='issued-pdf'),
    path('overdue/csv/', views.export_overdue_csv, name='overdue-csv'),
    path('fines/csv/', views.export_fines_csv, name='fines-csv'),
    path('suggestions/csv/', views.export_suggestions_csv, name='suggestions-csv'),
    path('suggestions/pdf/', views.export_suggestions_pdf, name='suggestions-pdf'),
]
