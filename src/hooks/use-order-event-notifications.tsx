'use client';

import { useEffect } from 'react';
import { useNotifications } from '@/context/notification-context';
import { useApp } from '@/context/app-context';
import { formatCurrency } from '@/lib/currency';

export function useOrderEventNotifications() {
  const { addNotification } = useNotifications();
  const { settings } = useApp();

  useEffect(() => {
    const handleOrderPlaced = (event: CustomEvent) => {
      const { tableId, orderTotal, itemCount } = event.detail;
      addNotification({
        title: 'New Order Placed',
        message: `Table ${tableId} placed an order with ${itemCount} items (${formatCurrency(orderTotal, settings.currency)})`,
        type: 'order_placed',
        priority: 'medium',
        tableId,
      });
    };

    const handleOrderConfirmed = (event: CustomEvent) => {
      const { tableId, orderId } = event.detail;
      addNotification({
        title: 'Order Confirmed',
        message: `Order for Table ${tableId} has been confirmed and sent to kitchen`,
        type: 'order_confirmed',
        priority: 'medium',
        tableId,
        orderId,
      });
    };

    const handleOrderReady = (event: CustomEvent) => {
      const { tableId, orderId } = event.detail;
      addNotification({
        title: 'Order Ready!',
        message: `Table ${tableId} order is ready for serving`,
        type: 'order_ready',
        priority: 'high',
        tableId,
        orderId,
      });
    };

    const handlePaymentPending = (event: CustomEvent) => {
      const { tableId, amount } = event.detail;
      addNotification({
        title: 'Payment Pending',
        message: `Table ${tableId} bill ready for payment (${formatCurrency(amount, settings.currency)})`,
        type: 'payment_pending',
        priority: 'medium',
        tableId,
      });
    };

    const handleOrderCompleted = (event: CustomEvent) => {
      const { tableId, amount } = event.detail;
      addNotification({
        title: 'Order Completed',
        message: `Table ${tableId} payment completed (${formatCurrency(amount, settings.currency)})`,
        type: 'order_completed',
        priority: 'low',
        tableId,
      });
    };

    // Add event listeners
    window.addEventListener('orderPlaced', handleOrderPlaced as EventListener);
    window.addEventListener('orderConfirmed', handleOrderConfirmed as EventListener);
    window.addEventListener('orderReady', handleOrderReady as EventListener);
    window.addEventListener('paymentPending', handlePaymentPending as EventListener);
    window.addEventListener('orderCompleted', handleOrderCompleted as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('orderPlaced', handleOrderPlaced as EventListener);
      window.removeEventListener('orderConfirmed', handleOrderConfirmed as EventListener);
      window.removeEventListener('orderReady', handleOrderReady as EventListener);
      window.removeEventListener('paymentPending', handlePaymentPending as EventListener);
      window.removeEventListener('orderCompleted', handleOrderCompleted as EventListener);
    };
  }, [addNotification]);
}
