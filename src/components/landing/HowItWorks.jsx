import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const STEPS = [
  {
    emoji: '🔍',
    number: '01',
    title: 'Pretražite',
    description: 'Unesite svoj kvart i pregledajte profile provjerenih dadilja. Svaka dadilja ima fotografiju, opis, recenzije i dostupnost.',
  },
  {
    emoji: '💬',
    number: '02',
    title: 'Povežite se',
    description: 'Pošaljite poruku dadilji koja vam se sviđa. Dogovorite upoznavanje bez ikakve obveze.',
  },
  {
    emoji: '✅',
    number: '03',
    title: 'Rezervirajte',
    description: 'Potvrdite termin kroz aplikaciju. Vaša rezervacija je zaštićena CozyCare garancijom.',
  },
];

function StepCard({ step, isLast }) {
  return (
    <div className="relative flex-1 flex flex-col items-center text-center">
      {/* Connecting line (desktop only, not after last) */}
      {!isLast && (
        <div className="hidden lg:block absolute top-10 left-[calc(50%+48px)] w-[calc(100%-96px)] h-px bg-gradient-to-r from-primary/25 via-primary/15 to-primary/25" />
      )}

      {/* Emoji circle */}
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl mb-5"
        style={{
          background: 'rgba(255,255,255,0.7)',
          border: '1px solid rgba(255,255,255,0.4)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        }}
      >
        {step.emoji}
      </div>

      {/* Step number */}
      <span className="text-xs font-bold tracking-widest uppercase text-primary/50 mb-2">
        Korak {step.number}
      </span>

      {/* Title */}
      <h3 className="font-display text-xl font-bold text-foreground mb-3">
        {step.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
        {step.description}
      </p>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section className="py-20 lg:py-28 bg-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14 lg:mb-18">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-3">
            Kako funkcionira?
          </h2>
          <p className="text-muted-foreground text-base lg:text-lg max-w-md mx-auto">
            Pronađite savršenu dadilju u samo nekoliko koraka.
          </p>
        </div>

        {/* Steps */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-8">
          {STEPS.map((step, i) => (
            <StepCard key={step.number} step={step} isLast={i === STEPS.length - 1} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-14">
          <Button
            size="lg"
            asChild
            className="bg-primary text-primary-foreground h-13 px-10 text-base hover:bg-primary/90 rounded-full group"
          >
            <Link to="/FindNannies">
              Pronađi dadilju
              <ArrowRight className="ml-2 h-4.5 w-4.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}