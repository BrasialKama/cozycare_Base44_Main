import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { DollarSign, TrendingUp, Calendar, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';

export default function Earnings() {
  const { user } = useAuth();

  const { data: bookings = [] } = useQuery({
    queryKey: ['nannyEarnings', user?.email],
    queryFn: () => base44.entities.Booking.filter({ nanny_email: user?.email, status: 'completed' }, '-date'),
    enabled: !!user?.email,
  });

  const totalEarnings = bookings.reduce((sum, b) => sum + (b.nanny_payout || 0), 0);
  const totalHours = bookings.reduce((sum, b) => sum + (b.hours || 0), 0);
  const avgPerBooking = bookings.length > 0 ? totalEarnings / bookings.length : 0;

  return (
    <div>
      <PageHeader icon={DollarSign} title="Earnings" subtitle="Track your income and completed bookings" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { icon: DollarSign, label: 'Total Earnings', value: `$${totalEarnings.toFixed(2)}`, color: 'bg-primary/8 text-primary' },
          { icon: Calendar, label: 'Completed Jobs', value: bookings.length, color: 'bg-sage/30 text-sage-foreground' },
          { icon: Clock, label: 'Total Hours', value: `${totalHours.toFixed(1)}h`, color: 'bg-peach/50 text-peach-dark' },
          { icon: TrendingUp, label: 'Avg per Booking', value: `$${avgPerBooking.toFixed(2)}`, color: 'bg-powder-blue/40 text-foreground' },
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
      <h2 className="font-display font-semibold text-lg mb-4">Earning History</h2>
      {bookings.length === 0 ? (
        <EmptyState icon={DollarSign} title="No earnings yet" description="Complete bookings to start earning" />
      ) : (
        <div className="space-y-2">
          {bookings.map(b => (
            <Card key={b.id} className="p-4 border-border/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{b.parent_name || 'Family'}</p>
                  <p className="text-xs text-muted-foreground">{b.date} · {b.hours}h</p>
                </div>
                <p className="font-display font-semibold text-primary">+${b.nanny_payout?.toFixed(2)}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}