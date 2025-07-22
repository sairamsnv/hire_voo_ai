from django.urls import path
from . import views

urlpatterns = [
    path('api/credits/', views.get_user_credits, name='get_user_credits'),
    path('api/credits/usage/', views.get_credit_usage, name='get_credit_usage'),
    path('api/credits/add/', views.add_credits, name='add_credits'),
] 