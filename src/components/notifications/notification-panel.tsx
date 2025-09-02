'use client';

import { useNotifications } from '@/context/notification-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NotificationPanelProps {
  maxNotifications?: number;
  showOnlyUnread?: boolean;
  className?: string;
}

export function NotificationPanel({ 
  maxNotifications = 5, 
  showOnlyUnread = false,
  className = "" 
}: NotificationPanelProps) {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification 
  } = useNotifications();

  const filteredNotifications = showOnlyUnread 
    ? notifications.filter(n => !n.isRead)
    : notifications;
  
  const displayNotifications = filteredNotifications.slice(0, maxNotifications);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_placed': return '🛎️';
      case 'order_confirmed': return '✅';
      case 'order_ready': return '👨‍🍳';
      case 'payment_pending': return '💰';
      case 'order_completed': return '🎉';
      default: return '🔔';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50 dark:bg-red-950';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950';
      default: return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950';
    }
  };

  if (displayNotifications.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Recent Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No notifications</p>
            <p className="text-xs">Order updates will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Recent Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <CardDescription>
          Latest order workflow updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {displayNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 border-l-4 rounded-r ${getPriorityColor(notification.priority)} ${
                  !notification.isRead ? 'shadow-sm' : 'opacity-75'
                } hover:shadow-md transition-all cursor-pointer relative group`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{getNotificationIcon(notification.type)}</span>
                      <h4 className="font-medium text-sm leading-none">
                        {notification.title}
                      </h4>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                      </p>
                      {notification.tableId && (
                        <Badge variant="outline" className="text-xs">
                          Table {notification.tableId}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification.id);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            {filteredNotifications.length > maxNotifications && (
              <div className="text-center text-xs text-muted-foreground pt-2">
                + {filteredNotifications.length - maxNotifications} more notifications
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
