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
  pending: 'bg-peach/50 text-peach-dark',
  confirmed: 'bg-sage/30 text-sage-foreground',
  in_progress: 'bg-primary/10 text-primary',
  completed: 'bg-muted text-muted-foreground',
  cancelled: 'bg-destructive/10 text-destructive',
};

export default function NannyBookings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: bookings = [] } = useQuery({
    queryKey: ['nannyBookingsAll', user?.email],
    queryFn: () => base44.entities.Booking.filter({ nanny_email: user?.email }, '-date'),
    enabled: !!user?.email,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Booking.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nannyBookingsAll'] });
      toast.success('Booking updated');
    },
  });

  const pending = bookings.filter(b => b.status === 'pending');
  const upcoming = bookings.filter(b => ['confirmed', 'in_progress'].includes(b.status));
  const past = bookings.filter(b => ['completed', 'cancelled'].includes(b.status));

  const BookingCard = ({ booking, showActions }) => (
    <Card className="p-4 border-border/60">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm">{booking.parent_name || 'Family'}</h3>
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
          {booking.children_names && (
            <p className="text-xs text-muted-foreground mt-1">Children: {booking.children_names}</p>
          )}
        </div>
        <div className="text-right">
          <p className="font-display font-semibold text-primary">${booking.nanny_payout?.toFixed(2)}</p>
          {showActions && booking.status === 'pending' && (
            <div className="flex gap-1.5 mt-2">
              <Button
                size="sm"
                className="h-7 px-2.5 text-xs"
                onClick={() => updateMutation.mutate({ id: booking.id, data: { status: 'confirmed' } })}
              >
                <Check className="w-3 h-3 mr-1" /> Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2.5 text-xs text-destructive"
                onClick={() => updateMutation.mutate({ id: booking.id, data: { status: 'cancelled' } })}
              >
                <X className="w-3 h-3 mr-1" /> Decline
              </Button>
            </div>
          )}
          {booking.status === 'confirmed' && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2.5 text-xs mt-2"
              onClick={() => updateMutation.mutate({ id: booking.id, data: { status: 'completed', arrival_confirmed: true, departure_confirmed: true } })}
            >
              Mark Complete
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div>
      <PageHeader icon={Calendar} title="My Bookings" subtitle="Manage your babysitting requests" />

      {pending.length > 0 && (
        <div className="mb-6">
          <h2 className="font-display font-semibold mb-3 text-sm text-primary">
            Pending Requests ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map(b => <BookingCard key={b.id} booking={b} showActions />)}
          </div>
        </div>
      )}

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          {upcoming.length === 0 ? (
            <EmptyState icon={Calendar} title="No upcoming bookings" />
          ) : (
            <div className="space-y-3">{upcoming.map(b => <BookingCard key={b.id} booking={b} showActions />)}</div>
          )}
        </TabsContent>
        <TabsContent value="past">
          {past.length === 0 ? (
            <EmptyState icon={Calendar} title="No past bookings" />
          ) : (
            <div className="space-y-3">{past.map(b => <BookingCard key={b.id} booking={b} />)}</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}