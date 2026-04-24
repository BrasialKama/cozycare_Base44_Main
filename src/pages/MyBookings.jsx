import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Star, Heart, ArrowRight, Search, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import DisputeBookingDialog from '@/components/bookings/DisputeBookingDialog';

const STATUS_STYLES = {
  'Na čekanju': 'bg-peach/50 text-peach-dark',
  'Potvrđeno': 'bg-sage/30 text-sage-foreground',
  'Završeno': 'bg-muted text-muted-foreground',
  'Otkazano': 'bg-destructive/10 text-destructive',
  'Odbijeno': 'bg-destructive/10 text-destructive',
};

function BookingCard({ booking, onCancel }) {
  const initial = (booking.nanny_name || 'N')[0];
  const [disputeOpen, setDisputeOpen] = useState(false);
  const queryClient = useQueryClient();

  const DISPUTE_WINDOW_DAYS = 7;
  const withinDisputeWindow = (() => {
    if (booking.status !== 'Završeno') return false;
    if (!booking.date) return false;
    const ageDays = (Date.now() - Date.parse(booking.date)) / (1000 * 60 * 60 * 24);
    return ageDays <= DISPUTE_WINDOW_DAYS;
  })();

  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden hover:shadow-md hover:border-primary/15 transition-all duration-200">
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Nanny avatar */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-light to-peach/60 flex items-center justify-center flex-shrink-0 text-lg font-display font-bold text-primary shadow-sm">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h3 className="font-display font-bold text-base text-foreground leading-tight">{booking.nanny_name || 'Vaša dadilja'}</h3>
                <span className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full mt-1 capitalize ${STATUS_STYLES[booking.status] || 'bg-muted text-muted-foreground'}`}>
                  {booking.status?.replace('_', ' ')}
                </span>
              </div>
              <p className="font-display font-bold text-primary text-lg flex-shrink-0">
                €{booking.total_price?.toFixed(2)}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-lg">
                <Calendar className="w-3 h-3" /> {booking.date}
              </span>
              <span className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-lg">
                <Clock className="w-3 h-3" /> {booking.start_time}–{booking.end_time}
                {booking.duration_hours ? ` (${booking.duration_hours}h)` : ''}
              </span>
            </div>

            {booking.message && (
              <p className="text-xs text-muted-foreground mt-2.5 italic line-clamp-1 leading-relaxed">
                "{booking.message}"
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      {(booking.status === 'Na čekanju' || booking.status === 'Završeno' || booking.status === 'Odbijeno') && (
        <div className="border-t border-border/40 px-5 py-3 flex justify-end gap-2 bg-muted/20">
          {booking.status === 'Na čekanju' && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
              onClick={() => onCancel(booking.id)}
            >
              Otkaži rezervaciju
            </Button>
          )}
          {booking.status === 'Odbijeno' && (
            <Link to="/FindNannies">
              <Button variant="ghost" size="sm" className="text-xs text-primary hover:bg-primary/8 rounded-xl">
                <Search className="w-3 h-3 mr-1.5" /> Pronađi drugu dadilju
              </Button>
            </Link>
          )}
          {booking.status === 'Završeno' && (
            <>
              {booking.disputed ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200">
                  <CheckCircle2 className="w-3 h-3" /> Prijavljeno — CozyCare tim provjerava
                </span>
              ) : withinDisputeWindow ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                  onClick={() => setDisputeOpen(true)}
                >
                  <AlertTriangle className="w-3 h-3 mr-1.5" /> Prijavi problem
                </Button>
              ) : null}
              <Link to={`/LeaveReview?booking_id=${booking.id}`}>
                <Button variant="ghost" size="sm" className="text-xs text-primary hover:bg-primary/8 rounded-xl">
                  <Star className="w-3 h-3 mr-1.5 fill-current" /> Ostavi recenziju
                </Button>
              </Link>
            </>
          )}
        </div>
      )}
      <DisputeBookingDialog
        booking={booking}
        open={disputeOpen}
        onOpenChange={setDisputeOpen}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['parentBookings'] })}
      />
    </div>
  );
}

export default function MyBookings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['parentBookings', user?.email],
    queryFn: () => base44.entities.Booking.filter({ family_user_email: user?.email }, '-date'),
    enabled: !!user?.email,
  });

  const cancelMutation = useMutation({
    mutationFn: async (id) => {
      const resp = await base44.functions.invoke('updateBooking', {
        booking_id: id,
        updates: { status: 'Otkazano' },
      });
      const data = resp?.data || resp;
      if (!data?.success) throw new Error(data?.error || 'Otkazivanje nije uspjelo.');
      return data.booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parentBookings'] });
      toast.success('Rezervacija otkazana');
    },
  });

  const upcoming = bookings.filter(b => ['Na čekanju', 'Potvrđeno'].includes(b.status));
  const past = bookings.filter(b => ['Završeno', 'Otkazano', 'Odbijeno'].includes(b.status));

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div>
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-primary/60 mb-2">
          <Heart className="w-3 h-3" fill="currentColor" /> Vaši termini
        </p>
        <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground">Moje rezervacije</h1>
        <p className="text-sm text-muted-foreground mt-1.5">Upravljajte nadolazećim i prošlim terminima skrbi.</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted/40 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="mb-5 bg-muted/50 rounded-2xl p-1 h-auto">
            <TabsTrigger value="upcoming" className="rounded-xl text-sm font-semibold px-5 py-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              Nadolazeći {upcoming.length > 0 && <span className="ml-2 bg-primary/15 text-primary text-xs px-2 py-0.5 rounded-full font-bold">{upcoming.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="past" className="rounded-xl text-sm font-semibold px-5 py-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              Prošli {past.length > 0 && <span className="ml-2 bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full font-bold">{past.length}</span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcoming.length === 0 ? (
              <div className="text-center py-16 bg-card border border-dashed border-border/60 rounded-3xl">
                <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-primary/40" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-1.5">Nema nadolazećih termina</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                  Pronađite dadilju koju volite i rezervirajte prvi termin zajedno.
                </p>
                <Link to="/FindNannies">
                  <Button className="rounded-full px-7">
                    <Search className="w-4 h-4 mr-2" /> Pronađi dadilju
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map(b => <BookingCard key={b.id} booking={b} onCancel={cancelMutation.mutate} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {past.length === 0 ? (
              <div className="text-center py-16 bg-card border border-dashed border-border/60 rounded-3xl">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <p className="text-muted-foreground text-sm">Vaši završeni termini će se pojaviti ovdje.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {past.map(b => <BookingCard key={b.id} booking={b} onCancel={cancelMutation.mutate} />)}
                <div className="text-center pt-4">
                  <Link to="/FindNannies" className="text-sm text-primary font-medium inline-flex items-center gap-1.5 hover:underline">
                    Rezerviraj novi termin <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}