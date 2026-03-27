import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import {
  Home, Search, Calendar, MessageCircle, User,
  Shield, Heart, Menu, X, LogOut, DollarSign, ClipboardList
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const Logo = () => (
  <Link to="/" className="flex items-center gap-3 px-1 group">
    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary/25 to-peach/60 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
      <Heart className="w-4 h-4 text-primary" fill="currentColor" />
    </div>
    <div>
      <span className="font-display text-lg font-bold text-foreground tracking-tight block leading-none">CozyCare</span>
      <span className="text-[10px] text-muted-foreground font-body tracking-wide">Pouzdana obiteljska skrb</span>
    </div>
  </Link>
);

const navItems = {
  parent: [
    { path: '/', icon: Home, label: 'Početna' },
    { path: '/FindNannies', icon: Search, label: 'Pretraži dadilje' },
    { path: '/MyBookings', icon: Calendar, label: 'Rezervacije' },
    { path: '/Messages', icon: MessageCircle, label: 'Poruke' },
    { path: '/FamilySettings', icon: User, label: 'Moja obitelj' },
  ],
  nanny: [
    { path: '/', icon: Home, label: 'Početna' },
    { path: '/NannyBookings', icon: Calendar, label: 'Moje rezervacije' },
    { path: '/Messages', icon: MessageCircle, label: 'Poruke' },
    { path: '/Earnings', icon: DollarSign, label: 'Zarada' },
    { path: '/NannyProfile', icon: User, label: 'Moj profil' },
  ],
  admin: [
    { path: '/AdminDashboard', icon: Home, label: 'Nadzorna ploča' },
    { path: '/AdminApplications', icon: ClipboardList, label: 'Prijave' },
    { path: '/AdminBookings', icon: Calendar, label: 'Rezervacije' },
    { path: '/AdminReports', icon: Shield, label: 'Prijave problema' },
  ],
};

function NavLink({ item, active, onClick }) {
  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-primary/12 text-primary shadow-sm'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
      }`}
    >
      <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-primary' : ''}`} />
      {item.label}
    </Link>
  );
}

export default function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = user?.role || 'parent';
  const items = navItems[role] || navItems.parent;

  return (
    <div className="min-h-screen bg-background flex">

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border/60 bg-card/70 backdrop-blur-sm fixed inset-y-0 left-0 z-30">
        <div className="p-6 pb-5 border-b border-border/60">
          <Logo />
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {items.map((item) => {
            const active = item.path === '/'
              ? location.pathname === '/' || location.pathname === '/Home'
              : location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                item={item}
                active={active}
              />
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-border/60">
          <div className="flex items-center gap-3 px-2 py-2 mb-2 rounded-xl hover:bg-muted/40 transition-colors">
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
              {(user?.full_name || user?.email || '?')[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user?.display_name || user?.full_name || 'User'}</p>
              <p className="text-xs text-muted-foreground capitalize">{role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground text-xs rounded-xl"
            onClick={() => base44.auth.logout()}
          >
            <LogOut className="w-3.5 h-3.5 mr-2" />
            Odjava
          </Button>
        </div>
      </aside>

      {/* ── Mobile header ── */}
      <div className="lg:hidden fixed top-0 inset-x-0 h-14 bg-card/95 backdrop-blur-md border-b border-border/60 z-30 flex items-center justify-between px-4">
        <Logo />
        <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-card border-r border-border/60 p-5 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <Logo />
              <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setMobileOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <nav className="space-y-0.5">
              {items.map((item) => (
                <NavLink
                  key={item.path}
                  item={item}
                  active={location.pathname === item.path}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
            </nav>
            <div className="mt-6 pt-4 border-t border-border/60">
              <div className="flex items-center gap-3 px-2 py-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">
                  {(user?.full_name || user?.email || '?')[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{user?.display_name || user?.full_name || 'User'}</p>
                  <p className="text-xs text-muted-foreground capitalize">{role}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground rounded-xl"
                onClick={() => base44.auth.logout()}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Odjava
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Mobile bottom nav ── */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-card/97 backdrop-blur-md border-t border-border/60 z-30">
        <div className="flex items-center justify-around py-2">
          {items.slice(0, 5).map((item) => {
            const active = item.path === '/'
              ? location.pathname === '/' || location.pathname === '/Home'
              : location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10px] font-semibold transition-colors min-w-0 ${
                  active ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <item.icon className={`w-5 h-5 mb-0.5 ${active ? 'text-primary' : 'text-muted-foreground/70'}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Main content ── */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0 pb-24 lg:pb-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-7 lg:py-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}