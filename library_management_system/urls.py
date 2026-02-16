from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
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
