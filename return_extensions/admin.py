from django.contrib import admin

from .models import ReturnExtensionRequest


@admin.register(ReturnExtensionRequest)
class ReturnExtensionAdmin(admin.ModelAdmin):
    list_display = ('issue', 'user', 'days_requested', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('issue__book__title', 'user__username')
