from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth.models import AnonymousUser
from .models import APIKey


class APIKeyAuthentication(BaseAuthentication):
    """
    Custom authentication class for API key authentication
    """
    
    def authenticate(self, request):
        api_key = request.META.get('HTTP_X_API_KEY')
        
        if not api_key:
            return None
        
        try:
            # Find the API key in the database
            api_key_obj = APIKey.objects.filter(
                key=api_key,
                is_active=True
            ).first()
            
            if not api_key_obj:
                raise AuthenticationFailed('Invalid API key')
            
            # Update last used timestamp
            api_key_obj.update_last_used()
            
            # Return the user associated with the API key
            return (api_key_obj.user, api_key_obj)
            
        except APIKey.DoesNotExist:
            raise AuthenticationFailed('Invalid API key')
        except Exception as e:
            raise AuthenticationFailed(f'Authentication failed: {str(e)}')
    
    def authenticate_header(self, request):
        return 'X-API-Key' 