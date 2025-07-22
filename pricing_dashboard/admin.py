from django.contrib import admin
from .models import PricingPlan, UserSubscription, BillingHistory

@admin.register(PricingPlan)
class PricingPlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'plan_type', 'billing_cycle', 'price', 'credits_per_month', 'is_popular', 'is_active', 'sort_order']
    list_filter = ['plan_type', 'billing_cycle', 'is_popular', 'is_active']
    search_fields = ['name', 'description']
    ordering = ['sort_order', 'price']

@admin.register(UserSubscription)
class UserSubscriptionAdmin(admin.ModelAdmin):
    list_display = ['user', 'plan', 'status', 'start_date', 'end_date', 'auto_renew', 'created_at']
    list_filter = ['status', 'auto_renew', 'start_date', 'end_date', 'plan__plan_type']
    search_fields = ['user__email', 'user__full_name', 'plan__name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'

@admin.register(BillingHistory)
class BillingHistoryAdmin(admin.ModelAdmin):
    list_display = ['subscription', 'amount', 'currency', 'payment_status', 'billing_date', 'paid_at']
    list_filter = ['payment_status', 'currency', 'billing_date']
    search_fields = ['subscription__user__email', 'description']
    readonly_fields = ['created_at']
    date_hierarchy = 'billing_date'
