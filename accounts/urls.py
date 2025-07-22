
from django.urls import path
from . import views
from .views import verify_email_view

app_name = 'accounts'
urlpatterns = [
    # Authentication endpoints
    path('api/csrf/', views.get_csrf_token, name='csrf_token'),
    path('api/login/', views.login_view, name='login'),
    path('api/logout/', views.logout_view, name='logout'),
    path('api/register/', views.register_view, name='register'),
    path('api/verify-email/', verify_email_view, name='verify-email'),
    path('api/forgot-password/', views.forgot_password_view, name='forgot_password'),
    path('api/reset-password/', views.reset_password_view, name='reset_password'),
    
    # Session management
    path('api/session/', views.session_check_view, name='session_check'),
    path('api/profile/', views.get_profile_view, name='user_profile'),
    
    # Session Management endpoints
    path('api/sessions/', views.get_user_sessions_view, name='user_sessions'),
    path('api/sessions/analytics/', views.get_session_analytics_view, name='session_analytics'),
    path('api/sessions/terminate/', views.terminate_session_view, name='terminate_session'),
    path('api/sessions/terminate-all/', views.terminate_all_sessions_view, name='terminate_all_sessions'),
    path('api/sessions/settings/', views.session_settings_view, name='session_settings'),
    path('api/sessions/activities/', views.get_session_activities_view, name='session_activities'),
    
    # API Security endpoints
    path('api/security/keys/', views.api_keys_view, name='api_keys'),
    path('api/security/keys/<uuid:key_id>/', views.api_key_detail_view, name='api_key_detail'),
    path('api/security/keys/<uuid:key_id>/usage/', views.api_key_usage_view, name='api_key_usage'),
    path('api/security/logs/', views.api_request_logs_view, name='api_request_logs'),
    path('api/security/events/', views.security_events_view, name='security_events'),
    path('api/security/events/<uuid:event_id>/resolve/', views.resolve_security_event_view, name='resolve_security_event'),
    path('api/security/dashboard/', views.security_dashboard_view, name='security_dashboard'),
    
    # Admin session management
    path('api/admin/sessions/', views.admin_get_user_sessions_view, name='admin_user_sessions'),
    path('api/admin/sessions/all/', views.admin_get_all_sessions_view, name='admin_all_sessions'),
    path('api/admin/sessions/force-logout/', views.admin_force_logout_user_view, name='admin_force_logout'),
    path('api/admin/sessions/force-logout-session/', views.admin_force_logout_session_view, name='admin_force_logout_session'),
    path('api/admin/sessions/<uuid:session_id>/details/', views.admin_session_details_view, name='admin_session_details'),
    path('api/admin/sessions/<uuid:session_id>/activity/', views.admin_session_activity_view, name='admin_session_activity'),
    
    # Admin security management
    path('api/admin/security/events/', views.admin_security_events_view, name='admin_security_events'),
    path('api/admin/security/events/<uuid:event_id>/', views.admin_security_event_detail_view, name='admin_security_event_detail'),
    path('api/admin/security/events/<uuid:event_id>/investigation/', views.admin_security_event_investigation_view, name='admin_security_event_investigation'),
    path('api/admin/security/events/<uuid:event_id>/resolve/', views.admin_resolve_security_event_view, name='admin_resolve_security_event'),
    path('api/admin/security/block-ip/', views.admin_block_ip_view, name='admin_block_ip'),
    path('api/admin/security/analytics/', views.admin_api_analytics_view, name='admin_api_analytics'),
    
    # Admin user management
    path('api/admin/users/', views.admin_get_all_users_view, name='admin_all_users'),
    path('api/admin/users/analytics/', views.admin_user_analytics_view, name='admin_user_analytics'),
    path('api/admin/users/<int:user_id>/', views.admin_get_user_detail_view, name='admin_user_detail'),
    path('api/admin/users/<int:user_id>/update/', views.admin_update_user_view, name='admin_update_user'),
    path('api/admin/users/<int:user_id>/delete/', views.admin_delete_user_view, name='admin_delete_user'),
    
    # Test endpoint for debugging

    
    # Payment endpoints
    path('api/payments/create-checkout/', views.create_checkout_session_view, name='create_checkout'),
    path('api/payments/subscription/', views.get_user_subscription_view, name='user_subscription'),
    
    # Photo upload endpoints
    path('api/photos/upload/', views.upload_photo_view, name='upload_photo'),
    path('api/photos/', views.get_user_photos_view, name='user_photos'),
    path('api/photos/<uuid:photo_id>/', views.get_photo_detail_view, name='photo_detail'),
    path('api/photos/<uuid:photo_id>/update/', views.update_photo_view, name='update_photo'),
    path('api/photos/<uuid:photo_id>/delete/', views.delete_photo_view, name='delete_photo'),
    path('api/photos/<uuid:photo_id>/set-primary/', views.set_primary_photo_view, name='set_primary_photo'),
    
    # Backward compatibility
    path('api/check-auth/', views.check_auth_view, name='check_auth'),
    path('api/update_profile/', views.update_profile_view, name='update_profile'),
    path('api/change-email/', views.request_email_change_view, name='change_email'),
    path('api/verify-email-change/', views.verify_email_change_view, name='verify_email_change'),
    
    # Frontend routes (catch-all for React Router)
    path('', views.FrontendAppView.as_view(), name='frontend'),
    path('<path:path>', views.FrontendAppView.as_view(), name='frontend_path'),
]








