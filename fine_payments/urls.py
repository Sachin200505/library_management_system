from django.urls import path

from . import views

app_name = 'fine_payments'

urlpatterns = [
    path('pay/<int:fine_id>/', views.pay_fine, name='pay'),
    path('my/', views.my_payments, name='my-payments'),
    path('admin/', views.admin_payments, name='admin-list'),
]
