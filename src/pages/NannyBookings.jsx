import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Calendar, Clock, Check, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const statusStyles = {
  'Na čekanju': 'bg-peach/50 text-peach-dark',
  'Potvrđeno': 'bg-sage/30 text-sage-foreground',
  'Završeno': 'bg-muted text-muted-foreground',
  'Otkazano': 'bg-destructive/10 text-destructive',
};

export default function NannyBookings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: bookings = [] } = useQuery({
    queryKey: ['nannyBookingsAll', user?.email],
    queryFn: () => base44.entities.Booking.list('-date', 100),
    enabled: !!user?.email,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Booking.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nannyBookingsAll'] });
      toast.success('Rezervacija ažurirana');
    },
  });

  const pending = bookings.filter(b => b.status === 'Na čekanju');
  const upcoming = bookings.filter(b => b.status === 'Potvrđeno');
  const past = bookings.filter(b => ['Završeno', 'Otkazano'].includes(b.status));

  const BookingCard = ({ booking, showActions }) => (
    <Card className="p-4 border-border/60">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm">{booking.family_name || 'Obitelj'}</h3>
            <Badge className={`text-[11px] ${statusStyles[booking.status]} border-0`}>
              {booking.status?.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {booking.date}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3" /> {booking.start_time} - {booking.end_time}
          </p>
          {booking.special_notes && (
            <p className="text-xs text-muted-foreground mt-1">Djeca: {booking.special_notes}</p>
          )}
        </div>
        <div className="text-right">
          <p className="font-display font-semibold text-primary">€{booking.total_price?.toFixed(2)}</p>
          {showActions && booking.status === 'Na čekanju' && (
            <div className="flex gap-1.5 mt-2">
              <Button
                size="sm"
                className="h-7 px-2.5 text-xs"
                onClick={() => updateMutation.mutate({ id: booking.id, data: { status: 'Potvrđeno' } })}
              >
                <Check className="w-3 h-3 mr-1" /> Prihvati
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2.5 text-xs text-destructive"
                onClick={() => updateMutation.mutate({ id: booking.id, data: { status: 'Otkazano' } })}
              >
                <X className="w-3 h-3 mr-1" /> Odbij
              </Button>
            </div>
          )}
          {booking.status === 'Potvrđeno' && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2.5 text-xs mt-2"
              onClick={() => updateMutation.mutate({ id: booking.id, data: { status: 'Završeno' } })}
            >
              Označi završenim
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div>
      <PageHeader icon={Calendar} title="Moje rezervacije" subtitle="Upravljajte zahtjevima za čuvanje" />

      {pending.length > 0 && (
        <div className="mb-6">
          <h2 className="font-display font-semibold mb-3 text-sm text-primary">
            Zahtjevi na čekanju ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map(b => <BookingCard key={b.id} booking={b} showActions />)}
          </div>
        </div>
      )}

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Nadolazeći ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Prošli ({past.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          {upcoming.length === 0 ? (
            <EmptyState icon={Calendar} title="Nema nadolazećih rezervacija" />
          ) : (
            <div className="space-y-3">{upcoming.map(b => <BookingCard key={b.id} booking={b} showActions />)}</div>
          )}
        </TabsContent>
        <TabsContent value="past">
          {past.length === 0 ? (
            <EmptyState icon={Calendar} title="Nema prošlih rezervacija" />
          ) : (
            <div className="space-y-3">{past.map(b => <BookingCard key={b.id} booking={b} />)}</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}