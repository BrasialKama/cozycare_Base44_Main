import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function LandingHeader() {
  const { isAuthenticated, logout, navigateToLogin } = useAuth();

  const navItems = [
    { label: 'Pretraži dadilje', to: '/FindNannies' },
    { label: 'Portal za dadilje', to: '/NannyPortal' },
  ];

  return (
    <>
      {/* Fixed header bar */}
      <header
        className="hidden md:flex fixed top-0 left-0 right-0 z-50 h-16 items-center justify-between px-4 sm:px-6 lg:px-8"
        style={{
          background: 'rgba(255,253,248,0.55)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(200,142,142,0.12)',
        }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 py-2.5 px-3 -mx-3 rounded-xl hover:bg-black/5 transition-colors">
          <div className="w-9 h-9 rounded-full bg-primary/90 flex items-center justify-center">
            <Heart className="w-4.5 h-4.5 text-white fill-white" />
          </div>
          <span className="font-display text-xl font-bold text-foreground tracking-tight">CozyCare</span>
        </Link>

        {/* Desktop nav — hidden on mobile, landing page only shows these links */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors px-4 py-2.5 rounded-xl hover:bg-black/5 min-h-[40px] flex items-center"
            >
              {item.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <button
              onClick={() => logout()}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors px-4 py-2.5 rounded-xl hover:bg-black/5 min-h-[40px]"
            >
              <LogOut className="w-3.5 h-3.5" />
              Odjava
            </button>
          ) : (
            <button
              onClick={() => navigateToLogin()}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors px-4 py-2.5 rounded-xl hover:bg-primary/5 min-h-[40px]"
            >
              <LogIn className="w-3.5 h-3.5" />
              Prijava
            </button>
          )}
        </nav>

        {/* No mobile hamburger — mobile uses bottom tab bar in AppLayout */}
      </header>
    </>
  );
}