from django.urls import path

from . import views

app_name = 'transactions'

urlpatterns = [
    path('request/', views.request_issue, name='request-issue'),
    path('request/<int:book_id>/', views.request_issue, name='request-issue-book'),
    path('my-issues/', views.my_issues, name='my-issues'),
    path('fines/', views.fines_view, name='fines'),
    path('admin/requests/', views.issue_requests, name='issue-requests'),
    path('admin/issued/', views.issued_books, name='issued-books'),
    path('reports/', views.reports_view, name='reports'),
    path('admin/requests/<int:pk>/approve/', views.approve_issue, name='approve-issue'),
    path('admin/requests/<int:pk>/reject/', views.reject_issue, name='reject-issue'),
    path('admin/requests/<int:pk>/return/', views.mark_returned, name='return-issue'),
]
