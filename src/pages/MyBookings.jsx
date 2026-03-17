import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Star } from 'lucide-react';
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

export default function MyBookings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['parentBookings', user?.email],
    queryFn: () => base44.entities.Booking.filter({ parent_email: user?.email }, '-date'),
    enabled: !!user?.email,
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => base44.entities.Booking.update(id, { status: 'cancelled' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parentBookings'] });
      toast.success('Booking cancelled');
    },
  });

  const upcoming = bookings.filter(b => ['pending', 'confirmed', 'in_progress'].includes(b.status));
  const past = bookings.filter(b => ['completed', 'cancelled'].includes(b.status));

  const BookingCard = ({ booking }) => (
    <Card className="p-4 border-border/60">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm">{booking.nanny_name || 'Nanny'}</h3>
            <Badge className={`text-[11px] ${statusStyles[booking.status]} border-0`}>
              {booking.status?.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {booking.date}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3" /> {booking.start_time} - {booking.end_time} ({booking.hours}h)
          </p>
          {booking.notes && <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">{booking.notes}</p>}
        </div>
        <div className="text-right">
          <p className="font-display font-semibold text-primary">${booking.total_cost?.toFixed(2)}</p>
          {booking.status === 'pending' && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-destructive mt-1"
              onClick={() => cancelMutation.mutate(booking.id)}
            >
              Cancel
            </Button>
          )}
          {booking.status === 'completed' && (
            <Link to={`/LeaveReview?booking_id=${booking.id}`}>
              <Button variant="ghost" size="sm" className="text-xs text-primary mt-1">
                <Star className="w-3 h-3 mr-1" /> Review
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div>
      <PageHeader icon={Calendar} title="My Bookings" subtitle="Manage your babysitting appointments" />

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          {upcoming.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No upcoming bookings"
              description="Find a nanny and book your first session"
              action={<Link to="/FindNannies"><Button>Find Nannies</Button></Link>}
            />
          ) : (
            <div className="space-y-3">{upcoming.map(b => <BookingCard key={b.id} booking={b} />)}</div>
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