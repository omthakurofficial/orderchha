
"use client";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { LayoutGrid, UtensilsCrossed, Settings, Upload, MapPin, ChefHat, ClipboardCheck, LayoutDashboard, Users, LogOut, Package, Receipt, User, Bell } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "../ui/card";
import React from "react";
import { useApp } from "@/context/app-context";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTitle } from "../ui/sheet";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { useOrderEventNotifications } from "@/hooks/use-order-event-notifications";
import type { UserRole } from "@/types";

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


export function AppShell({ children }: { children: React.ReactNode }) {
  const { 
    currentUser, 
    settings, 
    signOut, 
    pendingOrders, 
    kitchenOrders, 
    billingOrders,
    tables 
  } = useApp();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = React.useState(false);

  // Initialize order event notifications
  useOrderEventNotifications();

  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return null;
  }

  const navItems = allNavItems.filter(item => {
    return currentUser?.role && item.roles.includes(currentUser.role);
  });

  // Calculate notification counts for different sections
  const getNotificationCount = (section: string): number => {
    switch (section) {
      case 'confirm-orders':
        // Count of pending orders waiting for confirmation
        return pendingOrders?.length || 0;
      
      case 'kitchen':
        // Count of orders that are being prepared or ready in kitchen
        return kitchenOrders?.filter(order => 
          order.status === 'preparing' || order.status === 'ready'
        ).length || 0;
      
      case 'billing':
        // Count of actual billing orders, not table status
        return billingOrders?.length || 0;
      
      default:
        return 0;
    }
  };

  const Logo = () => (
    settings.logo ? (
      <Image src={settings.logo} alt="Cafe Logo" width={32} height={32} className="rounded-md" />
    ) : (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8 text-primary"
        >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
            <path d="M17 12h.01" />
        </svg>
    )
  );
  
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
            <Card className="bg-sidebar-accent">
                <CardContent className="p-3 flex items-center gap-3">
                    <Link href="/profile" className="flex items-center gap-3 w-full hover:opacity-80 transition-opacity">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={currentUser?.photoUrl} alt={currentUser?.name} />
                            <AvatarFallback>{currentUser?.name?.charAt(0) ?? 'U'}</AvatarFallback>
                        </Avatar>
                         <div>
                            <h3 className="font-bold font-headline text-md">{currentUser?.name}</h3>
                            <p className="text-xs text-sidebar-accent-foreground capitalize">{currentUser?.role} Role</p>
                        </div>
                    </Link>
                </CardContent>
            </Card>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map(item => {
              // Determine if this menu item should show a notification badge
              let notificationCount = 0;
              if (item.href === '/confirm-order') {
                notificationCount = getNotificationCount('confirm-orders');
              } else if (item.href === '/kitchen') {
                notificationCount = getNotificationCount('kitchen');
              } else if (item.href === '/billing') {
                notificationCount = getNotificationCount('billing');
              }

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                  {notificationCount > 0 && (
                    <SidebarMenuBadge className="bg-red-500 text-white">
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2">
            <Button variant="ghost" className="w-full justify-start" onClick={signOut}>
                <LogOut />
                <span>Sign Out</span>
            </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-2 border-b h-14 md:hidden">
            <div className="flex items-center gap-2">
                <Logo />
                <h2 className="text-md font-bold font-headline">{settings.cafeName}</h2>
            </div>
            <div className="flex items-center gap-2">
                <NotificationBell />
                <SidebarTrigger />
            </div>
        </header>
        {/* Desktop Notification Bell */}
        <div className="hidden md:flex justify-end p-2 border-b">
            <NotificationBell />
        </div>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
