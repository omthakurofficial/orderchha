'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/app-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LayoutDashboard, 
  LayoutGrid, 
  UtensilsCrossed, 
  Upload, 
  Package, 
  Receipt, 
  Users, 
  ClipboardCheck, 
  ChefHat, 
  User, 
  Bell, 
  Settings,
  LogOut
} from 'lucide-react';

const allNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["admin"] },
  { href: "/", icon: LayoutGrid, label: "Tables", roles: ["admin", "waiter", "cashier"] },
  { href: "/menu", icon: UtensilsCrossed, label: "Menu", roles: ["admin", "waiter", "cashier"] },
  { href: "/upload-menu", icon: Upload, label: "Manage Menu", roles: ["admin"] },
  { href: "/inventory", icon: Package, label: "Inventory", roles: ["admin", "accountant"] },
  { href: "/billing", icon: Receipt, label: "Billing", roles: ["admin", "cashier", "accountant"] },
  { href: "/customers", icon: Users, label: "Customers", roles: ["admin", "waiter", "cashier"] },
  { href: "/confirm-order", icon: ClipboardCheck, label: "Confirm Orders", roles: ["admin", "waiter"] },
  { href: "/kitchen", icon: ChefHat, label: "Kitchen", roles: ["admin", "waiter", "kitchen"] },
  { href: "/users", icon: Users, label: "Users", roles: ["admin"] },
  { href: "/profile", icon: User, label: "Profile", roles: ["admin", "staff", "cashier", "accountant", "waiter", "kitchen"] },
  { href: "/test-notifications", icon: Bell, label: "Test Notifications", roles: ["admin"] },
  { href: "/settings", icon: Settings, label: "Settings", roles: ["admin"] },
];

interface AppSidebarProps {
  isCollapsed?: boolean;
}

export function AppSidebar({ isCollapsed = false }: AppSidebarProps) {
  const { 
    currentUser, 
    signOut, 
    pendingOrders, 
    kitchenOrders, 
    billingOrders 
  } = useApp();
  const pathname = usePathname();

  // Filter navigation items based on user role
  const navItems = allNavItems.filter(item => {
    return currentUser?.role && item.roles.includes(currentUser.role);
  });

  // Calculate notification counts
  const getNotificationCount = (section: string): number => {
    switch (section) {
      case 'confirm-orders':
        return pendingOrders?.length || 0;
      case 'kitchen':
        return kitchenOrders?.filter(order => 
          order.status === 'preparing' || order.status === 'ready'
        ).length || 0;
      case 'billing':
        return billingOrders?.length || 0;
      default:
        return 0;
    }
  };

  return (
    <div
      className={`h-[calc(100vh-2rem)] rounded-3xl border border-slate-800/70 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-slate-100 shadow-2xl transition-all duration-300 ${
        isCollapsed ? 'w-[4.75rem]' : 'w-[16.75rem]'
      }`}
    >
      <div className="border-b border-slate-700/70 px-3 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-orange-400/40">
            <AvatarImage src={currentUser?.photoUrl} alt={currentUser?.name} />
            <AvatarFallback className="bg-slate-700 text-slate-100">
              {currentUser?.name?.charAt(0) ?? 'U'}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold">{currentUser?.name}</h3>
              <p className="text-xs capitalize text-slate-300">{currentUser?.role} role</p>
            </div>
          )}
        </div>
      </div>

      <ScrollArea className="h-[calc(100%-8.2rem)] px-2 py-4">
        <nav>
          <ul className="space-y-1.5">
            {navItems.map(item => {
              const isActive = pathname === item.href;
              let notificationCount = 0;
              
              if (item.href === '/confirm-order') {
                notificationCount = getNotificationCount('confirm-orders');
              } else if (item.href === '/kitchen') {
                notificationCount = getNotificationCount('kitchen');
              } else if (item.href === '/billing') {
                notificationCount = getNotificationCount('billing');
              }

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-amber-400 text-slate-900 shadow-md'
                        : 'text-slate-200 hover:bg-slate-800/80 hover:text-white'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className="shrink-0">
                      <item.icon size={20} />
                    </div>
                    {!isCollapsed && (
                      <>
                        <span className="truncate">{item.label}</span>
                        {notificationCount > 0 && (
                          <Badge variant="destructive" className="ml-auto h-5 rounded-full px-2 text-[11px] font-semibold">
                            {notificationCount > 99 ? '99+' : notificationCount}
                          </Badge>
                        )}
                      </>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </ScrollArea>

      <div className="border-t border-slate-700/70 p-2">
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-200 transition-colors hover:bg-rose-500/20 hover:text-rose-100"
          title={isCollapsed ? 'Sign Out' : undefined}
        >
          <div className="shrink-0">
            <LogOut size={20} />
          </div>
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );
}
