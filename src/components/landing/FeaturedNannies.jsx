import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import LandingNannyCard from '@/components/landing/LandingNannyCard';

export default function FeaturedNannies() {
  const { data: nannies = [] } = useQuery({
    queryKey: ['featuredNannies'],
    queryFn: () => base44.entities.NannyProfile.filter({ status: 'approved' }, '-avg_rating', 3),
  });

  if (nannies.length === 0) return null;

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-secondary mb-3">
              Istaknute dadilje
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground leading-tight">
              Upoznajte naše iznimne dadilje
            </h2>
            <p className="mt-4 text-muted-foreground text-lg italic leading-relaxed">
              Ručno odabrane za svoje iskustvo, toplinu i predanost
              iznimnoj obiteljskoj skrbi.
            </p>
          </div>
          <Link
            to="/FindNannies"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors group shrink-0"
          >
            Pregledaj sve dadilje
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nannies.map((nanny) => (
            <LandingNannyCard key={nanny.id} nanny={nanny} />
          ))}
        </div>
      </div>
    </section>
  );
}