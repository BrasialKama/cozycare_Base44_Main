import React from 'react';
import { Star, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote: 'Konačno dadilja kojoj stvarno vjerujem. Mala se veseli svakom njenom dolasku.',
    name: 'Ana',
    neighborhood: 'Maksimir',
    rating: 5,
  },
  {
    quote: 'Provjera pozadine mi je dala mir. Sad mogu mirno otići na posao.',
    name: 'Ivana',
    neighborhood: 'Trešnjevka',
    rating: 5,
  },
  {
    quote: 'Rezervirala sam u 2 minute. Dadilja je stigla točno na vrijeme — profesionalna i topla.',
    name: 'Maja',
    neighborhood: 'Novi Zagreb',
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 lg:py-28 bg-ivory/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary mb-4">
            Iskustva obitelji
          </p>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
            Roditelji nam vjeruju
          </h2>
          <p className="mt-4 text-muted-foreground text-base lg:text-lg max-w-md mx-auto">
            Pročitajte što zagrebačke obitelji kažu o CozyCare iskustvu.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/60 flex flex-col"
            >
              <Quote className="w-6 h-6 text-primary/25 mb-3" />
              <p className="text-sm text-foreground leading-relaxed italic flex-1">
                "{t.quote}"
              </p>
              <div className="mt-5 pt-4 border-t border-border/30 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.neighborhood}, Zagreb</p>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}