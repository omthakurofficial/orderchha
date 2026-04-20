'use client';

import React from 'react';
import { Menu, Search, Bell, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useApp } from '@/context/app-context';
import { NotificationBell } from '@/components/notifications/notification-bell';

interface AppNavbarProps {
  onSidebarToggle: () => void;
  showSidebarToggle?: boolean;
}

export function AppNavbar({ onSidebarToggle, showSidebarToggle = true }: AppNavbarProps) {
  const { currentUser, settings, signOut } = useApp();
  const [logoLoadFailed, setLogoLoadFailed] = React.useState(false);
  const logoSrc = typeof settings.logo === 'string' ? settings.logo.trim() : '';

  React.useEffect(() => {
    // Reset failure state when logo source changes.
    setLogoLoadFailed(false);
  }, [logoSrc]);

  return (
    <header className="glass-surface sticky top-3 z-20 rounded-2xl px-3 py-2 sm:px-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {showSidebarToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSidebarToggle}
              className="h-9 w-9 rounded-xl text-slate-700 hover:bg-slate-200/80"
            >
              <Menu size={20} />
            </Button>
          )}

          <div className="hidden items-center gap-2 sm:flex">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 text-sm font-bold text-white">
              RS
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{settings.cafeName}</p>
              <p className="text-xs text-slate-500">Restaurant Operations Console</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:hidden">
            {logoSrc && !logoLoadFailed ? (
              <img 
                src={logoSrc}
                alt="Logo" 
                className="h-8 w-8 rounded-lg object-cover"
                onError={() => setLogoLoadFailed(true)}
              />
            ) : (
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 text-sm font-semibold text-white">
                <span>{settings.cafeName?.charAt(0) || 'S'}</span>
              </div>
            )}
            <h1 className="truncate text-sm font-semibold text-slate-900">{settings.cafeName}</h1>
          </div>
        </div>

        <div className="hidden max-w-md flex-1 md:flex">
          <div className="relative w-full">
            <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              placeholder="Search tables, menu, customers..."
              className="h-10 rounded-xl border-slate-200 bg-white/80 pl-9 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <div>
            <NotificationBell />
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="hidden h-9 w-9 rounded-xl text-slate-700 hover:bg-slate-200/80 md:inline-flex"
          >
            <Settings size={20} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 rounded-xl px-2 hover:bg-slate-200/80 md:px-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser?.photoUrl} alt={currentUser?.name} />
                  <AvatarFallback className="bg-slate-700 text-white">
                    {currentUser?.name?.charAt(0) ?? 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left md:block">
                  <p className="max-w-[8rem] truncate text-sm font-medium text-slate-900">{currentUser?.name}</p>
                  <p className="text-xs capitalize text-slate-500">{currentUser?.role}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-xl border-slate-200">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User size={16} className="mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings size={16} className="mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-red-600">
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
