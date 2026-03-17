import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Calendar, MessageCircle, DollarSign, Star, Heart, ArrowRight, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function NannyHome() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['myNannyProfile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.NannyProfile.filter({ user_email: user?.email });
      return profiles[0];
    },
    enabled: !!user?.email,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['nannyBookings', user?.email],
    queryFn: () => base44.entities.Booking.filter(
      { nanny_email: user?.email },
      '-date',
      5
    ),
    enabled: !!user?.email,
  });

  const upcomingBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
  const firstName = (user?.display_name || user?.full_name || 'there').split(' ')[0];

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="bg-gradient-to-br from-sage/20 via-peach/20 to-primary/5 rounded-2xl p-6 lg:p-8 border border-border/50">
        <div className="flex items-center gap-2 mb-1">
          <Heart className="w-5 h-5 text-primary" fill="currentColor" />
          <span className="text-sm font-medium text-primary">CozyCare</span>
        </div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
          Welcome back, {firstName}
        </h1>
        <p className="text-muted-foreground mt-1">
          {profile?.status === 'approved'
            ? 'Your profile is live — families can find and book you!'
            : profile?.status === 'pending'
            ? 'Your profile is under review. We\'ll notify you once it\'s approved.'
            : 'Complete your profile to start receiving bookings.'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Calendar, label: 'Bookings', value: profile?.total_bookings || 0, path: '/NannyBookings', color: 'bg-primary/8 text-primary' },
          { icon: Star, label: 'Rating', value: profile?.avg_rating?.toFixed(1) || '—', path: '/NannyProfile', color: 'bg-peach/50 text-peach-dark' },
          { icon: MessageCircle, label: 'Messages', value: '—', path: '/Messages', color: 'bg-sage/30 text-sage-foreground' },
          { icon: DollarSign, label: 'Earnings', value: '—', path: '/Earnings', color: 'bg-powder-blue/40 text-foreground' },
        ].map((item) => (
          <Link key={item.path} to={item.path}>
            <Card className="p-4 hover:shadow-md transition-all border-border/60 hover:border-primary/20">
              <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center mb-2.5`}>
                <item.icon className="w-5 h-5" />
              </div>
              <p className="text-xl font-display font-bold">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Upcoming bookings */}
      {upcomingBookings.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">Upcoming Bookings</h2>
            <Link to="/NannyBookings" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingBookings.map((b) => (
              <Card key={b.id} className="p-4 border-border/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{b.parent_name || 'Family'}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {b.date} · {b.start_time} - {b.end_time}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                    b.status === 'pending' ? 'bg-peach/50 text-peach-dark' : 'bg-sage/30 text-sage-foreground'
                  }`}>
                    {b.status}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}