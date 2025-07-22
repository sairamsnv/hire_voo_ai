from django.urls import path
from . import views

urlpatterns = [
    path('api/pricing/plans/', views.get_pricing_plans, name='get_pricing_plans'),
    path('api/pricing/subscription/', views.get_user_subscription, name='get_user_subscription'),
    path('api/pricing/billing-history/', views.get_billing_history, name='get_billing_history'),
    path('api/pricing/create-subscription/', views.create_subscription, name='create_subscription'),
    path('api/pricing/cancel-subscription/', views.cancel_subscription, name='cancel_subscription'),
] 