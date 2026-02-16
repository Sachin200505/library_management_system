from django.contrib import admin

from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'message', 'category', 'created_at', 'read_at')
    list_filter = ('category', 'read_at', 'created_at')
    search_fields = ('user__username', 'message')
    readonly_fields = ('created_at',)
