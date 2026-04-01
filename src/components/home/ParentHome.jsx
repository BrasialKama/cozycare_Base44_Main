import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, Calendar, MessageCircle, Shield, Heart, ArrowRight, Sparkles, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NannyCard from '@/components/shared/NannyCard';

const greetingTime = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Dobro jutro';
  if (h < 17) return 'Dobar dan';
  return 'Dobra večer';
};

export default function ParentHome() {
  const { user } = useAuth();
  const firstName = (user?.full_name || 'there').split(' ')[0];

  const { data: topNannies = [] } = useQuery({
    queryKey: ['topNannies'],
    queryFn: () => base44.entities.NannyProfile.filter({ is_active: true }, '-rating', 6),
  });

  const { data: myBookings = [] } = useQuery({
    queryKey: ['myBookings', user?.email],
    queryFn: () => base44.entities.Booking.filter({ created_by: user?.email, status: 'Potvrđeno' }, '-date', 3),
    enabled: !!user?.email,
  });

  return (
    <div className="space-y-14 pb-8">

      {/* ── Hero ── */}
      <section className="relative rounded-3xl bg-gradient-to-br from-rose-light via-peach/70 to-ivory border border-primary/10 shadow-sm">
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-primary/6 blur-3xl" />
          <div className="absolute -bottom-12 -left-12 w-56 h-56 rounded-full bg-sage/15 blur-3xl" />
          <div className="absolute top-8 right-8 grid grid-cols-4 gap-1.5 opacity-20">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full bg-primary" />
            ))}
          </div>
        </div>
        <div className="relative px-8 py-12 lg:px-16 lg:py-16 w-full">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-primary/70 mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            Pouzdana obiteljska skrb
          </p>
          <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground leading-[1.12] max-w-xl break-words">
            {greetingTime()},
            <br />
            <span className="text-primary italic">{firstName}.</span>
            <br />
            <span className="text-foreground/60 font-medium">Vaša obitelj zaslužuje samo najbolje.</span>
          </h1>
          <p className="mt-5 text-base text-muted-foreground max-w-md leading-relaxed">
            Otkrijte tople, provjerene dadilje koje se osjećaju kao obitelj — odabrane za povjerenje, ljubav i pouzdanost.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/FindNannies">
              <Button size="lg" className="h-12 px-8 font-semibold rounded-full shadow-lg shadow-primary/20 text-sm">
                <Search className="w-4 h-4 mr-2" />
                Pronađi dadilju
              </Button>
            </Link>
            <Link to="/MyBookings">
              <Button size="lg" variant="outline" className="h-12 px-8 font-semibold rounded-full bg-white/80 hover:bg-white text-sm border-white/60">
                <Calendar className="w-4 h-4 mr-2" />
                Moje rezervacije
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust pillars ── */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Shield, label: 'Provjera pozadine', desc: 'Svaka dadilja prolazi kompletnu provjeru prije pridruživanja' },
            { icon: Star, label: 'Provjerene reference', desc: 'Reference osobno pregledava naš tim za kvalitetu skrbi' },
            { icon: Heart, label: 'Ocjene obitelji', desc: 'Stvarne recenzije stvarnih obitelji — iskrene, detaljne i provjerene' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-start gap-4 bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground mb-1">{label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Upcoming care ── */}
      {myBookings.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-2xl font-semibold text-foreground">Nadolazeća skrb</h2>
            <Link to="/MyBookings" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
              Prikaži sve <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {myBookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between bg-card border border-border/50 rounded-2xl px-5 py-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-sage/20 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4.5 h-4.5 text-sage-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{b.nanny_name || 'Vaša dadilja'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {b.date} · {b.start_time}–{b.end_time}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-sage/20 text-sage-foreground capitalize">
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Quick access ── */}
      <section>
        <h2 className="font-display text-2xl font-semibold text-foreground mb-5">Sve što trebate</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: Search, label: 'Pretraži dadilje', sub: 'Pregledaj dadilje', path: '/FindNannies', bg: 'bg-rose-light', fg: 'text-primary' },
            { icon: Calendar, label: 'Rezervacije', sub: 'Upravljaj terminima', path: '/MyBookings', bg: 'bg-peach/60', fg: 'text-peach-dark' },
            { icon: MessageCircle, label: 'Poruke', sub: 'Razgovaraj s dadiljama', path: '/Messages', bg: 'bg-sage/25', fg: 'text-sage-foreground' },
            { icon: Shield, label: 'Sigurnost', sub: 'Naše mjere zaštite', path: '/SafetyCenter', bg: 'bg-powder-blue/40', fg: 'text-foreground/60' },
          ].map((item) => (
            <Link key={item.path} to={item.path}>
              <div className="bg-card border border-border/50 rounded-2xl p-5 hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer group h-full">
                <div className={`w-11 h-11 rounded-xl ${item.bg} flex items-center justify-center mb-4`}>
                  <item.icon className={`w-5 h-5 ${item.fg}`} />
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground">Najbolje ocijenjene dadilje</h2>
              <p className="text-sm text-muted-foreground mt-1">Omiljene među obiteljima — provjerene, ocijenjene i spremne pomoći</p>
            </div>
            <Link to="/FindNannies" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline flex-shrink-0 ml-4">
              Prikaži sve <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {topNannies.map((nanny) => (
              <NannyCard key={nanny.id} nanny={nanny} />
            ))}
          </div>
        </section>
      )}

      {/* ── Empty nanny state ── */}
      {topNannies.length === 0 && (
        <section className="text-center py-16 bg-card border border-dashed border-border/60 rounded-3xl">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-primary/60" />
          </div>
          <h3 className="font-display text-xl font-semibold text-foreground mb-2">Vaša savršena dadilja čeka</h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6">
            Biramo dadilje u vašem području. Pregledajte dostupne dadilje za početak.
          </p>
          <Link to="/FindNannies">
            <Button className="rounded-full px-8">Pretraži dadilje</Button>
          </Link>
        </section>
      )}
    </div>
  );
}