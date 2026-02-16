from django.contrib import admin

from .models import Reservation


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ('book', 'user', 'status', 'position', 'expires_at', 'created_at')
    list_filter = ('status', 'expires_at', 'created_at')
    search_fields = ('book__title', 'user__username')
