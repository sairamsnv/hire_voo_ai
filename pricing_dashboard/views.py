from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db.models import Q
from .models import PricingPlan, UserSubscription, BillingHistory

# Create your views here.

@api_view(['GET'])
@permission_classes([AllowAny])
def get_pricing_plans(request):
    """Get all available pricing plans"""
    try:
        billing_cycle = request.GET.get('billing_cycle', 'monthly')
        plans = PricingPlan.objects.filter(
            is_active=True,
            billing_cycle=billing_cycle
        ).order_by('sort_order', 'price')
        
        plan_data = []
        for plan in plans:
            plan_data.append({
                'id': plan.id,
                'name': plan.name,
                'plan_type': plan.plan_type,
                'billing_cycle': plan.billing_cycle,
                'description': plan.description,
                'price': float(plan.price),
                'credits_per_month': plan.credits_per_month,
                'features': plan.features,
                'is_popular': plan.is_popular,
                'sort_order': plan.sort_order
            })
        
        return Response({'plans': plan_data})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_subscription(request):
    """Get user's current subscription"""
    try:
        subscription = UserSubscription.objects.filter(
            user=request.user,
            status__in=['active', 'past_due']
        ).first()
        
        if subscription:
            return Response({
                'subscription': {
                    'id': subscription.id,
                    'plan': {
                        'id': subscription.plan.id,
                        'name': subscription.plan.name,
                        'plan_type': subscription.plan.plan_type,
                        'billing_cycle': subscription.plan.billing_cycle,
                        'price': float(subscription.plan.price),
                        'credits_per_month': subscription.plan.credits_per_month,
                        'features': subscription.plan.features
                    },
                    'status': subscription.status,
                    'start_date': subscription.start_date.isoformat(),
                    'end_date': subscription.end_date.isoformat(),
                    'auto_renew': subscription.auto_renew
                }
            })
        else:
            return Response({'subscription': None})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_billing_history(request):
    """Get user's billing history"""
    try:
        subscriptions = UserSubscription.objects.filter(user=request.user)
        billing_records = BillingHistory.objects.filter(
            subscription__in=subscriptions
        ).order_by('-billing_date')
        
        history_data = []
        for record in billing_records:
            history_data.append({
                'id': record.id,
                'amount': float(record.amount),
                'currency': record.currency,
                'payment_status': record.payment_status,
                'description': record.description,
                'billing_date': record.billing_date.isoformat(),
                'paid_at': record.paid_at.isoformat() if record.paid_at else None
            })
        
        return Response({'billing_history': history_data})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_subscription(request):
    """Create a new subscription"""
    try:
        plan_id = request.data.get('plan_id')
        payment_method = request.data.get('payment_method', 'stripe')
        
        if not plan_id:
            return Response(
                {'error': 'Plan ID is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            plan = PricingPlan.objects.get(id=plan_id, is_active=True)
        except PricingPlan.DoesNotExist:
            return Response(
                {'error': 'Invalid plan'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculate subscription dates
        start_date = timezone.now()
        if plan.billing_cycle == 'monthly':
            end_date = start_date + timezone.timedelta(days=30)
        elif plan.billing_cycle == 'yearly':
            end_date = start_date + timezone.timedelta(days=365)
        else:
            end_date = start_date + timezone.timedelta(days=30)
        
        # Create subscription
        subscription = UserSubscription.objects.create(
            user=request.user,
            plan=plan,
            status='pending',
            start_date=start_date,
            end_date=end_date,
            payment_method=payment_method
        )
        
        # Create billing record
        billing_record = BillingHistory.objects.create(
            subscription=subscription,
            amount=plan.price,
            currency='USD',
            payment_status='pending',
            payment_method=payment_method,
            description=f"Subscription to {plan.name}",
            billing_date=start_date
        )
        
        return Response({
            'subscription_id': subscription.id,
            'billing_id': billing_record.id,
            'amount': float(plan.price),
            'status': subscription.status
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_subscription(request):
    """Cancel user's subscription"""
    try:
        subscription_id = request.data.get('subscription_id')
        
        if not subscription_id:
            return Response(
                {'error': 'Subscription ID is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            subscription = UserSubscription.objects.get(
                id=subscription_id,
                user=request.user
            )
        except UserSubscription.DoesNotExist:
            return Response(
                {'error': 'Subscription not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        subscription.status = 'cancelled'
        subscription.auto_renew = False
        subscription.save()
        
        return Response({'message': 'Subscription cancelled successfully'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
