
"use client";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { LayoutGrid, UtensilsCrossed, Settings, Upload, MapPin, ChefHat, ClipboardCheck, LayoutDashboard, Users } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "../ui/card";
import React from "react";
import { useApp } from "@/context/app-context";
import Image from "next/image";

const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/", icon: LayoutGrid, label: "Tables" },
    { href: "/menu", icon: UtensilsCrossed, label: "Menu" },
    { href: "/upload-menu", icon: Upload, label: "Manage Menu" },
    { href: "/confirm-order", icon: ClipboardCheck, label: "Confirm Orders" },
    { href: "/kitchen", icon: ChefHat, label: "Kitchen" },
    { href: "/settings", icon: Settings, label: "Settings" },
];


export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = React.useState(false);
  const { settings } = useApp();

  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return null;
  }

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
          <div className="flex items-center gap-2 mb-4">
            <Logo />
            <div className="flex flex-col">
              <h2 className="text-lg font-bold font-headline">{settings.cafeName}</h2>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map(item => (
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
                </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarHeader className="p-4 mt-auto">
            <Card className="bg-sidebar-accent">
                <CardContent className="p-3">
                    <h3 className="font-bold font-headline text-sm flex items-center gap-2"><MapPin className="w-4 h-4" /> Address</h3>
                    <p className="text-xs text-sidebar-accent-foreground mt-1">
                        {settings.address}
                    </p>
                    <h3 className="font-bold font-headline text-sm mt-3">Phone</h3>
                    <p className="text-xs text-sidebar-accent-foreground">{settings.phone}</p>
                </CardContent>
            </Card>
        </SidebarHeader>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-2 border-b h-14 md:hidden">
            <div className="flex items-center gap-2">
                <Logo />
                <h2 className="text-md font-bold font-headline">{settings.cafeName}</h2>
            </div>
            <SidebarTrigger />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
