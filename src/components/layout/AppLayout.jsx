import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import {
  Home, Search, Calendar, MessageCircle, User,
  Shield, Heart, LogOut, Euro, ClipboardList, ChevronRight, Settings, Bell, BookOpen } from
'lucide-react';
import { Button } from '@/components/ui/button';
import useUnreadMessages from '@/hooks/useUnreadMessages';
import useNotifications from '@/hooks/useNotifications';
import PublicHeader from '@/components/shared/PublicHeader';
import AdminRoleSwitcher from '@/components/layout/AdminRoleSwitcher';

const Logo = () =>
<Link to="/Landing" className="flex items-center gap-3 h-full px-3 -mx-2 group hover:bg-muted/40 transition-colors" style={{ touchAction: 'manipulation' }}>
    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary/25 to-peach/60 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow flex-shrink-0">
      <Heart className="w-4 h-4 text-primary" fill="currentColor" />
    </div>
    <div>
      <span className="font-display text-lg font-bold text-foreground tracking-tight block leading-none">CozyCare</span>
      <span className="text-[10px] text-muted-foreground font-body tracking-wide">Pouzdana obiteljska skrb</span>
    </div>
  </Link>;


const navItems = {
  parent: [
  { path: '/Home', icon: Home, label: 'Početna' },
  { path: '/FindNannies', icon: Search, label: 'Pretraži dadilje' },
  { path: '/MyBookings', icon: Calendar, label: 'Rezervacije' },
  { path: '/Messages', icon: MessageCircle, label: 'Poruke' },
  { path: '/Inbox', icon: Bell, label: 'Obavijesti' },
  { path: '/FamilySettings', icon: User, label: 'Moja obitelj' }],

  nanny: [
  { path: '/Home', icon: Home, label: 'Početna' },
  { path: '/NannyBookings', icon: Calendar, label: 'Moje rezervacije' },
  { path: '/Messages', icon: MessageCircle, label: 'Poruke' },
  { path: '/Inbox', icon: Bell, label: 'Obavijesti' },
  { path: '/Earnings', icon: Euro, label: 'Zarada' },
  { path: '/NannyProfile', icon: User, label: 'Moj profil' }],

  admin: [
  { path: '/AdminDashboard', icon: Home, label: 'Nadzorna ploča' },
  { path: '/AdminApplications', icon: ClipboardList, label: 'Prijave' },
  { path: '/AdminBookings', icon: Calendar, label: 'Rezervacije' },
  { path: '/AdminReports', icon: Shield, label: 'Prijave problema' },
  { path: '/AdminKB', icon: BookOpen, label: 'Baza znanja' }]

};

function NavLink({ item, active, onClick, badge }) {
  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      active ?
      'bg-primary/12 text-primary shadow-sm' :
      'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`
      }
      style={{ touchAction: 'manipulation' }}>
      
      <span className="relative flex-shrink-0">
        <item.icon className={`w-4 h-4 ${active ? 'text-primary' : ''}`} />
        {badge > 0 &&
        <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold leading-none">
            {badge > 99 ? '99+' : badge}
          </span>
        }
      </span>
      {item.label}
    </Link>);

}

const mobileTabNav = {
  parent: [
  { path: '/Home', icon: Home, label: 'Početna' },
  { path: '/FindNannies', icon: Search, label: 'Pretraži' },
  { path: '/MyBookings', icon: Calendar, label: 'Rezervacije' },
  { path: '/Messages', icon: MessageCircle, label: 'Poruke' },
  { path: '/FamilySettings', icon: User, label: 'Profil' }],

  nanny: [
  { path: '/Home', icon: Home, label: 'Početna' },
  { path: '/NannyBookings', icon: Calendar, label: 'Rezervacije' },
  { path: '/Messages', icon: MessageCircle, label: 'Poruke' },
  { path: '/Earnings', icon: Euro, label: 'Zarada' },
  { path: '/NannyProfile', icon: User, label: 'Profil' }],

  admin: [
  { path: '/AdminDashboard', icon: Home, label: 'Nadzorna' },
  { path: '/AdminApplications', icon: ClipboardList, label: 'Prijave' },
  { path: '/AdminBookings', icon: Calendar, label: 'Rezervacije' },
  { path: '/AdminReports', icon: Shield, label: 'Problemi' }]

};

const ROLE_LABELS = {
  parent: 'Roditelj',
  nanny: 'Dadilja',
  admin: 'Administrator',
};

export default function AppLayout() {
  const { user, isAuthenticated, logout, navigateToLogin, effectiveRole } = useAuth();
  const location = useLocation();
  const role = effectiveRole || 'parent';
  const items = navItems[role] || navItems.parent;
  const mobileTabItems = mobileTabNav[role] || mobileTabNav.parent;
  const { unreadCount } = useUnreadMessages();
  const { count: notificationsCount } = useNotifications();

  // Public/guest users get a minimal shell with PublicHeader — no sidebar, no account UI
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col w-full max-w-full">
        <PublicHeader />
        <main className="flex-1 min-w-0 pt-14 lg:pt-16 pb-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-7 lg:py-12 w-full">
            <Outlet />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex overflow-x-hidden w-full max-w-full">

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border/60 bg-card/70 backdrop-blur-sm fixed inset-y-0 left-0 z-30">
        {/* Brand */}
        <div className="p-6 pb-5 border-b border-border/60">
          <Logo />
        </div>

        {/* Main navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {items.map((item) => {
            const active = item.path === '/Home' ?
            location.pathname === '/' || location.pathname === '/Home' :
            item.path === '/AdminKB' ?
            location.pathname === '/AdminKB' || location.pathname.startsWith('/AdminKB/') :
            location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                item={item}
                active={active}
                badge={item.path === '/Inbox' ? notificationsCount : item.path === '/Messages' ? unreadCount : 0} />);
          })}
        </nav>

        {/* Bottom section: role switcher + profile + logout */}
        <div className="border-t border-border/60">
          {/* Admin role switcher */}
          {(user?.app_role === 'admin' || user?.role === 'admin') && (
            <div className="px-4 pt-4 pb-2">
              <AdminRoleSwitcher />
            </div>
          )}

          {/* Profile / settings button */}
          <div className="px-4 pt-2 pb-2">
            <Link
              to={role === 'nanny' ? '/NannyProfile' : role === 'admin' ? '/AdminDashboard' : '/FamilySettings'}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group"
              aria-label="Postavke profila"
              style={{ touchAction: 'manipulation' }}
            >
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                {(user?.display_name || user?.full_name || user?.email || '?')[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{user?.display_name || user?.full_name || (user?.email ? user.email.split('@')[0] : 'Korisnik')}</p>
                <p className="text-[11px] text-muted-foreground">{ROLE_LABELS[role] || role}</p>
              </div>
              <Settings className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
            </Link>
          </div>

          {/* Logout */}
          <div className="px-4 pb-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground text-xs rounded-xl min-h-[36px] px-4 py-2"
              onClick={() => logout()}
              style={{ touchAction: 'manipulation' }}>
              <LogOut className="w-4 h-4 mr-2" />
              Odjava
            </Button>
          </div>
        </div>
      </aside>

      {/* ── Mobile header ── */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-30 border-b border-border/60">
        <div className="absolute inset-0 bg-card/95 backdrop-blur-md pointer-events-none" aria-hidden="true" />
        <div className="relative h-14 flex items-center justify-between px-4">
          <Logo />
          <div className="flex items-center gap-2">
            {isAuthenticated && (role === 'parent' || role === 'nanny') && (
              <Link
                to="/Inbox"
                className="relative inline-flex items-center justify-center h-11 w-11 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                aria-label="Obavijesti"
                style={{ touchAction: 'manipulation' }}>
                <Bell className="w-5 h-5" />
                {notificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold leading-none">
                    {notificationsCount > 99 ? '99+' : notificationsCount}
                  </span>
                )}
              </Link>
            )}
            {isAuthenticated ?
              <Button
                variant="ghost"
                className="text-xs text-muted-foreground hover:text-foreground gap-1.5 h-11 px-4"
                onClick={() => logout()}
                style={{ touchAction: 'manipulation' }}>
                <LogOut className="w-4 h-4" />
                Odjava
              </Button> :
              <Button
                variant="ghost"
                className="text-xs text-muted-foreground hover:text-foreground h-11 px-4"
                onClick={() => navigateToLogin()}
                style={{ touchAction: 'manipulation' }}>
                Prijava
              </Button>
            }
          </div>
        </div>
        {(user?.app_role === 'admin' || user?.role === 'admin') && (
          <div className="relative px-4 pb-3">
            <AdminRoleSwitcher />
          </div>
        )}
      </div>

      {/* ── Mobile bottom tab bar ── */}
      <div
        className="lg:hidden fixed bottom-0 inset-x-0 z-30"
        style={{
          background: 'rgba(255,255,255,0.75)',
          borderTop: '1px solid rgba(255,255,255,0.4)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)'
        }}>
        
        <div className="bg-transparent py-2 opacity-95 flex items-center justify-around">
          {mobileTabItems.map((item) => {
            const active = item.path === '/Home' ?
            location.pathname === '/' || location.pathname === '/Home' :
            location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10px] font-semibold transition-colors min-w-0 ${
                active ? 'text-primary' : 'text-muted-foreground'}`
                }
                style={{ touchAction: 'manipulation' }}>
                
                <span className="relative">
                  <item.icon className={`w-5 h-5 mb-0.5 ${active ? 'text-primary' : 'text-muted-foreground/70'}`} />
                  {item.path === '/Messages' && unreadCount > 0 &&
                  <span className="absolute -top-1 -right-1.5 min-w-[14px] h-3.5 px-0.5 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold leading-none">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  }
                </span>
                <span className="truncate">{item.label}</span>
              </Link>);

          })}
        </div>
      </div>

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 lg:ml-64 pt-14 lg:pt-0 pb-24 lg:pb-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-7 lg:py-12 w-full">
          <Outlet />
        </div>
      </main>
    </div>);

}