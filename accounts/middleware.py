import time
import json
import hashlib
import re
from django.http import JsonResponse
from django.core.cache import cache
from django.conf import settings
from django.utils.deprecation import MiddlewareMixin
from django.core.exceptions import SuspiciousOperation
import logging

logger = logging.getLogger(__name__)


class SecurityMiddleware(MiddlewareMixin):
    """Comprehensive security middleware for API protection"""
    
    def __init__(self, get_response=None):
        super().__init__(get_response)
        self.suspicious_patterns = [
            r'<script[^>]*>.*?</script>',
            r'javascript:',
            r'vbscript:',
            r'onload=',
            r'onerror=',
            r'<iframe[^>]*>',
            r'<object[^>]*>',
            r'<embed[^>]*>',
            r'<link[^>]*>',
            r'<meta[^>]*>',
        ]
        
    def process_request(self, request):
        """Process incoming request for security checks"""
        start_time = time.time()
        request.start_time = start_time
        
        # Add request ID for tracking
        request.request_id = self._generate_request_id(request)
        
        # Security checks
        if not self._validate_request(request):
            return JsonResponse({
                'error': 'Request blocked for security reasons',
                'request_id': request.request_id
            }, status=400)
        
        # Rate limiting check
        if not self._check_rate_limit(request):
            return JsonResponse({
                'error': 'Rate limit exceeded',
                'request_id': request.request_id
            }, status=429)
        
        # Log request
        self._log_request(request)
        
        return None
    
    def process_response(self, request, response):
        """Process outgoing response for security headers"""
        # Add security headers
        response = self._add_security_headers(request, response)
        
        # Log response
        self._log_response(request, response)
        
        return response
    
    def _generate_request_id(self, request):
        """Generate unique request ID"""
        timestamp = str(time.time())
        ip = self._get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        # Create hash
        content = f"{timestamp}{ip}{user_agent}"
        return hashlib.md5(content.encode()).hexdigest()[:12]
    
    def _get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def _validate_request(self, request):
        """Validate request for security threats"""
        # Check for suspicious patterns in headers
        for header_name, header_value in request.META.items():
            if isinstance(header_value, str):
                for pattern in self.suspicious_patterns:
                    if re.search(pattern, header_value, re.IGNORECASE):
                        logger.warning(f"Suspicious pattern detected in header {header_name}: {header_value}")
                        return False
        
        # Check for suspicious patterns in body
        if request.body:
            body_str = request.body.decode('utf-8', errors='ignore')
            for pattern in self.suspicious_patterns:
                if re.search(pattern, body_str, re.IGNORECASE):
                    logger.warning(f"Suspicious pattern detected in request body")
                    return False
        
        # Check request size
        content_length = request.META.get('CONTENT_LENGTH', 0)
        if content_length and int(content_length) > 10 * 1024 * 1024:  # 10MB limit
            logger.warning(f"Request too large: {content_length} bytes")
            return False
        
        # Check for suspicious user agents
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        suspicious_agents = ['bot', 'crawler', 'spider', 'scraper', 'curl', 'wget']
        if any(agent in user_agent.lower() for agent in suspicious_agents):
            # Allow but log
            logger.info(f"Suspicious user agent detected: {user_agent}")
        
        return True
    
    def _check_rate_limit(self, request):
        """Check rate limiting"""
        ip = self._get_client_ip(request)
        cache_key = f"rate_limit_{ip}"
        
        # Get current count
        current_count = cache.get(cache_key, 0)
        
        # Check if limit exceeded
        if current_count > 1000:  # 1000 requests per hour per IP
            logger.warning(f"Rate limit exceeded for IP: {ip}")
            return False
        
        # Increment counter
        cache.set(cache_key, current_count + 1, 3600)  # 1 hour expiry
        
        return True
    
    def _add_security_headers(self, request, response):
        """Add security headers to response"""
        # Security headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        response['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
        
        # Custom headers
        response['X-Request-ID'] = getattr(request, 'request_id', 'unknown')
        response['X-Runtime'] = str(time.time() - getattr(request, 'start_time', time.time()))
        
        return response
    
    def _log_request(self, request):
        """Log incoming request"""
        log_data = {
            'request_id': getattr(request, 'request_id', 'unknown'),
            'method': request.method,
            'path': request.path,
            'ip': self._get_client_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
            'user': request.user.email if request.user.is_authenticated else 'anonymous',
            'timestamp': time.time(),
            'content_length': request.META.get('CONTENT_LENGTH', 0),
        }
        
        logger.info(f"Request: {json.dumps(log_data)}")
    
    def _log_response(self, request, response):
        """Log outgoing response"""
        runtime = time.time() - getattr(request, 'start_time', time.time())
        
        log_data = {
            'request_id': getattr(request, 'request_id', 'unknown'),
            'status_code': response.status_code,
            'runtime': runtime,
            'content_length': len(response.content) if hasattr(response, 'content') else 0,
        }
        
        logger.info(f"Response: {json.dumps(log_data)}")


class APIAuthenticationMiddleware(MiddlewareMixin):
    """Middleware for API authentication and validation"""
    
    def process_request(self, request):
        """Process API authentication"""
        # Store request for logging
        self.request = request
        
        # Skip for non-API requests
        if not request.path.startswith('/api/'):
            return None
        
        # Check for API key if required
        if self._requires_api_key(request):
            api_key = request.META.get('HTTP_X_API_KEY')
            if not api_key or not self._validate_api_key(api_key, request):
                return JsonResponse({
                    'error': 'Invalid or missing API key',
                    'code': 'INVALID_API_KEY'
                }, status=401)
        
        # Validate request format
        if not self._validate_request_format(request):
            return JsonResponse({
                'error': 'Invalid request format',
                'code': 'INVALID_FORMAT'
            }, status=400)
        
        return None
    
    def _requires_api_key(self, request):
        """Check if endpoint requires API key"""
        # Add endpoints that require API keys
        protected_endpoints = [
            '/api/sessions/',
            '/api/security/',
        ]
        
        # For admin endpoints, allow session authentication
        if request.path.startswith('/api/admin/'):
            return False
        
        return any(request.path.startswith(endpoint) for endpoint in protected_endpoints)
    
    def _validate_api_key(self, api_key, request):
        """Validate API key against database"""
        try:
            from .models import APIKey
            # Check if API key exists and is active
            api_key_obj = APIKey.objects.filter(
                key=api_key,
                is_active=True
            ).first()
            
            if api_key_obj:
                # Check permissions for the requested endpoint
                if not self._check_api_key_permissions(api_key_obj, request):
                    return False
                
                # Log API key usage
                self._log_api_key_usage(api_key_obj, request)
                return True
            return False
        except Exception as e:
            print(f"Error validating API key: {e}")
            return False
    
    def _check_api_key_permissions(self, api_key_obj, request):
        """Check if API key has permissions for the requested endpoint"""
        path = request.path
        
        # Sessions endpoints
        if path.startswith('/api/sessions/'):
            return api_key_obj.can_read_sessions
        
        # Security endpoints
        if path.startswith('/api/security/'):
            return api_key_obj.can_read_analytics  # Use analytics permission for security endpoints
        
        # Analytics endpoints
        if path.startswith('/api/analytics/'):
            return api_key_obj.can_read_analytics
        
        # Default to True for other endpoints
        return True
    
    def _log_api_key_usage(self, api_key_obj, request):
        """Log API key usage"""
        try:
            from .models import APIRequestLog
            APIRequestLog.objects.create(
                api_key=api_key_obj,
                endpoint=request.path,
                method=request.method,
                ip_address=self._get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                status_code=200,
                response_time=0.0
            )
        except Exception as e:
            print(f"Error logging API key usage: {e}")
    
    def _get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def _validate_request_format(self, request):
        """Validate request format"""
        if request.method in ['POST', 'PUT', 'PATCH']:
            content_type = request.META.get('CONTENT_TYPE', '')
            if 'application/json' in content_type:
                # Allow empty body for endpoints that don't require data
                if not request.body:
                    return True
                try:
                    json.loads(request.body)
                except json.JSONDecodeError:
                    return False
        return True


class RequestLoggingMiddleware(MiddlewareMixin):
    """Middleware for detailed request logging"""
    
    def process_request(self, request):
        """Log request details"""
        if request.path.startswith('/api/'):
            logger.info(f"API Request: {request.method} {request.path} from {self._get_client_ip(request)}")
        return None
    
    def process_response(self, request, response):
        """Log response details"""
        if request.path.startswith('/api/'):
            logger.info(f"API Response: {response.status_code} for {request.method} {request.path}")
        return response
    
    def _get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class ThreatDetectionMiddleware(MiddlewareMixin):
    """Middleware for threat detection and prevention"""
    
    def process_request(self, request):
        """Detect and prevent threats"""
        # Check for SQL injection patterns
        if self._detect_sql_injection(request):
            logger.warning(f"SQL injection attempt detected from {self._get_client_ip(request)}")
            return JsonResponse({
                'error': 'Request blocked for security reasons',
                'code': 'SECURITY_VIOLATION'
            }, status=400)
        
        # Check for XSS patterns
        if self._detect_xss(request):
            logger.warning(f"XSS attempt detected from {self._get_client_ip(request)}")
            return JsonResponse({
                'error': 'Request blocked for security reasons',
                'code': 'SECURITY_VIOLATION'
            }, status=400)
        
        # Check for path traversal
        if self._detect_path_traversal(request):
            logger.warning(f"Path traversal attempt detected from {self._get_client_ip(request)}")
            return JsonResponse({
                'error': 'Request blocked for security reasons',
                'code': 'SECURITY_VIOLATION'
            }, status=400)
        
        return None
    
    def _detect_sql_injection(self, request):
        """Detect SQL injection attempts"""
        sql_patterns = [
            r'(\b(union|select|insert|update|drop|create|alter)\b)',  # Removed 'delete' from SQL keywords
            r'(\b(or|and)\b\s+\d+\s*=\s*\d+)',
            r'(\b(union|select)\b.*\bfrom\b)',
            r'(\b(union|select)\b.*\bwhere\b)',
        ]
        
        # Check URL parameters
        for param_name, param_value in request.GET.items():
            for pattern in sql_patterns:
                if re.search(pattern, param_value, re.IGNORECASE):
                    return True
        
        # Check POST data
        if request.body:
            body_str = request.body.decode('utf-8', errors='ignore')
            for pattern in sql_patterns:
                if re.search(pattern, body_str, re.IGNORECASE):
                    return True
        
        return False
    
    def _detect_xss(self, request):
        """Detect XSS attempts"""
        xss_patterns = [
            r'<script[^>]*>',
            r'javascript:',
            r'vbscript:',
            r'onload=',
            r'onerror=',
            r'onclick=',
            r'onmouseover=',
        ]
        
        # Check all request data
        for key, value in request.GET.items():
            for pattern in xss_patterns:
                if re.search(pattern, value, re.IGNORECASE):
                    return True
        
        if request.body:
            body_str = request.body.decode('utf-8', errors='ignore')
            for pattern in xss_patterns:
                if re.search(pattern, body_str, re.IGNORECASE):
                    return True
        
        return False
    
    def _detect_path_traversal(self, request):
        """Detect path traversal attempts"""
        traversal_patterns = [
            r'\.\./',
            r'\.\.\\',
            r'%2e%2e%2f',
            r'%2e%2e%5c',
        ]
        
        path = request.path
        for pattern in traversal_patterns:
            if re.search(pattern, path, re.IGNORECASE):
                return True
        
        return False
    
    def _get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip 