import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const PILLARS = [
  {
    emoji: '🪪',
    title: 'Provjereni identitet',
    description: 'Svaka dadilja prolazi provjeru identiteta prije nego što se pojavi na platformi.',
  },
  {
    emoji: '⭐',
    title: 'Recenzije obitelji',
    description: 'Pročitajte iskustva pravih zagrebačkih obitelji. Sve recenzije su od verificiranih korisnika.',
  },
  {
    emoji: '🔒',
    title: 'Sigurne rezervacije',
    description: 'Sve rezervacije su zaštićene CozyCare garancijom. Rezervirajte bez brige.',
  },
  {
    emoji: '💬',
    title: 'Podrška 7 dana u tjednu',
    description: 'Naš tim je dostupan svaki dan za sva vaša pitanja i nedoumice.',
  },
];

function PillarCard({ pillar }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/60 flex flex-col items-start">
      <span className="text-3xl mb-4">{pillar.emoji}</span>
      <h3 className="font-display text-base font-bold text-foreground mb-2">{pillar.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{pillar.description}</p>
    </div>
  );
}

export default function SafetySection() {
  return (
    <section className="py-20 lg:py-28 bg-rose-light/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-3">
            CozyCare zaštita
          </h2>
          <p className="text-muted-foreground text-base lg:text-lg max-w-lg mx-auto">
            Svaka dadilja prolazi provjeru identiteta, reference i osobni razgovor — jer vaš mir je naša briga.
          </p>
        </div>

        {/* Pillar cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {PILLARS.map(p => (
            <PillarCard key={p.title} pillar={p} />
          ))}
        </div>

        {/* Callout banner */}
        <div className="mt-12 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 shadow-sm p-8 lg:p-10 text-center">
          <p className="text-foreground font-body text-sm lg:text-base leading-relaxed max-w-xl mx-auto mb-6">
            <span className="font-semibold">217 provjerenih dadilja</span> čeka vas u Zagrebu.
            Bez skrivenih troškova — pregledavanje je uvijek besplatno.
          </p>
          <Button
            size="lg"
            asChild
            className="bg-primary text-primary-foreground h-12 px-8 text-sm hover:bg-primary/90 rounded-full group"
          >
            <Link to="/FindNannies">
              Pronađi dadilju kojoj vjeruješ
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}