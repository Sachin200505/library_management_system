from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from accounts.api_views import AuthViewSet, UserProfileViewSet
from books.api_views import BookViewSet, AuthorViewSet, CategoryViewSet
from transactions.api_views import BookIssueViewSet, FineViewSet
from book_suggestions.api_views import BookSuggestionViewSet
from reservations.api_views import ReservationViewSet
from reviews.api_views import ReviewViewSet
from notifications.api_views import NotificationViewSet
from return_extensions.api_views import ReturnExtensionViewSet
from fine_payments.api_views import FinePaymentViewSet
from system_settings.api_views import SettingViewSet
from analytics.api_views import DashboardViewSet, AuditLogViewSet
from reports import views as report_views

router = DefaultRouter()
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'users', UserProfileViewSet, basename='users')
router.register(r'authors', AuthorViewSet, basename='authors')
router.register(r'categories', CategoryViewSet, basename='categories')
router.register(r'books', BookViewSet, basename='books')
router.register(r'issues', BookIssueViewSet, basename='issues')
router.register(r'fines', FineViewSet, basename='fines')
router.register(r'suggestions', BookSuggestionViewSet, basename='suggestions')
router.register(r'reservations', ReservationViewSet, basename='reservations')
router.register(r'reviews', ReviewViewSet, basename='reviews')
router.register(r'notifications', NotificationViewSet, basename='notifications')
router.register(r'return_extensions', ReturnExtensionViewSet, basename='return_extensions')
router.register(r'fine_payments', FinePaymentViewSet, basename='fine_payments')
router.register(r'settings', SettingViewSet, basename='settings')
router.register(r'analytics/dashboard', DashboardViewSet, basename='analytics-dashboard')
router.register(r'analytics/audit_logs', AuditLogViewSet, basename='analytics-audit-logs')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    # path('api/analytics/dashboard/', ... removed as it is now in router
    path('api/reports/issued/pdf/', report_views.export_issued_pdf, name='report-issued-pdf'),
    path('api/reports/issued/csv/', report_views.export_issued_csv, name='report-issued-csv'),
    path('api/reports/overdue/csv/', report_views.export_overdue_csv, name='report-overdue-csv'),
    path('api/reports/fines/csv/', report_views.export_fines_csv, name='report-fines-csv'),
    path('api/reports/suggestions/csv/', report_views.export_suggestions_csv, name='report-suggestions-csv'),
    path('api/reports/suggestions/pdf/', report_views.export_suggestions_pdf, name='report-suggestions-pdf'),
    
    # Legacy URLs (to be removed later)
    path('', include('accounts.urls', namespace='accounts')),
    path('books/', include('books.urls', namespace='books')),
    path('transactions/', include('transactions.urls', namespace='transactions')),
    path('suggestions/', include('book_suggestions.urls', namespace='book_suggestions')),
    path('notifications/', include('notifications.urls', namespace='notifications')),
    path('reservations/', include('reservations.urls', namespace='reservations')),
    path('reviews/', include('reviews.urls', namespace='reviews')),
    path('analytics/', include('analytics.urls', namespace='analytics')),
    path('reports/', include('reports.urls', namespace='reports')),
    path('profile/', include('profile.urls', namespace='profile')),
    path('settings/', include('system_settings.urls', namespace='system_settings')),
    path('return-extensions/', include('return_extensions.urls', namespace='return_extensions')),
    path('fine-payments/', include('fine_payments.urls', namespace='fine_payments')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
