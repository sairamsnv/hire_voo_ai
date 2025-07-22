from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class UserCredits(models.Model):
    """User's credit balance and usage"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='credits')
    current_balance = models.IntegerField(default=0)
    total_earned = models.IntegerField(default=0)
    total_used = models.IntegerField(default=0)
    last_reset_date = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - {self.current_balance} credits"

class CreditTransaction(models.Model):
    """Track all credit transactions"""
    TRANSACTION_TYPES = [
        ('earned', 'Earned'),
        ('used', 'Used'),
        ('refunded', 'Refunded'),
        ('bonus', 'Bonus'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='credit_transactions')
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.IntegerField()  # Positive for earned, negative for used
    description = models.CharField(max_length=255)
    balance_after = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.transaction_type} {self.amount} credits"

class CreditUsage(models.Model):
    """Track credit usage by feature"""
    USAGE_TYPES = [
        ('job_scrape', 'Job Scraping'),
        ('profile_view', 'Profile View'),
        ('analytics', 'Analytics'),
        ('export', 'Data Export'),
        ('api_call', 'API Call'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='credit_usage')
    usage_type = models.CharField(max_length=20, choices=USAGE_TYPES)
    credits_used = models.IntegerField()
    description = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.usage_type} ({self.credits_used} credits)"
