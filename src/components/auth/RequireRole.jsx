import React from 'react';
import { Navigate, Outlet, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ShieldAlert, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const realRole = user?.app_role || (user?.role === 'admin' ? 'admin' : null);
  const isNannyRoute = allowed.includes('nanny');

  // Pre-fetch this user's NannyProfile so we can detect the "pending approval" case below.
  // Only fetch when the user is a self-declared nanny on a nanny route — keeps it cheap.
  // Tight staleTime + window-focus refetch so newly-approved nannies pick up the change quickly.
  const { data: nannyProfile } = useQuery({
    queryKey: ['myNannyProfile', user?.email],
    queryFn: async () => {
      const list = await base44.entities.NannyProfile.filter({ user_email: user?.email }, '-updated_date', 1);
      return list?.[0] || null;
    },
    enabled: !!user?.email && realRole === 'nanny' && isNannyRoute,
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });

  // Not logged in → redirect to landing / login
  if (!isAuthenticated || !user) {
    return <Navigate to={redirect} replace />;
  }

  // Admins always pass — they may be viewing as another role
  // but should still access admin-only or nanny-only routes via the role switcher
  if (realRole === 'admin' || user.role === 'admin') {
    return <Outlet />;
  }

  // Nanny on a nanny-only route, but profile isn't approved yet → friendly "in review" screen
  if (isNannyRoute && realRole === 'nanny' && nannyProfile && nannyProfile.status !== 'approved') {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4 px-4">
        <Clock className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-semibold">Vaš profil je u obradi</h2>
        <p className="text-muted-foreground">
          Naš tim trenutno pregledava vaš profil. Javit ćemo vam čim bude odobren.
          Obično traje 1-2 radna dana.
        </p>
        <p className="text-xs text-muted-foreground">
          U međuvremenu možete pregledati i ažurirati svoj profil.
        </p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Link to="/NannyOnboarding">
            <Button variant="outline">Uredi profil</Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['myNannyProfile', user?.email] })}
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Provjeri ponovno
          </Button>
        </div>
      </div>
    );
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