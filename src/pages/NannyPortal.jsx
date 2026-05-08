import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sparkles } from 'lucide-react';
import NannyChecklist from '@/components/portal/NannyChecklist';
import PortalUpcomingBookings from '@/components/portal/PortalUpcomingBookings';
import PortalEarningsCard from '@/components/portal/PortalEarningsCard';
import PortalReviewsCard from '@/components/portal/PortalReviewsCard';

export default function NannyPortal() {
  const { user } = useAuth();
  // Use app_role (parent/nanny/admin), not user.role (platform role, usually "user").
  // Route-level RequireRole already ensures only nannies/admins reach this page,
  // so we just need the right role for the data-fetch enable flag.
  const appRole = user?.app_role || (user?.role === 'admin' ? 'admin' : null);
  const canFetch = appRole === 'nanny' || appRole === 'admin';

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['portalProfile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.NannyProfile.filter({ user_email: user?.email }, '-created_date', 1);
      return profiles[0] || null;
    },
    enabled: !!user?.email && canFetch,
  });

  const { data: bookings = [], isLoading: loadingBookings } = useQuery({
    queryKey: ['portalBookings', user?.email],
    queryFn: () => base44.entities.Booking.filter({ nanny_user_email: user?.email }, '-date', 20),
    enabled: !!user?.email && canFetch,
  });

  const { data: reviews = [], isLoading: loadingReviews } = useQuery({
    queryKey: ['portalReviews', profile?.id],
    queryFn: () => base44.entities.Review.filter({ nanny_profile_id: profile?.id }, '-created_date', 5),
    enabled: !!profile?.id,
  });

  const isLoading = loadingProfile || loadingBookings || loadingReviews;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-40 bg-muted/40 rounded-3xl animate-pulse" />
        <div className="h-32 bg-muted/40 rounded-2xl animate-pulse" />
        <div className="h-32 bg-muted/40 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-peach/25 to-ivory border border-primary/15 shadow-sm">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-primary/6 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 w-36 h-36 rounded-full bg-sage/10 blur-3xl pointer-events-none" />
        <div className="relative px-7 py-10 lg:px-12 lg:py-12">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-primary/70 mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Portal za dadilje
          </p>
          <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground leading-tight">
            Dobrodošli u vaš portal
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-md leading-relaxed">
            Upravljajte svojim profilom i rezervacijama
          </p>
        </div>
      </section>

      {/* Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NannyChecklist profile={profile} />
        <PortalEarningsCard bookings={bookings} />
        <PortalUpcomingBookings bookings={bookings} />
        <PortalReviewsCard reviews={reviews} avgRating={profile?.rating} totalReviews={profile?.review_count} />
      </div>
    </div>
  );
}