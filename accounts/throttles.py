from rest_framework.throttling import UserRateThrottle, AnonRateThrottle, SimpleRateThrottle
from django.core.cache import cache
from django.conf import settings
import time


class LoginThrottle(UserRateThrottle):
    """Throttle login attempts"""
    rate = '5/minute'
    scope = 'login'


class RegisterThrottle(AnonRateThrottle):
    """Throttle registration attempts"""
    rate = '3/minute'
    scope = 'register'


class ForgotThrottle(AnonRateThrottle):
    """Throttle forgot password attempts"""
    rate = '3/minute'
    scope = 'forgot'


class APIRateThrottle(SimpleRateThrottle):
    """General API rate limiting"""
    rate = '100/hour'
    scope = 'api'

    def get_cache_key(self, request, view):
        if request.user.is_authenticated:
            ident = request.user.pk
        else:
            ident = self.get_ident(request)
        return f"api_throttle_{ident}"


class SensitiveActionThrottle(UserRateThrottle):
    """Throttle sensitive actions like password changes, email changes"""
    rate = '10/hour'
    scope = 'sensitive'


class SessionManagementThrottle(UserRateThrottle):
    """Throttle session management actions"""
    rate = '20/minute'
    scope = 'session_management'


class AdminActionThrottle(UserRateThrottle):
    """Throttle admin actions"""
    rate = '50/hour'
    scope = 'admin_action'

    def allow_request(self, request, view):
        # Only apply to staff users
        if not request.user.is_staff:
            return True
        return super().allow_request(request, view)


class IPBasedThrottle(SimpleRateThrottle):
    """IP-based rate limiting for security"""
    rate = '1000/hour'
    scope = 'ip'

    def get_cache_key(self, request, view):
        return f"ip_throttle_{self.get_ident(request)}"


class BurstThrottle(SimpleRateThrottle):
    """Burst protection for rapid requests"""
    rate = '30/minute'
    scope = 'burst'

    def get_cache_key(self, request, view):
        if request.user.is_authenticated:
            ident = request.user.pk
        else:
            ident = self.get_ident(request)
        return f"burst_throttle_{ident}"


class PremiumUserThrottle(UserRateThrottle):
    """Higher limits for premium users"""
    rate = '200/hour'
    scope = 'premium'

    def allow_request(self, request, view):
        # Check if user has premium status (you can customize this)
        if hasattr(request.user, 'is_premium') and request.user.is_premium:
            return True
        return super().allow_request(request, view)


class SecurityThrottle(SimpleRateThrottle):
    """Security-focused throttling for suspicious activity"""
    rate = '5/minute'
    scope = 'security'

    def get_cache_key(self, request, view):
        return f"security_throttle_{self.get_ident(request)}"

    def allow_request(self, request, view):
        # Additional security checks
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        # Block suspicious user agents
        suspicious_agents = ['bot', 'crawler', 'spider', 'scraper']
        if any(agent in user_agent.lower() for agent in suspicious_agents):
            return False
        
        return super().allow_request(request, view)


class AdaptiveThrottle(SimpleRateThrottle):
    """Adaptive throttling based on user behavior"""
    scope = 'adaptive'

    def get_rate(self):
        # Adjust rate based on user behavior
        if hasattr(self, 'request') and self.request.user.is_authenticated:
            # Check user's history
            user_key = f"user_behavior_{self.request.user.pk}"
            behavior_score = cache.get(user_key, 0)
            
            if behavior_score > 10:  # Suspicious behavior
                return '10/hour'
            elif behavior_score > 5:  # Moderate behavior
                return '50/hour'
            else:  # Normal behavior
                return '200/hour'
        return '100/hour'

    def get_cache_key(self, request, view):
        if request.user.is_authenticated:
            ident = request.user.pk
        else:
            ident = self.get_ident(request)
        return f"adaptive_throttle_{ident}"


class RequestSizeThrottle(SimpleRateThrottle):
    """Throttle based on request size"""
    rate = '50/hour'
    scope = 'request_size'

    def allow_request(self, request, view):
        # Check request size
        content_length = request.META.get('CONTENT_LENGTH', 0)
        if content_length and int(content_length) > 1024 * 1024:  # 1MB
            return False
        return super().allow_request(request, view)


class TimeBasedThrottle(SimpleRateThrottle):
    """Time-based throttling (different rates for different times)"""
    scope = 'time_based'

    def get_rate(self):
        import datetime
        hour = datetime.datetime.now().hour
        
        # Peak hours (9 AM - 6 PM)
        if 9 <= hour <= 18:
            return '200/hour'
        # Off-peak hours
        else:
            return '100/hour'

    def get_cache_key(self, request, view):
        if request.user.is_authenticated:
            ident = request.user.pk
        else:
            ident = self.get_ident(request)
        return f"time_throttle_{ident}"