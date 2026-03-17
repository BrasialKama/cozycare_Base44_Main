import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import {
  Home, Search, Calendar, MessageCircle, User, Settings,
  Shield, Heart, Menu, X, LogOut, Star, ClipboardList, DollarSign, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const Logo = () => (
  <Link to="/Home" className="flex items-center gap-2.5 px-2">
    <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
      <Heart className="w-4.5 h-4.5 text-primary" fill="currentColor" />
    </div>
    <span className="font-display text-xl font-semibold text-foreground tracking-tight">CozyCare</span>
  </Link>
);

const navItems = {
  parent: [
    { path: '/Home', icon: Home, label: 'Home' },
    { path: '/FindNannies', icon: Search, label: 'Find Nannies' },
    { path: '/MyBookings', icon: Calendar, label: 'Bookings' },
    { path: '/Messages', icon: MessageCircle, label: 'Messages' },
    { path: '/FamilySettings', icon: User, label: 'My Family' },
  ],
  nanny: [
    { path: '/Home', icon: Home, label: 'Home' },
    { path: '/NannyBookings', icon: Calendar, label: 'My Bookings' },
    { path: '/Messages', icon: MessageCircle, label: 'Messages' },
    { path: '/Earnings', icon: DollarSign, label: 'Earnings' },
    { path: '/NannyProfile', icon: User, label: 'My Profile' },
  ],
  admin: [
    { path: '/AdminDashboard', icon: Home, label: 'Dashboard' },
    { path: '/AdminApplications', icon: ClipboardList, label: 'Applications' },
    { path: '/AdminBookings', icon: Calendar, label: 'Bookings' },
    { path: '/AdminReports', icon: Shield, label: 'Reports' },
  ],
};

export default function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = user?.role || 'parent';
  const items = navItems[role] || navItems.parent;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card/60 backdrop-blur-sm fixed inset-y-0 left-0 z-30">
        <div className="p-5 border-b border-border">
          <Logo />
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {items.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                <item.icon className="w-4.5 h-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
              {(user?.full_name || user?.email || '?')[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.display_name || user?.full_name || 'User'}</p>
              <p className="text-xs text-muted-foreground capitalize">{role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={() => base44.auth.logout()}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 inset-x-0 h-14 bg-card/90 backdrop-blur-md border-b border-border z-30 flex items-center justify-between px-4">
        <Logo />
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute right-0 top-0 bottom-0 w-72 bg-card border-l border-border p-4 animate-fade-in">
            <div className="flex justify-end mb-4">
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <nav className="space-y-1">
              {items.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                    }`}
                  >
                    <item.icon className="w-4.5 h-4.5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-6 pt-4 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground"
                onClick={() => base44.auth.logout()}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-card/95 backdrop-blur-md border-t border-border z-30 safe-area-bottom">
        <div className="flex items-center justify-around py-1.5">
          {items.slice(0, 5).map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                  active ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0 pb-20 lg:pb-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}