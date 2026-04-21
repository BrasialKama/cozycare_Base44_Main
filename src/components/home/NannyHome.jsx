import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Calendar, MessageCircle, Euro, Star, Heart, ArrowRight, Clock, CheckCircle2, Sparkles, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const greetingTime = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Dobro jutro';
  if (h < 17) return 'Dobar dan';
  return 'Dobra večer';
};

const STATUS_CONFIG = {
  approved: { label: 'Vaš profil je aktivan', sub: 'Obitelji vas mogu pronaći i rezervirati.', color: 'bg-emerald-50 border-emerald-200 text-emerald-700', icon: CheckCircle2 },
  pending: { label: 'Profil na pregledu', sub: 'Obavijestit ćemo vas kad bude odobren — obično 24–48 sati.', color: 'bg-peach/40 border-peach/30 text-peach-dark', icon: Clock },
  rejected: { label: 'Profil nije odobren', sub: 'Ažurirajte profil i pošaljite ponovo.', color: 'bg-destructive/8 border-destructive/15 text-destructive', icon: Heart },
};

export default function NannyHome() {
  const { user } = useAuth();
  const firstName = (user?.display_name || user?.full_name || 'there').split(' ')[0];

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
    queryFn: () => base44.entities.Booking.filter({ nanny_user_email: user?.email }, '-date', 5),
    enabled: !!user?.email,
  });

  const upcoming = bookings.filter(b => ['Potvrđeno', 'Na čekanju'].includes(b.status));
  const statusCfg = STATUS_CONFIG[profile?.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusCfg.icon;

  return (
    <div className="space-y-10 pb-8">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sage/25 via-peach/30 to-ivory border border-sage/30 shadow-sm">
        <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-sage/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-44 h-44 rounded-full bg-primary/6 blur-3xl pointer-events-none" />
        <div className="relative px-7 py-10 lg:px-12 lg:py-12">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-primary/70 mb-4">
            <Sparkles className="w-3.5 h-3.5" /> CozyCare dadilja
          </p>
          <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground leading-tight">
            {greetingTime()},<br />
            <span className="text-primary italic">{firstName}.</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs leading-relaxed">
            {profile?.status === 'approved'
              ? 'Vaš profil je aktivan — obitelji vas mogu pronaći i rezervirati.'
              : 'Dobrodošli na vašu nadzornu ploču.'}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/NannyBookings">
              <Button size="sm" className="rounded-full px-5 shadow-md shadow-primary/15">
                <Calendar className="w-3.5 h-3.5 mr-2" /> Moje rezervacije
              </Button>
            </Link>
            <Link to="/NannyProfile">
              <Button size="sm" variant="outline" className="rounded-full px-5 bg-white/70 border-white/60">
                <User className="w-3.5 h-3.5 mr-2" /> Uredi profil
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Status banner ── */}
      {profile && (
        <div className={`flex items-start gap-3.5 p-4 rounded-2xl border ${statusCfg.color}`}>
          <div className="w-9 h-9 rounded-xl bg-white/60 flex items-center justify-center flex-shrink-0">
            <StatusIcon className="w-4.5 h-4.5" />
          </div>
          <div>
            <p className="text-sm font-semibold">{statusCfg.label}</p>
            <p className="text-xs opacity-80 mt-0.5">{statusCfg.sub}</p>
          </div>
        </div>
      )}

      {/* ── Stats ── */}
      <section>
        <h2 className="font-display text-xl font-semibold text-foreground mb-4">Vaša statistika</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: Calendar, label: 'Ukupno termina', value: profile?.total_bookings || 0, path: '/NannyBookings', bg: 'bg-rose-light', fg: 'text-primary' },
            { icon: Star, label: 'Prosj. ocjena', value: profile?.avg_rating ? profile.avg_rating.toFixed(1) : '—', path: '/NannyProfile', bg: 'bg-peach/50', fg: 'text-peach-dark' },
            { icon: MessageCircle, label: 'Poruke', value: '—', path: '/Messages', bg: 'bg-sage/25', fg: 'text-sage-foreground' },
            { icon: Euro, label: 'Zarada', value: '—', path: '/Earnings', bg: 'bg-powder-blue/40', fg: 'text-foreground/60' },
          ].map(item => (
            <Link key={item.path} to={item.path}>
              <div className="bg-card border border-border/50 rounded-2xl p-5 hover:shadow-md hover:border-primary/20 transition-all group">
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-3`}>
                  <item.icon className={`w-5 h-5 ${item.fg}`} />
                </div>
                <p className="font-display text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{item.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Upcoming bookings ── */}
      {upcoming.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold text-foreground">Nadolazeći termini</h2>
            <Link to="/NannyBookings" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
              Prikaži sve <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {upcoming.map(b => (
              <div key={b.id} className="flex items-center justify-between bg-card border border-border/50 rounded-2xl px-5 py-4 hover:shadow-sm transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-light to-peach/60 flex items-center justify-center flex-shrink-0 text-lg font-display font-bold text-primary">
                    {(b.parent_name || 'F')[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{b.parent_name || 'Obitelj'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {b.date} · {b.start_time}–{b.end_time}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                  b.status === 'Na čekanju' ? 'bg-peach/50 text-peach-dark' : 'bg-sage/30 text-sage-foreground'
                }`}>
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Quick links ── */}
      <section>
        <h2 className="font-display text-xl font-semibold text-foreground mb-4">Brzi pristup</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: User, label: 'Uredi profil', sub: 'Ažuriraj bio i fotografije', path: '/NannyProfile', bg: 'bg-rose-light/60', fg: 'text-primary' },
            { icon: MessageCircle, label: 'Poruke', sub: 'Razgovaraj s obiteljima', path: '/Messages', bg: 'bg-sage/20', fg: 'text-sage-foreground' },
            { icon: Euro, label: 'Zarada', sub: 'Prati svoje prihode', path: '/Earnings', bg: 'bg-powder-blue/40', fg: 'text-foreground/60' },
          ].map(item => (
            <Link key={item.path} to={item.path}>
              <div className="bg-card border border-border/50 rounded-2xl p-5 hover:shadow-md hover:border-primary/20 transition-all group h-full">
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-3`}>
                  <item.icon className={`w-5 h-5 ${item.fg}`} />
                </div>
                <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}