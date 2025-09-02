'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, ChefHat, CheckCircle, Clock, Receipt } from 'lucide-react';
import { useNotifications } from '@/context/notification-context';
import { NotificationPanel } from '@/components/notifications/notification-panel';

export default function TestNotificationsPage() {
  const { addNotification, clearAllNotifications, notifications, unreadCount } = useNotifications();

  const testNotifications = [
    {
      title: 'New Order Placed',
      message: 'Table 5 placed an order with 3 items (₹850.00)',
      type: 'order_placed' as const,
      priority: 'medium' as const,
      tableId: 5,
    },
    {
      title: 'Order Confirmed',
      message: 'Order for Table 3 has been confirmed and sent to kitchen',
      type: 'order_confirmed' as const,
      priority: 'medium' as const,
      tableId: 3,
    },
    {
      title: 'Order Ready!',
      message: 'Table 2 order is ready for serving',
      type: 'order_ready' as const,
      priority: 'high' as const,
      tableId: 2,
    },
    {
      title: 'Payment Pending',
      message: 'Table 7 bill ready for payment (₹1,250.00)',
      type: 'payment_pending' as const,
      priority: 'medium' as const,
      tableId: 7,
    },
    {
      title: 'Order Completed',
      message: 'Table 4 payment completed (₹975.00)',
      type: 'order_completed' as const,
      priority: 'low' as const,
      tableId: 4,
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b">
        <h1 className="text-2xl font-bold font-headline flex items-center gap-2">
          <Bell />
          Test Notifications
        </h1>
        <p className="text-muted-foreground">Test the notification system with sample order workflow notifications</p>
      </header>
      
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification System Status</CardTitle>
                  <CardDescription>Current notification stats and controls</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{notifications.length}</p>
                      <p className="text-sm text-muted-foreground">Total Notifications</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-500">{unreadCount}</p>
                      <p className="text-sm text-muted-foreground">Unread</p>
                    </div>
                  </div>
                  <Button 
                    variant="destructive" 
                    onClick={clearAllNotifications}
                    className="w-full"
                  >
                    Clear All Notifications
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Test Order Workflow Notifications</CardTitle>
                  <CardDescription>Click the buttons below to simulate different stages of the order workflow</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {testNotifications.map((notification, index) => (
                      <Card key={index} className="border-2 hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            {notification.type === 'order_placed' && <Clock className="h-5 w-5 text-orange-500" />}
                            {notification.type === 'order_confirmed' && <CheckCircle className="h-5 w-5 text-green-500" />}
                            {notification.type === 'order_ready' && <ChefHat className="h-5 w-5 text-blue-500" />}
                            {notification.type === 'payment_pending' && <Receipt className="h-5 w-5 text-yellow-500" />}
                            {notification.type === 'order_completed' && <CheckCircle className="h-5 w-5 text-purple-500" />}
                            <h3 className="font-semibold text-sm">{notification.title}</h3>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">{notification.message}</p>
                          <Button 
                            size="sm" 
                            onClick={() => addNotification(notification)}
                            className="w-full"
                            variant={notification.priority === 'high' ? 'default' : 'outline'}
                          >
                            Trigger {notification.priority === 'high' ? '(High Priority)' : ''}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <NotificationPanel 
                maxNotifications={10} 
                className="sticky top-4"
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>How Notifications Work</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Order Workflow
                  </h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-6">
                    <li>Customer places order → "New Order Placed" notification</li>
                    <li>Staff confirms order → "Order Confirmed" notification</li>
                    <li>Kitchen marks ready → "Order Ready!" notification (High Priority)</li>
                    <li>Order delivered → "Payment Pending" notification</li>
                    <li>Payment completed → "Order Completed" notification</li>
                  </ol>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notification Features
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-6">
                    <li>Real-time toast notifications</li>
                    <li>Notification bell with unread count</li>
                    <li>Sound alerts for high priority notifications</li>
                    <li>Persistent notification history</li>
                    <li>Table-specific tracking</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
