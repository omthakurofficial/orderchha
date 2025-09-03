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
    <div className={`sidebar-container ${isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="sidebar-user-profile">
          <Avatar className="sidebar-avatar">
            <AvatarImage src={currentUser?.photoUrl} alt={currentUser?.name} />
            <AvatarFallback className="sidebar-avatar-fallback">
              {currentUser?.name?.charAt(0) ?? 'U'}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="sidebar-user-info">
              <h3 className="sidebar-user-name">{currentUser?.name}</h3>
              <p className="sidebar-user-role">{currentUser?.role} Role</p>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Navigation */}
      <ScrollArea className="sidebar-nav-container">
        <nav className="sidebar-nav">
          <ul className="sidebar-nav-list">
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
                <li key={item.href} className="sidebar-nav-item">
                  <Link
                    href={item.href}
                    className={`sidebar-nav-link ${isActive ? 'sidebar-nav-link-active' : ''}`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className="sidebar-nav-icon">
                      <item.icon size={20} />
                    </div>
                    {!isCollapsed && (
                      <>
                        <span className="sidebar-nav-label">{item.label}</span>
                        {notificationCount > 0 && (
                          <Badge variant="destructive" className="sidebar-nav-badge">
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

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <button
          onClick={signOut}
          className="sidebar-logout-button"
          title={isCollapsed ? 'Sign Out' : undefined}
        >
          <div className="sidebar-nav-icon">
            <LogOut size={20} />
          </div>
          {!isCollapsed && <span className="sidebar-nav-label">Sign Out</span>}
        </button>
      </div>
    </div>
  );
}
