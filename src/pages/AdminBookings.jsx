import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Calendar, Clock, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';

const statusStyles = {
  'Na čekanju': 'bg-peach/50 text-peach-dark',
  'Potvrđeno': 'bg-sage/30 text-sage-foreground',
  'Završeno': 'bg-muted text-muted-foreground',
  'Otkazano': 'bg-destructive/10 text-destructive',
};

export default function AdminBookings() {
  const { data: bookings = [] } = useQuery({
    queryKey: ['adminBookings'],
    queryFn: () => base44.entities.Booking.list('-created_date', 100),
  });

  return (
    <div>
      <PageHeader icon={Calendar} title="Sve rezervacije" subtitle="Pregled i upravljanje rezervacijama platforme" />

      {bookings.length === 0 ? (
        <EmptyState icon={Calendar} title="Još nema rezervacija" />
      ) : (
        <div className="space-y-3">
          {bookings.map(b => (
            <Card key={b.id} className="p-4 border-border/60">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`text-[11px] ${statusStyles[b.status]} border-0`}>
                      {b.status?.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm">
                    <span className="font-semibold">{b.family_name || 'Obitelj'}</span>
                    <span className="text-muted-foreground"> → </span>
                    <span className="font-semibold">{b.nanny_name || 'Dadilja'}</span>
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" /> {b.date}
                    <Clock className="w-3 h-3 ml-2" /> {b.start_time} - {b.end_time}
                  </p>
                </div>
                <div className="text-right text-xs space-y-0.5">
                  <p className="font-semibold">Ukupno: €{b.total_price?.toFixed(2)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}