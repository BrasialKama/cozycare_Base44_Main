import React from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '../components/ui/button';
import { Heart, ShieldCheck, Video, BadgeCheck, ArrowRight, Star } from 'lucide-react';
import { NannyCard } from '../features/nannies/components/NannyCard';
import { demoNannies } from '../features/nannies/demoNannies';

export function HomePage() {
  const featuredNannies = demoNannies;

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[620px] overflow-hidden">
        {/* Background image — right side visible, left gently receded */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://v3b.fal.media/files/b/0a91dbaa/t6_jK9LqIBSvqTfKXK_2Z_NrjWtPNu.png" 
            alt="Warm family nursery"
            className="h-full w-full object-cover brightness-[0.96]"
          />
          {/* Primary warm ivory veil — left-to-centre gradient */}
          <div className="absolute inset-0" style={{background: 'linear-gradient(to right, rgba(255,253,248,0.97) 0%, rgba(255,253,248,0.88) 22%, rgba(255,253,248,0.68) 40%, rgba(255,253,248,0.28) 58%, transparent 75%)'}}></div>
          {/* Secondary vertical warmth — lifts lower portion softly */}
          <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(255,253,248,0.35) 0%, transparent 40%)'}}></div>
        </div>
        
        <div className="container relative z-10 flex h-full items-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl animate-in slide-in-from-left duration-1000">
            {/* Social proof pill — liquid-glass treatment */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary"
              style={{
                background: 'rgba(200,142,142,0.10)',
                border: '1px solid rgba(200,142,142,0.25)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}>
              <Star className="h-3.5 w-3.5 fill-current" />
              Trusted by London families · Over 200 verified nannies
            </div>

            {/* Frosted content veil — airy glass layer behind the text block */}
            <div className="relative rounded-2xl p-1" style={{isolation: 'isolate'}}>
              {/* Soft blur halo behind text only */}
              <div className="absolute inset-0 -inset-x-4 rounded-2xl" style={{
                background: 'radial-gradient(ellipse 110% 100% at 30% 50%, rgba(255,253,248,0.55) 0%, rgba(255,253,248,0.18) 60%, transparent 100%)',
                backdropFilter: 'blur(2px)',
                WebkitBackdropFilter: 'blur(2px)',
                zIndex: -1,
              }}></div>

              <h1 className="font-serif text-5xl md:text-7xl font-bold leading-[1.08] tracking-tight" style={{color: 'hsl(var(--foreground))', textShadow: '0 1px 12px rgba(255,253,248,0.85), 0 0 32px rgba(255,253,248,0.6)'}}>
                A <span className="text-primary italic">Warm</span> Welcome{' '}
                <span className="block">for Your Little Ones.</span>
              </h1>
              <p className="mt-6 text-lg md:text-xl max-w-lg leading-relaxed font-medium" style={{color: 'hsl(var(--foreground))', opacity: 0.82, textShadow: '0 1px 8px rgba(255,253,248,0.9)'}}>
                Browse our curated collection of verified nannies — no account needed until you're ready to book. Every caregiver is background-checked, ID-verified, and reference-reviewed.
              </p>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              {/* PRIMARY: parent journey — clear, direct, action-first */}
              <Button size="lg" asChild className="bg-primary text-primary-foreground h-14 px-10 text-lg shadow-elegant hover:bg-primary/90 group">
                <Link to="/start">
                  Find Your Nanny
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              {/* SECONDARY: liquid-glass outline button */}
              <Button variant="outline" size="lg" asChild className="h-14 px-10 text-lg text-foreground group"
                style={{
                  background: 'rgba(255,253,248,0.45)',
                  border: '1px solid rgba(200,142,142,0.30)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                } as React.CSSProperties}>
                <Link to="/auth/choose">Join CozyCare</Link>
              </Button>
            </div>

            <p className="mt-5 text-xs text-center italic tracking-wide" style={{color: 'hsl(var(--muted-foreground))', opacity: 0.9}}>
              Verified caregivers
              <span className="mx-2 opacity-40">·</span>
              Thoughtful matching
              <span className="mx-2 opacity-40">·</span>
              Trusted care
            </p>
            <p className="mt-2.5 text-xs text-center" style={{color: 'hsl(var(--muted-foreground))', opacity: 0.85}}>
              Already have an account?{' '}
              <Link to="/auth/choose" className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Trust Pillars */}
      <section className="py-24 bg-card/30 shabby-chic-pattern">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary mb-4">Why CozyCare</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">The Gold Standard of Trust</h2>
            <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
              Every caregiver on CozyCare goes through our rigorous boutique vetting process — so you browse with complete confidence.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <TrustCard 
              icon={<ShieldCheck className="h-7 w-7 text-primary" />}
              title="Identity Verified"
              description="Official government ID verified through secure biometric matching."
            />
            <TrustCard 
              icon={<BadgeCheck className="h-7 w-7 text-secondary" />}
              title="Background Checked"
              description="Comprehensive criminal record and enhanced DBS safety screening."
            />
            <TrustCard 
              icon={<Video className="h-7 w-7 text-accent-foreground" />}
              title="Video Verified"
              description="Each nanny records a personal intro video — reviewed and verified by our team."
            />
            <TrustCard 
              icon={<Heart className="h-7 w-7 text-primary/80" />}
              title="References Checked"
              description="We personally call and verify past family references before approval."
            />
          </div>
        </div>
      </section>

      {/* Featured Nannies */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-secondary mb-3">Featured caregivers</p>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground leading-tight">Meet Our Exceptional Nannies</h2>
              <p className="mt-4 text-muted-foreground text-lg italic leading-relaxed">
                Hand-selected for their experience, warmth, and dedication to exceptional family care.
              </p>
            </div>
            <Link 
              to="/nannies" 
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors group shrink-0"
            >
              Browse all caregivers
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredNannies.map(nanny => (
              <NannyCard key={nanny.id} nanny={nanny} />
            ))}
          </div>
        </div>
      </section>

      {/* Parent CTA Banner */}
      <section className="py-20 bg-primary/5 border-y border-primary/10">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
            Ready to find the right nanny for your family?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Browse freely, no account needed. When you're ready to message or book, we'll guide you through a quick, warm sign-up.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="h-13 px-10 text-lg shadow-elegant bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/start">Find Your Nanny</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-13 px-10 text-lg border-border hover:border-secondary/50 hover:bg-secondary/5">
              <Link to="/auth/choose?role=nanny">I'm a Nanny</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function TrustCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="boutique-card p-7 text-center flex flex-col items-center animate-in fade-in slide-up duration-500 hover:shadow-md transition-shadow">
      <div className="h-14 w-14 rounded-full bg-background flex items-center justify-center shadow-sm mb-5 border border-border/50">
        {icon}
      </div>
      <h3 className="font-serif text-lg font-bold mb-2.5">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
