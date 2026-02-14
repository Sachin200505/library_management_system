from django.contrib import admin

from .models import BookIssue, Fine


@admin.register(BookIssue)
class BookIssueAdmin(admin.ModelAdmin):
    list_display = ('book', 'user', 'status', 'issue_date', 'due_date', 'return_date')
    list_filter = ('status', 'issue_date')
    search_fields = ('book__title', 'user__username')


@admin.register(Fine)
class FineAdmin(admin.ModelAdmin):
    list_display = ('issue', 'amount', 'paid', 'created_at')
    list_filter = ('paid',)
    search_fields = ('issue__book__title', 'issue__user__username')
