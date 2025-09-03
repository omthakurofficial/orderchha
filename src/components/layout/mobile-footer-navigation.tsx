"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutGrid, 
  Receipt, 
  Users, 
  User, 
  ChefHat, 
  Bell, 
  Package, 
  LayoutDashboard, 
  Settings,
  ClipboardCheck
} from "lucide-react";
import { useApp } from "@/context/app-context";
import { cn } from "@/lib/utils";
import { useMobileNavigation } from "@/hooks/use-mobile-navigation";
import type { UserRole } from "@/types/index";
import "../../styles/mobile-footer.css";

interface FooterNavItem {
  href: string;
  icon: React.ComponentType<any>;
  label: string;
  roles: UserRole[];
}

// Define navigation items for each role
const roleBasedNavigation: Record<UserRole, FooterNavItem[]> = {
  waiter: [
    { href: "/", icon: LayoutGrid, label: "Tables", roles: ["waiter"] },
    { href: "/confirm-order", icon: ClipboardCheck, label: "Take Order", roles: ["waiter"] },
    { href: "/billing", icon: Receipt, label: "Bills", roles: ["waiter"] },
    { href: "/customers", icon: Users, label: "Customers", roles: ["waiter"] },
    { href: "/profile", icon: User, label: "Profile", roles: ["waiter"] },
  ],
  kitchen: [
    { href: "/kitchen", icon: ChefHat, label: "Kitchen", roles: ["kitchen"] },
    { href: "/test-notifications", icon: Bell, label: "Notifications", roles: ["kitchen"] },
    { href: "/profile", icon: User, label: "Profile", roles: ["kitchen"] },
  ],
  accountant: [
    { href: "/", icon: LayoutGrid, label: "Tables", roles: ["accountant"] },
    { href: "/confirm-order", icon: ClipboardCheck, label: "Take Order", roles: ["accountant"] },
    { href: "/billing", icon: Receipt, label: "Bills", roles: ["accountant"] },
    { href: "/inventory", icon: Package, label: "Inventory", roles: ["accountant"] },
    { href: "/customers", icon: Users, label: "Customers", roles: ["accountant"] },
    { href: "/profile", icon: User, label: "Profile", roles: ["accountant"] },
  ],
  cashier: [
    { href: "/", icon: LayoutGrid, label: "Tables", roles: ["cashier"] },
    { href: "/confirm-order", icon: ClipboardCheck, label: "Take Order", roles: ["cashier"] },
    { href: "/billing", icon: Receipt, label: "Bills", roles: ["cashier"] },
    { href: "/inventory", icon: Package, label: "Inventory", roles: ["cashier"] },
    { href: "/customers", icon: Users, label: "Customers", roles: ["cashier"] },
    { href: "/profile", icon: User, label: "Profile", roles: ["cashier"] },
  ],
  admin: [
    { href: "/settings", icon: Settings, label: "Settings", roles: ["admin"] },
    { href: "/users", icon: Users, label: "Users", roles: ["admin"] },
    { href: "/inventory", icon: Package, label: "Inventory", roles: ["admin"] },
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["admin"] },
    { href: "/profile", icon: User, label: "Profile", roles: ["admin"] },
  ],
  staff: [
    { href: "/", icon: LayoutGrid, label: "Tables", roles: ["staff"] },
    { href: "/profile", icon: User, label: "Profile", roles: ["staff"] },
  ],
};

export function MobileFooterNavigation() {
  const { currentUser } = useApp();
  const pathname = usePathname();
  
  // Apply mobile navigation optimizations
  useMobileNavigation();

  // Don't show footer on certain pages
  if (pathname?.startsWith('/receipt') || pathname?.startsWith('/debug') || pathname?.startsWith('/login')) {
    return null;
  }

  if (!currentUser?.role) {
    return null;
  }

  const navItems = roleBasedNavigation[currentUser.role as UserRole] || [];

  // Don't render if no nav items for the role
  if (navItems.length === 0) {
    return null;
  }

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg block md:!hidden"
      data-mobile-footer
      role="navigation"
      aria-label="Mobile navigation"
      style={{ display: 'block' }}
    >
      <div 
        className="flex items-center justify-center py-2 px-4 min-h-[60px] max-w-screen-sm mx-auto"
        style={{
          paddingBottom: 'max(8px, env(safe-area-inset-bottom))'
        }}
      >
        <div className="nav-items-container">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
                            (item.href !== '/' && pathname?.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg transition-colors",
                  "min-h-[48px] min-w-[60px] flex-1 max-w-[80px]",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-gray-600 hover:text-primary hover:bg-gray-50 active:bg-gray-100"
                )}
                style={{ 
                  WebkitTapHighlightColor: 'rgba(0, 0, 0, 0.1)'
                }}
                aria-label={item.label}
              >
                <Icon className={cn(
                  "h-5 w-5 mb-1 flex-shrink-0 transition-colors",
                  isActive ? "text-primary" : "text-gray-600"
                )} />
                <span className={cn(
                  "text-[10px] font-medium text-center leading-tight transition-colors whitespace-nowrap",
                  isActive ? "text-primary" : "text-gray-600"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
