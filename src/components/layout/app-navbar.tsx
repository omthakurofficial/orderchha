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

  return (
    <header className="navbar-container">
      <div className="navbar-content">
        {/* Left Section */}
        <div className="navbar-left">
          {showSidebarToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSidebarToggle}
              className="navbar-sidebar-toggle"
            >
              <Menu size={20} />
            </Button>
          )}
          
          {/* Logo and Title (visible on mobile when sidebar is hidden) */}
          <div className="navbar-logo mobile-only">
            {settings.logo ? (
              <img 
                src={settings.logo} 
                alt="Logo" 
                className="navbar-logo-image"
              />
            ) : (
              <div className="navbar-logo-fallback">
                <span className="navbar-logo-text">{settings.cafeName?.charAt(0) || 'S'}</span>
              </div>
            )}
            <h1 className="navbar-title">{settings.cafeName}</h1>
          </div>
        </div>

        {/* Center Section - Search (Desktop only) */}
        <div className="navbar-center">
          <div className="navbar-search">
            <Search size={18} className="navbar-search-icon" />
            <Input
              type="search"
              placeholder="Search..."
              className="navbar-search-input"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="navbar-right">
          {/* Notifications */}
          <div className="navbar-notifications">
            <NotificationBell />
          </div>

          {/* Settings (Desktop only) */}
          <Button
            variant="ghost"
            size="sm"
            className="navbar-settings desktop-flex"
          >
            <Settings size={20} />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="navbar-user-menu">
                <Avatar className="navbar-user-avatar">
                  <AvatarImage src={currentUser?.photoUrl} alt={currentUser?.name} />
                  <AvatarFallback className="navbar-user-avatar-fallback">
                    {currentUser?.name?.charAt(0) ?? 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="navbar-user-info desktop-block">
                  <p className="navbar-user-name">{currentUser?.name}</p>
                  <p className="navbar-user-role">{currentUser?.role}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="navbar-user-dropdown">
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
