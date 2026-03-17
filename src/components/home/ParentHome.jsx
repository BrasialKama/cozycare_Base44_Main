import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, Calendar, MessageCircle, Shield, Heart, ArrowRight, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NannyCard from '@/components/shared/NannyCard';

const greetingTime = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const TRUST_PILLARS = [
  { icon: Shield, label: 'Background Checked', desc: 'Every nanny passes a full background screen' },
  { icon: Star, label: 'Personally Vetted', desc: 'References reviewed by our care team' },
  { icon: Heart, label: 'Trust Guaranteed', desc: 'Real families, real reviews, zero bots' },
];

export default function ParentHome() {
  const { user } = useAuth();
  const firstName = (user?.display_name || user?.full_name || 'there').split(' ')[0];

  const { data: topNannies = [] } = useQuery({
    queryKey: ['topNannies'],
    queryFn: () => base44.entities.NannyProfile.filter({ status: 'approved' }, '-avg_rating', 6),
  });

  const { data: myBookings = [] } = useQuery({
    queryKey: ['myBookings', user?.email],
    queryFn: () => base44.entities.Booking.filter({ parent_email: user?.email, status: 'confirmed' }, '-date', 3),
    enabled: !!user?.email,
  });

  return (
    <div className="space-y-12 pb-8">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-light via-peach to-ivory border border-primary/10 shadow-sm">
        {/* decorative blobs */}
        <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-primary/8 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-sage/20 blur-3xl pointer-events-none" />

        <div className="relative px-7 py-10 lg:px-12 lg:py-14">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-primary/70 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Trusted family care
          </p>
          <h1 className="font-display text-3xl lg:text-5xl font-bold text-foreground leading-tight max-w-lg">
            {greetingTime()}, <span className="text-primary">{firstName}.</span>
            <br />
            <span className="italic font-medium text-foreground/70">Your family deserves the best.</span>
          </h1>
          <p className="mt-4 text-base text-muted-foreground max-w-md leading-relaxed">
            Discover warm, verified caregivers who treat your children like their own. Every nanny on CozyCare is hand-screened, reference-checked, and reviewed by real families.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/FindNannies">
              <Button size="lg" className="h-12 px-7 font-semibold rounded-full shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25 transition-shadow">
                <Search className="w-4 h-4 mr-2" />
                Find a Nanny
              </Button>
            </Link>
            <Link to="/MyBookings">
              <Button size="lg" variant="outline" className="h-12 px-7 font-semibold rounded-full bg-white/70 hover:bg-white">
                <Calendar className="w-4 h-4 mr-2" />
                My Bookings
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust pillars ── */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TRUST_PILLARS.map(({ icon: PillarIcon, label, desc }) => (
            <div key={label} className="flex items-start gap-3.5 bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <PillarIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Upcoming bookings (if any) ── */}
      {myBookings.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-semibold text-foreground">Upcoming Care</h2>
            <Link to="/MyBookings" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {myBookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between bg-card border border-border/50 rounded-2xl px-5 py-4 shadow-sm">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-sage/20 flex items-center justify-center">
                    <Calendar className="w-4.5 h-4.5 text-sage-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{b.nanny_name || 'Your Nanny'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{b.date} · {b.start_time}–{b.end_time}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-sage/25 text-sage-foreground capitalize">
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Quick nav cards ── */}
      <section>
        <h2 className="font-display text-xl font-semibold text-foreground mb-5">Quick Access</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: Search, label: 'Find Nannies', sub: 'Browse caregivers', path: '/FindNannies', bg: 'bg-rose-light', text: 'text-primary' },
            { icon: Calendar, label: 'Bookings', sub: 'Upcoming sessions', path: '/MyBookings', bg: 'bg-peach/60', text: 'text-peach-dark' },
            { icon: MessageCircle, label: 'Messages', sub: 'Chat with nannies', path: '/Messages', bg: 'bg-sage/25', text: 'text-sage-foreground' },
            { icon: Shield, label: 'Safety', sub: 'Our safeguards', path: '/SafetyCenter', bg: 'bg-powder-blue/40', text: 'text-foreground/70' },
          ].map((item) => (
            <Link key={item.path} to={item.path}>
              <div className="bg-card border border-border/50 rounded-2xl p-4 hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer group">
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-3`}>
                  <item.icon className={`w-5 h-5 ${item.text}`} />
                </div>
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured nannies ── */}
      {topNannies.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">Top-Rated Caregivers</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Loved by families in your area</p>
            </div>
            <Link to="/FindNannies" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
              See all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {topNannies.map((nanny) => (
              <NannyCard key={nanny.id} nanny={nanny} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}