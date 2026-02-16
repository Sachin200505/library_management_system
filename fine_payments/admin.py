from django.contrib import admin

from .models import FinePayment


@admin.register(FinePayment)
class FinePaymentAdmin(admin.ModelAdmin):
    list_display = ('fine', 'user', 'amount', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__username', 'fine__issue__book__title', 'reference')
