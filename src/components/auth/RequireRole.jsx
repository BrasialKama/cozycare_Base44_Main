import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

/**
 * Route guard that restricts access by user role.
 *
 * Usage in router:
 *   <Route element={<RequireRole allowed={['admin']} />}>
 *     <Route path="/AdminDashboard" element={<AdminDashboard />} />
 *   </Route>
 *
 * Props:
 *   allowed  – array of role strings that may access child routes
 *   redirect – optional path to redirect unauthenticated users (default: "/")
 */
export default function RequireRole({ allowed = [], redirect = '/' }) {
  const { user, isAuthenticated, navigateToLogin } = useAuth();

  // Not logged in → redirect to landing / login
  if (!isAuthenticated || !user) {
    return <Navigate to={redirect} replace />;
  }

  const realRole = user.app_role || (user.role === 'admin' ? 'admin' : null);

  // Admins always pass — they may be viewing as another role
  // but should still access admin-only or nanny-only routes via the role switcher
  if (realRole === 'admin' || user.role === 'admin') {
    return <Outlet />;
  }

  // Logged in but wrong role → show friendly "access denied"
  if (!allowed.includes(realRole)) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-5">
          <ShieldAlert className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="font-display text-xl font-bold text-foreground mb-2">
          Nemate pristup ovoj stranici
        </h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Ova stranica je namijenjena samo za{' '}
          {allowed.map(r =>
            r === 'admin' ? 'administratore' :
            r === 'nanny' ? 'dadilje' :
            r === 'parent' ? 'roditelje' : r
          ).join(' i ')}.
          Ako mislite da bi trebali imati pristup, obratite se podršci.
        </p>
        <Link to="/Home">
          <Button className="rounded-2xl px-8">Povratak na početnu</Button>
        </Link>
      </div>
    );
  }

  // Role matches → render child routes
  return <Outlet />;
}