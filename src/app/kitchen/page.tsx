
'use client';

import { KitchenOrderCard } from '@/components/kitchen/kitchen-order-card';
import { useApp } from '@/context/app-context-supabase';
import { ChefHat } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function KitchenPage() {
  const { kitchenOrders, isLoaded, currentUser } = useApp();
  const router = useRouter();

  useEffect(() => {
      if (currentUser?.role !== 'admin' && currentUser?.role !== 'waiter' && currentUser?.role !== 'kitchen') {
          router.push('/');
      }
  }, [currentUser, router]);

  // Only show orders that have been approved ('preparing' status)
  const activeOrders = kitchenOrders.filter(o => o.status === 'preparing');

  if (!isLoaded) {
    return (
        <div className="flex items-center justify-center h-full">
            <p>Loading kitchen orders...</p>
        </div>
    )
  }

  if (currentUser?.role !== 'admin' && currentUser?.role !== 'waiter' && currentUser?.role !== 'kitchen') {
      return (
          <div className="flex items-center justify-center h-full">
              <p>You do not have permission to view this page.</p>
          </div>
      )
  }

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b">
        <h1 className="text-2xl font-bold font-headline flex items-center gap-2">
          <ChefHat />
          Kitchen Display
        </h1>
        <p className="text-muted-foreground">Live incoming orders from all tables.</p>
      </header>
      <main className="flex-1 p-4 md:p-6 overflow-auto bg-muted/20">
        {activeOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 rounded-lg bg-background">
            <ChefHat className="w-24 h-24 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold text-muted-foreground">No Active Orders</h2>
            <p className="text-muted-foreground">Waiting for new orders from customers...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {activeOrders.map(order => (
              <KitchenOrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
