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
    { href: "/", icon: LayoutGrid, label: "Tables", roles: ["admin"] },
    { href: "/menu", icon: LayoutDashboard, label: "Menu", roles: ["admin"] },
    { href: "/confirm-order", icon: ClipboardCheck, label: "Orders", roles: ["admin"] },
    { href: "/billing", icon: Receipt, label: "Billing", roles: ["admin"] },
    { href: "/users", icon: Users, label: "Users", roles: ["admin"] },
    { href: "/settings", icon: Settings, label: "Settings", roles: ["admin"] },
  ],
  staff: [
    { href: "/", icon: LayoutGrid, label: "Tables", roles: ["staff"] },
    { href: "/confirm-order", icon: ClipboardCheck, label: "Orders", roles: ["staff"] },
    { href: "/menu", icon: LayoutDashboard, label: "Menu", roles: ["staff"] },
    { href: "/billing", icon: Receipt, label: "Billing", roles: ["staff"] },
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
      className="fixed inset-x-2 bottom-2 z-50 rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-xl backdrop-blur md:!hidden"
      data-mobile-footer
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="mx-auto flex max-w-screen-sm items-center justify-center pb-[max(0px,env(safe-area-inset-bottom))]">
        <div
          className="grid w-full gap-1"
          style={{ gridTemplateColumns: `repeat(${Math.max(navItems.length, 1)}, minmax(0, 1fr))` }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
                            (item.href !== '/' && pathname?.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-[52px] flex-col items-center justify-center rounded-xl p-1.5 transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-primary/30",
                  isActive
                    ? "bg-orange-500 text-white"
                    : "text-slate-600 hover:bg-slate-100 active:bg-slate-200"
                )}
                aria-label={item.label}
              >
                <Icon className={cn(
                  "mb-1 h-[18px] w-[18px] shrink-0 transition-colors",
                  isActive ? "text-white" : "text-slate-600"
                )} />
                <span className={cn(
                  "whitespace-nowrap text-[10px] font-semibold leading-tight transition-colors",
                  isActive ? "text-white" : "text-slate-600"
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
