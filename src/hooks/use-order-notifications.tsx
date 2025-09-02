'use client';

import { useNotifications } from '@/context/notification-context';
import { useApp } from '@/context/app-context';
import { formatCurrency } from '@/lib/currency';

export function useOrderNotifications() {
  const { addNotification } = useNotifications();
  const { settings } = useApp();

  const notifyOrderPlaced = (tableId: number, orderTotal: number, itemCount: number) => {
    addNotification({
      title: 'New Order Placed',
      message: `Table ${tableId} placed an order with ${itemCount} items (${formatCurrency(orderTotal, settings.currency)})`,
      type: 'order_placed',
      priority: 'medium',
      tableId,
    });
  };

  const notifyOrderConfirmed = (tableId: number, orderId: string) => {
    addNotification({
      title: 'Order Confirmed',
      message: `Order for Table ${tableId} has been confirmed and sent to kitchen`,
      type: 'order_confirmed',
      priority: 'medium',
      tableId,
      orderId,
    });
  };

  const notifyOrderReady = (tableId: number, orderId: string) => {
    addNotification({
      title: 'Order Ready!',
      message: `Table ${tableId} order is ready for serving`,
      type: 'order_ready',
      priority: 'high',
      tableId,
      orderId,
    });
  };

  const notifyPaymentPending = (tableId: number, amount: number) => {
    addNotification({
      title: 'Payment Pending',
      message: `Table ${tableId} bill ready for payment (${formatCurrency(amount, settings.currency)})`,
      type: 'payment_pending',
      priority: 'medium',
      tableId,
    });
  };

  const notifyOrderCompleted = (tableId: number, amount: number) => {
    addNotification({
      title: 'Order Completed',
      message: `Table ${tableId} payment completed (${formatCurrency(amount, settings.currency)})`,
      type: 'order_completed',
      priority: 'low',
      tableId,
    });
  };

  return {
    notifyOrderPlaced,
    notifyOrderConfirmed,
    notifyOrderReady,
    notifyPaymentPending,
    notifyOrderCompleted,
  };
}
