import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, LogOut, LogIn, Search, Users } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';

export default function LandingHeader() {
  const { user, isAuthenticated, logout, navigateToLogin } = useAuth();
  const navigate = useNavigate();

  const handleNannyPortalClick = () => {
    if (!isAuthenticated) {
      // Send them to login; after login, drop them on /Onboarding (role selection)
      navigateToLogin(window.location.origin + '/Onboarding');
      return;
    }
    if (user?.role === 'nanny' || user?.role === 'admin') {
      navigate('/NannyPortal');
    } else {
      // Authenticated but role is 'user' or 'parent' — send them through role selection
      navigate('/Onboarding');
    }
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 h-14 md:h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8"
        style={{
          background: 'rgba(255,253,248,0.55)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(200,142,142,0.12)',
        }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 py-2 px-2 -mx-2 rounded-xl hover:bg-black/5 transition-colors">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-primary/90 flex items-center justify-center flex-shrink-0">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-display text-lg md:text-xl font-bold text-foreground tracking-tight">CozyCare</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          <Link
            to="/FindNannies"
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors px-3 lg:px-4 py-2 rounded-xl hover:bg-black/5 min-h-[36px]"
          >
            <Search className="w-3.5 h-3.5" />
            Pronađi dadilju
          </Link>

          <button
            type="button"
            onClick={handleNannyPortalClick}
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors px-3 lg:px-4 py-2 rounded-xl hover:bg-black/5 min-h-[36px]"
          >
            <Users className="w-3.5 h-3.5" />
            Portal za dadilje
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-1 ml-1">
              <Link to="/Home">
                <Button size="sm" className="rounded-xl text-xs h-9 px-4">
                  Moj račun
                </Button>
              </Link>
              <button
                onClick={() => logout()}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors px-3 py-2 rounded-xl hover:bg-black/5 min-h-[36px]"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl text-xs h-9 px-4 ml-1 border-primary/30 text-primary hover:bg-primary/5"
              onClick={() => navigateToLogin()}
            >
              <LogIn className="w-3.5 h-3.5 mr-1.5" />
              Prijava
            </Button>
          )}
        </nav>
      </header>
    </>
  );
}