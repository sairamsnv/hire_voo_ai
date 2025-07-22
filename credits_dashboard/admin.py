from django.contrib import admin
from .models import UserCredits, CreditTransaction, CreditUsage

@admin.register(UserCredits)
class UserCreditsAdmin(admin.ModelAdmin):
    list_display = ['user', 'current_balance', 'total_earned', 'total_used', 'last_reset_date']
    list_filter = ['last_reset_date', 'created_at']
    search_fields = ['user__email', 'user__full_name']
    readonly_fields = ['total_earned', 'total_used', 'created_at', 'updated_at']

@admin.register(CreditTransaction)
class CreditTransactionAdmin(admin.ModelAdmin):
    list_display = ['user', 'transaction_type', 'amount', 'balance_after', 'created_at']
    list_filter = ['transaction_type', 'created_at']
    search_fields = ['user__email', 'description']
    readonly_fields = ['balance_after', 'created_at']
    ordering = ['-created_at']

@admin.register(CreditUsage)
class CreditUsageAdmin(admin.ModelAdmin):
    list_display = ['user', 'usage_type', 'credits_used', 'created_at']
    list_filter = ['usage_type', 'created_at']
    search_fields = ['user__email', 'description']
    readonly_fields = ['created_at']
    ordering = ['-created_at']
