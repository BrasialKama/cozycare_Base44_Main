import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sparkles, Heart } from 'lucide-react';
import ProfileCompletionCard from '@/components/portal/ProfileCompletionCard';
import PortalUpcomingBookings from '@/components/portal/PortalUpcomingBookings';
import PortalEarningsCard from '@/components/portal/PortalEarningsCard';
import PortalReviewsCard from '@/components/portal/PortalReviewsCard';

export default function NannyPortal() {
  const { user } = useAuth();
  const role = user?.role;

  const { data: profile } = useQuery({
    queryKey: ['portalProfile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.NannyProfile.filter({ user_email: user?.email }, '-created_date', 1);
      return profiles[0] || null;
    },
    enabled: !!user?.email && role === 'nanny',
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['portalBookings', user?.email],
    queryFn: () => base44.entities.Booking.filter({ nanny_user_email: user?.email }, '-date', 20),
    enabled: !!user?.email && role === 'nanny',
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['portalReviews', profile?.id],
    queryFn: () => base44.entities.Review.filter({ nanny_profile_id: profile?.id }, '-created_date', 5),
    enabled: !!profile?.id,
  });

  // Gate: only nanny role
  if (role && role !== 'nanny') {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Heart className="w-10 h-10 text-primary/30 mb-4" />
        <h2 className="font-display text-xl font-semibold text-foreground mb-1">Ova stranica je namijenjena dadiljama.</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          Ako ste dadilja i želite pristupiti portalu, prijavite se sa svojim računom dadilje.
        </p>
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
        <ProfileCompletionCard profile={profile} />
        <PortalEarningsCard bookings={bookings} />
        <PortalUpcomingBookings bookings={bookings} />
        <PortalReviewsCard reviews={reviews} avgRating={profile?.rating} totalReviews={profile?.review_count} />
      </div>
    </div>
  );
}