from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum
from django.utils import timezone
from datetime import timedelta
from .models import UserCredits, CreditTransaction, CreditUsage

# Create your views here.

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_credits(request):
    """Get user's current credit balance and usage"""
    try:
        credits, created = UserCredits.objects.get_or_create(user=request.user)
        
        # Get monthly usage
        month_start = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        monthly_usage = CreditUsage.objects.filter(
            user=request.user,
            created_at__gte=month_start
        ).aggregate(total=Sum('credits_used'))['total'] or 0
        
        # Get recent transactions
        recent_transactions = CreditTransaction.objects.filter(
            user=request.user
        ).order_by('-created_at')[:10]
        
        transaction_data = []
        for transaction in recent_transactions:
            transaction_data.append({
                'id': transaction.id,
                'type': transaction.transaction_type,
                'amount': transaction.amount,
                'description': transaction.description,
                'balance_after': transaction.balance_after,
                'created_at': transaction.created_at.isoformat()
            })
        
        return Response({
            'current_balance': credits.current_balance,
            'total_earned': credits.total_earned,
            'total_used': credits.total_used,
            'monthly_usage': monthly_usage,
            'last_reset_date': credits.last_reset_date.isoformat(),
            'recent_transactions': transaction_data
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_credit_usage(request):
    """Get detailed credit usage by type"""
    try:
        # Get usage by type for current month
        month_start = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        usage_by_type = CreditUsage.objects.filter(
            user=request.user,
            created_at__gte=month_start
        ).values('usage_type').annotate(
            total_used=Sum('credits_used'),
            count=Sum(1)
        ).order_by('-total_used')
        
        # Get daily usage for the last 30 days
        thirty_days_ago = timezone.now() - timedelta(days=30)
        daily_usage = CreditUsage.objects.filter(
            user=request.user,
            created_at__gte=thirty_days_ago
        ).extra(
            select={'day': 'date(created_at)'}
        ).values('day').annotate(
            total_used=Sum('credits_used')
        ).order_by('day')
        
        return Response({
            'usage_by_type': list(usage_by_type),
            'daily_usage': list(daily_usage)
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_credits(request):
    """Add credits to user account (admin function)"""
    try:
        amount = request.data.get('amount')
        description = request.data.get('description', 'Manual credit addition')
        
        if not amount or amount <= 0:
            return Response({'error': 'Invalid amount'}, status=status.HTTP_400_BAD_REQUEST)
        
        credits, created = UserCredits.objects.get_or_create(user=request.user)
        old_balance = credits.current_balance
        
        credits.current_balance += amount
        credits.total_earned += amount
        credits.save()
        
        # Create transaction record
        CreditTransaction.objects.create(
            user=request.user,
            transaction_type='earned',
            amount=amount,
            description=description,
            balance_after=credits.current_balance
        )
        
        return Response({
            'message': f'Added {amount} credits',
            'old_balance': old_balance,
            'new_balance': credits.current_balance
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
