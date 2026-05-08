import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, Search, Users, LogIn, Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';

const NAV_ITEMS = [
  { label: 'Pronađi dadilju', to: '/FindNannies', icon: Search },
  { label: 'Portal za dadilje', to: '/NannyOnboarding', icon: Users },
];

export default function PublicHeader() {
  const { isAuthenticated, navigateToLogin } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 h-14 lg:h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8"
        style={{
          background: 'rgba(255,253,248,0.85)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(200,142,142,0.12)',
        }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 py-2 px-2 -mx-2 rounded-xl hover:bg-black/5 transition-colors" style={{ touchAction: 'manipulation' }}>
          <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-primary/90 flex items-center justify-center flex-shrink-0">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-display text-lg font-bold text-foreground tracking-tight">CozyCare</span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden sm:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors px-3 lg:px-4 py-2 rounded-xl min-h-[36px] ${
                  active
                    ? 'text-primary bg-primary/8'
                    : 'text-foreground/70 hover:text-foreground hover:bg-black/5'
                }`}
                style={{ touchAction: 'manipulation' }}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            );
          })}

          {isAuthenticated ? (
            <Link to="/Home" style={{ touchAction: 'manipulation' }}>
              <Button size="sm" className="rounded-xl text-xs h-9 px-4 ml-1" style={{ touchAction: 'manipulation' }}>
                Moj račun
              </Button>
            </Link>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl text-xs h-9 px-4 ml-1 border-primary/30 text-primary hover:bg-primary/5"
              onClick={() => navigateToLogin()}
              style={{ touchAction: 'manipulation' }}
            >
              <LogIn className="w-3.5 h-3.5 mr-1.5" />
              Prijava
            </Button>
          )}
        </nav>

        {/* Mobile: Prijava + hamburger */}
        <div className="flex sm:hidden items-center gap-1.5">
          {isAuthenticated ? (
            <Link to="/Home" style={{ touchAction: 'manipulation' }}>
              <Button size="sm" className="rounded-xl text-xs h-8 px-3" style={{ touchAction: 'manipulation' }}>
                Moj račun
              </Button>
            </Link>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl text-xs h-8 px-3 border-primary/30 text-primary"
              onClick={() => navigateToLogin()}
              style={{ touchAction: 'manipulation' }}
            >
              <LogIn className="w-3.5 h-3.5 mr-1" />
              Prijava
            </Button>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors"
            aria-label="Izbornik"
            style={{ touchAction: 'manipulation' }}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <div
          className="fixed top-14 left-0 right-0 z-40 sm:hidden border-b border-border/40 py-2 px-4"
          style={{
            background: 'rgba(255,253,248,0.95)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
          }}
        >
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 text-sm font-medium px-3 py-3 rounded-xl transition-colors ${
                  active
                    ? 'text-primary bg-primary/8'
                    : 'text-foreground/80 hover:bg-muted/40'
                }`}
                style={{ touchAction: 'manipulation' }}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}