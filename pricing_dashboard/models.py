from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class PricingPlan(models.Model):
    """Different pricing plans available"""
    PLAN_TYPES = [
        ('free', 'Free'),
        ('basic', 'Basic'),
        ('pro', 'Professional'),
        ('enterprise', 'Enterprise'),
    ]

    BILLING_CYCLES = [
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
    ]

    name = models.CharField(max_length=100)  # e.g., "Lite Plan", "Pro Plan"
    plan_type = models.CharField(max_length=20, choices=PLAN_TYPES)
    billing_cycle = models.CharField(max_length=20, choices=BILLING_CYCLES, default='monthly')
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    credits_per_month = models.IntegerField(default=0)
    features = models.JSONField(default=list)  # List of features included
    is_popular = models.BooleanField(default=False)  # Highlight this plan
    is_active = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)  # For ordering plans
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['sort_order', 'price']

    def __str__(self):
        return f"{self.name} - {self.billing_cycle} (${self.price})"

class UserSubscription(models.Model):
    """User's subscription to pricing plans"""
    SUBSCRIPTION_STATUS = [
        ('active', 'Active'),
        ('cancelled', 'Cancelled'),
        ('expired', 'Expired'),
        ('pending', 'Pending'),
        ('past_due', 'Past Due'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pricing_subscriptions')
    plan = models.ForeignKey(PricingPlan, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=SUBSCRIPTION_STATUS, default='pending')
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    auto_renew = models.BooleanField(default=True)
    payment_method = models.CharField(max_length=50, blank=True)  # e.g., 'stripe', 'paypal'
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - {self.plan.name} ({self.status})"

class BillingHistory(models.Model):
    """Billing history for subscriptions"""
    PAYMENT_STATUS = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]

    subscription = models.ForeignKey(UserSubscription, on_delete=models.CASCADE, related_name='billing_history')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    payment_method = models.CharField(max_length=50, blank=True)
    description = models.CharField(max_length=255)
    billing_date = models.DateTimeField()
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.subscription.user.email} - ${self.amount} ({self.payment_status})"
