"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  Check, 
  X, 
  ChevronDown, 
  ChevronUp,
  Award,
  Leaf,
  AlertTriangle,
  Calendar,
  Target
} from 'lucide-react';
import { useTranslation } from 'next-i18next';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'achievement' | 'alert' | 'reminder' | 'goal' | 'challenge';
  date: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

interface NotificationCenterProps {
  notifications: Notification[];
  className?: string;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDismiss?: (id: string) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  notifications, 
  className = '',
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss
}) => {
  const { t } = useTranslation('common');
  const [expanded, setExpanded] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  const displayNotifications = expanded ? notifications : notifications.slice(0, 3);
  
  // Get icon for notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Award className="h-4 w-4 text-purple-500" />;
      case 'alert':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'reminder':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'goal':
        return <Target className="h-4 w-4 text-green-500" />;
      case 'challenge':
        return <Leaf className="h-4 w-4 text-emerald-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Get color for notification type
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'border-l-purple-500';
      case 'alert':
        return 'border-l-red-500';
      case 'reminder':
        return 'border-l-blue-500';
      case 'goal':
        return 'border-l-green-500';
      case 'challenge':
        return 'border-l-emerald-500';
      default:
        return 'border-l-gray-300';
    }
  };
  
  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t('notifications.title')}
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {onMarkAllAsRead && notifications.some(n => !n.read) && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs" 
              onClick={onMarkAllAsRead}
            >
              {t('notifications.markAllRead')}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {notifications.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            {t('notifications.noNotifications')}
          </p>
        ) : (
          <>
            {displayNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`border-l-4 ${getNotificationColor(notification.type)} p-3 rounded-md bg-gray-50 ${
                  notification.read ? 'opacity-75' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    {getNotificationIcon(notification.type)}
                    <span className="font-medium">{notification.title}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {onMarkAsRead && !notification.read && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0" 
                        onClick={() => onMarkAsRead(notification.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    {onDismiss && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0" 
                        onClick={() => onDismiss(notification.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {new Date(notification.date).toLocaleString()}
                  </span>
                  {notification.actionUrl && notification.actionLabel && (
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="h-auto p-0 text-xs" 
                      asChild
                    >
                      <a href={notification.actionUrl}>{notification.actionLabel}</a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {notifications.length > 3 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs" 
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <ChevronUp className="h-4 w-4 mr-1" />
                ) : (
                  <ChevronDown className="h-4 w-4 mr-1" />
                )}
                {expanded 
                  ? t('notifications.showLess') 
                  : t('notifications.showMore', { count: notifications.length - 3 })
                }
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;
