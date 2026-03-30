import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Menu, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    base44.auth.logout('/');
  };

  const navItems = [
    { label: 'Pronađi dadilju', to: '/FindNannies' },
    { label: 'Pretraži dadilje', to: '/FindNannies', highlight: true },
    { label: 'Portal za dadilje', to: '/NannyPortal' },
    { label: 'Moj profil', to: '/FamilySettings' },
  ];

  return (
    <>
      {/* Fixed header bar */}
      <header
        className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8"
        style={{
          background: 'rgba(255,253,248,0.55)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(200,142,142,0.12)',
        }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-primary/90 flex items-center justify-center">
            <Heart className="w-4.5 h-4.5 text-white fill-white" />
          </div>
          <span className="font-display text-xl font-bold text-foreground tracking-tight">CozyCare</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`text-sm font-medium transition-colors ${
                item.highlight
                  ? 'text-primary hover:text-primary/80'
                  : 'text-foreground/70 hover:text-foreground'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={handleSignOut}
            className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            Odjava
          </button>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden w-10 h-10 flex items-center justify-center"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6 text-foreground" />
        </button>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60]" onClick={() => setMenuOpen(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-foreground/20" />

          {/* Menu panel */}
          <div
            className="absolute top-0 left-0 right-0 flex flex-col"
            style={{
              background: 'rgba(255,253,248,0.88)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderBottom: '1px solid rgba(200,142,142,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Menu header */}
            <div className="h-16 flex items-center justify-between px-4">
              <Link to="/" className="flex items-center gap-2.5" onClick={() => setMenuOpen(false)}>
                <div className="w-9 h-9 rounded-full bg-primary/90 flex items-center justify-center">
                  <Heart className="w-4.5 h-4.5 text-white fill-white" />
                </div>
                <span className="font-display text-xl font-bold text-foreground tracking-tight">CozyCare</span>
              </Link>
              <button
                className="w-10 h-10 flex items-center justify-center"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                <X className="w-6 h-6 text-foreground" />
              </button>
            </div>

            {/* Menu items */}
            <nav className="flex flex-col px-4 pb-6 pt-2">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={`py-4 text-base font-medium border-b border-border/30 transition-colors ${
                    item.highlight
                      ? 'text-primary'
                      : 'text-foreground/80 hover:text-foreground'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {/* Sign Out button */}
              <div className="pt-6">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleSignOut();
                  }}
                  className="w-full py-3 rounded-full border border-border/50 text-base font-medium text-foreground/80 hover:bg-muted/50 transition-colors"
                  style={{
                    background: 'rgba(255,253,248,0.6)',
                  }}
                >
                  Odjava
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}