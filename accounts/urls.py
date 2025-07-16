
from django.urls import path
from . import views
app_name = 'accounts'
urlpatterns = [
    # Authentication endpoints
    path('api/csrf/', views.get_csrf_token, name='csrf_token'),
    path('api/login/', views.login_view, name='login'),
    path('api/logout/', views.logout_view, name='logout'),
    path('api/register/', views.register_view, name='register'),
    
    # Session management
    path('api/session/', views.session_check_view, name='session_check'),
    path('api/profile/', views.get_profile_view, name='user_profile'),
    
    # Backward compatibility
    path('api/check-auth/', views.check_auth_view, name='check_auth'),
    path('api/update_profile/', views.update_profile_view, name='update_profile'),
    # Frontend routes (catch-all for React Router)
    path('', views.FrontendAppView.as_view(), name='frontend'),
    path('<path:path>', views.FrontendAppView.as_view(), name='frontend_path'),

    
#                        ↑ this slash is required

]








