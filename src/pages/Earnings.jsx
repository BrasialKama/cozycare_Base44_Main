import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Euro, TrendingUp, Calendar, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';

export default function Earnings() {
  const { user } = useAuth();

  // First get the nanny's profile to know their nanny_id
  const { data: nannyProfile } = useQuery({
    queryKey: ['nannyProfileForEarnings', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.NannyProfile.filter({ user_email: user?.email }, '-created_date', 1);
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });

  const nannyName = nannyProfile ? `${nannyProfile.first_name} ${nannyProfile.last_name}` : null;

  // Then fetch only bookings that belong to this nanny AND are completed
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['nannyEarnings', user?.email],
    queryFn: async () => {
      const all = await base44.entities.Booking.filter({ nanny_user_email: user?.email }, '-date');
      return all.filter(b => b.status === 'Završeno');
    },
    enabled: !!user?.email,
  });

  const totalEarnings = bookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
  const totalHours = bookings.reduce((sum, b) => sum + (b.duration_hours || 0), 0);
  const avgPerBooking = bookings.length > 0 ? totalEarnings / bookings.length : 0;

  return (
    <div>
      <PageHeader icon={Euro} title="Zarada" subtitle="Pratite svoje prihode i završene rezervacije" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { icon: Euro, label: 'Ukupna zarada', value: `€${totalEarnings.toFixed(2)}`, color: 'bg-primary/8 text-primary' },
          { icon: Calendar, label: 'Završeni poslovi', value: bookings.length, color: 'bg-sage/30 text-sage-foreground' },
          { icon: Clock, label: 'Ukupno sati', value: `${totalHours.toFixed(1)}h`, color: 'bg-peach/50 text-peach-dark' },
          { icon: TrendingUp, label: 'Prosj. po rezervaciji', value: `€${avgPerBooking.toFixed(2)}`, color: 'bg-powder-blue/40 text-foreground' },
        ].map((stat) => (
          <Card key={stat.label} className="p-4 border-border/60">
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-2`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-xl font-display font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Transaction history */}
      <h2 className="font-display font-semibold text-lg mb-4">Povijest zarade</h2>
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted/40 rounded-2xl animate-pulse" />)}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 bg-card border border-dashed border-border/60 rounded-3xl">
          <div className="w-16 h-16 rounded-2xl bg-sage/15 flex items-center justify-center mx-auto mb-4">
            <Euro className="w-8 h-8 text-sage-foreground/40" />
          </div>
          <h3 className="font-display font-semibold text-lg text-foreground mb-1.5">Još nema zarade</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">Vaša zarada će se pojaviti ovdje nakon što završite prve rezervacije.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {bookings.map(b => (
            <Card key={b.id} className="p-4 border-border/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{b.family_name || 'Obitelj'}</p>
                  <p className="text-xs text-muted-foreground">{b.date} · {b.duration_hours}h</p>
                </div>
                <p className="font-display font-semibold text-primary">+€{b.total_price?.toFixed(2)}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}