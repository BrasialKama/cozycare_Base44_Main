import { Link, useRouterState } from '@tanstack/react-router';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Heart, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { login, logout, isAuthenticated, loading, intent } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouterState();
  const path = router.location.pathname;

  const isActive = (href: string) =>
    path === href || path.startsWith(href + '/');

  const navLink =
    'text-sm font-medium text-muted-foreground transition-colors hover:text-primary';
  const navLinkActive = 'text-sm font-medium text-primary';

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/85 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <Heart className="h-4.5 w-4.5 fill-current" />
            </div>
            <span className="font-serif text-xl font-bold text-foreground tracking-tight">CozyCare</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/start"
              className={isActive('/start') || isActive('/parent') ? navLinkActive : navLink}
            >
              Find a Nanny
            </Link>
            <Link
              to="/nannies"
              className={isActive('/nannies') ? navLinkActive : navLink}
            >
              Browse Nannies
            </Link>
            <Link
              to="/auth/choose?role=nanny"
              className={isActive('/nanny') ? navLinkActive : navLink}
            >
              Nanny Portal
            </Link>
          </div>

          {/* Desktop auth actions */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="h-8 w-24 rounded-full bg-muted animate-pulse" />
            ) : isAuthenticated ? (
              <>
                <Link
                  to={intent === 'nanny' ? '/nanny/dashboard' : '/parent/account'}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  {intent === 'nanny' ? 'My Dashboard' : 'My Profile'}
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => login(`${window.location.origin}/auth/choose`)}
                  className="text-sm font-medium"
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => login(`${window.location.origin}/parent/account`, 'parent')}
                  className="h-9 rounded-full px-5 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 text-sm"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted/60 transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background/97 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6 flex flex-col gap-5">
            <Link to="/start" onClick={() => setMobileOpen(false)} className={navLink}>
              Find a Nanny
            </Link>
            <Link to="/nannies" onClick={() => setMobileOpen(false)} className={navLink}>
              Browse Nannies
            </Link>
            <Link to="/auth/choose?role=nanny" onClick={() => setMobileOpen(false)} className={navLink}>
              Nanny Portal
            </Link>
            <div className="border-t pt-4 flex flex-col gap-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to={intent === 'nanny' ? '/nanny/dashboard' : '/parent/account'}
                    onClick={() => setMobileOpen(false)}
                    className="text-sm font-medium text-foreground"
                  >
                    {intent === 'nanny' ? 'My Dashboard' : 'My Profile'}
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => { logout(); setMobileOpen(false); }} className="rounded-full w-full">
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { login(`${window.location.origin}/auth/choose`); setMobileOpen(false); }}
                    className="rounded-full w-full"
                  >
                    Sign In
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => { login(`${window.location.origin}/parent/account`, 'parent'); setMobileOpen(false); }}
                    className="h-10 rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 w-full"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
