from django.contrib import admin

from .models import BookSuggestion


@admin.register(BookSuggestion)
class BookSuggestionAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'category', 'status', 'created_by', 'created_at')
    list_filter = ('status', 'category', 'created_at')
    search_fields = ('title', 'author', 'created_by__username')
    readonly_fields = ('created_at', 'updated_at')
