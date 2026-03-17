import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, Calendar, MessageCircle, Shield, Heart, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import NannyCard from '@/components/shared/NannyCard';

export default function ParentHome() {
  const { user } = useAuth();

  const { data: topNannies = [] } = useQuery({
    queryKey: ['topNannies'],
    queryFn: () => base44.entities.NannyProfile.filter({ status: 'approved' }, '-avg_rating', 4),
  });

  const { data: myBookings = [] } = useQuery({
    queryKey: ['myBookings', user?.email],
    queryFn: () => base44.entities.Booking.filter(
      { parent_email: user?.email, status: 'confirmed' },
      '-date',
      3
    ),
    enabled: !!user?.email,
  });

  const firstName = (user?.display_name || user?.full_name || 'there').split(' ')[0];

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="bg-gradient-to-br from-primary/8 via-peach/30 to-sage/20 rounded-2xl p-6 lg:p-8 border border-border/50">
        <div className="flex items-center gap-2 mb-1">
          <Heart className="w-5 h-5 text-primary" fill="currentColor" />
          <span className="text-sm font-medium text-primary">CozyCare</span>
        </div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {firstName}
        </h1>
        <p className="text-muted-foreground mt-1 mb-5">
          Find the perfect caregiver for your family today
        </p>
        <Link to="/FindNannies">
          <Button className="h-11 px-6 font-semibold">
            <Search className="w-4 h-4 mr-2" />
            Find a Nanny
          </Button>
        </Link>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Search, label: 'Find Nannies', path: '/FindNannies', color: 'bg-primary/8 text-primary' },
          { icon: Calendar, label: 'My Bookings', path: '/MyBookings', color: 'bg-peach/50 text-peach-dark' },
          { icon: MessageCircle, label: 'Messages', path: '/Messages', color: 'bg-sage/30 text-sage-foreground' },
          { icon: Shield, label: 'Safety Center', path: '/SafetyCenter', color: 'bg-powder-blue/40 text-foreground' },
        ].map((item) => (
          <Link key={item.path} to={item.path}>
            <Card className="p-4 hover:shadow-md transition-all duration-200 cursor-pointer border-border/60 hover:border-primary/20">
              <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center mb-2.5`}>
                <item.icon className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-foreground">{item.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Upcoming bookings */}
      {myBookings.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">Upcoming Bookings</h2>
            <Link to="/MyBookings" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {myBookings.map((b) => (
              <Card key={b.id} className="p-4 border-border/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{b.nanny_name || 'Nanny'}</p>
                    <p className="text-xs text-muted-foreground">{b.date} · {b.start_time} - {b.end_time}</p>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-sage/30 text-sage-foreground capitalize">
                    {b.status}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Featured nannies */}
      {topNannies.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">
              <Star className="w-5 h-5 inline-block text-terracotta mr-1.5 -mt-0.5" />
              Top-Rated Nannies
            </h2>
            <Link to="/FindNannies" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
              See all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topNannies.map((nanny) => (
              <NannyCard key={nanny.id} nanny={nanny} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}