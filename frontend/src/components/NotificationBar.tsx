
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, X, MapPin, Briefcase, Globe } from 'lucide-react';

interface Notification {
  id: string;
  type: 'job' | 'country_update' | 'system';
  title: string;
  message: string;
  country?: string;
  timestamp: Date;
  isRead: boolean;
}

interface NotificationBarProps {
  onClose: () => void;
}

const NotificationBar = ({ onClose }: NotificationBarProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'job',
      title: 'New Job Alert',
      message: '5 new React Developer positions in San Francisco',
      timestamp: new Date(),
      isRead: false
    },
    {
      id: '2',
      type: 'country_update',
      title: 'USA Market Update',
      message: 'Tech job market grew by 15% this month',
      country: 'USA',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: false
    },
    {
      id: '3',
      type: 'country_update',
      title: 'Canada Opportunities',
      message: 'Remote work policies expanded - 200+ new remote positions',
      country: 'Canada',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      isRead: false
    }
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'job':
        return <Briefcase className="w-4 h-4 text-blue-600" />;
      case 'country_update':
        return <Globe className="w-4 h-4 text-green-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };

  return (
    <div className="fixed top-20 right-6 z-40 w-80">
      <Card className="glass backdrop-blur-xl border-white/50 shadow-luxury">
        <CardContent className="p-0">
          <div className="p-4 border-b border-white/20">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-blue-900">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:bg-blue-50"
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-6 w-6"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <div className="space-y-0">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-white/10 last:border-b-0 hover:bg-white/30 transition-colors ${
                      !notification.isRead ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-blue-900 mb-1">
                              {notification.title}
                            </p>
                            <p className="text-sm text-blue-600/70 mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-blue-500">
                              {notification.country && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{notification.country}</span>
                                </div>
                              )}
                              <span>{formatTimeAgo(notification.timestamp)}</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeNotification(notification.id)}
                            className="h-6 w-6 text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        {!notification.isRead && (
                          <div className="mt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-blue-600 hover:bg-blue-50 h-6 px-2"
                            >
                              Mark as read
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationBar;
