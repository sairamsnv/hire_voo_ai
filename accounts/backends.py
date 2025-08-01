from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model

User = get_user_model()

class EmailBackend(BaseBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            # Explicitly use default database for authentication
            user = User.objects.using('default').get(email=username)
            if user.check_password(password):
                return user
        except User.DoesNotExist:
            return None

    def get_user(self, user_id):
        try:
            # Explicitly use default database for user retrieval
            return User.objects.using('default').get(pk=user_id)
        except User.DoesNotExist:
            return None



