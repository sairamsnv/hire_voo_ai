from django.urls import path, re_path
from .views import (
    login_view, logout_view, register_view,
    get_csrf_token, get_profile_view, check_auth_view,
    FrontendAppView
)

app_name = 'accounts'

urlpatterns = [
    path('api/login/', login_view),
    path('api/logout/', logout_view),
    path('api/register/', register_view),
    path('api/profile/', get_profile_view),
    path('api/csrf/', get_csrf_token),
    path('api/check-auth/', check_auth_view),
   

    # ✅ Catch-all React frontend route (should be last)
    re_path(r'^(?!static/).*$', FrontendAppView.as_view(), name='frontend'),

]








