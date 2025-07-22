from django.urls import path
from . import views

urlpatterns = [
    path('api/notifications/', views.get_notifications, name='get_notifications'),
    path('api/notifications/read/', views.mark_notification_read, name='mark_notification_read'),
    path('api/notifications/read-all/', views.mark_all_notifications_read, name='mark_all_notifications_read'),
    path('api/notifications/archive/', views.archive_notification, name='archive_notification'),
    path('api/notifications/preferences/', views.get_notification_preferences, name='get_notification_preferences'),
    path('api/notifications/preferences/update/', views.update_notification_preferences, name='update_notification_preferences'),
    path('api/notifications/stats/', views.get_notification_stats, name='get_notification_stats'),
] 