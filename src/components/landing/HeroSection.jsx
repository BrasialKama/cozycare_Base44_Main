import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Search } from 'lucide-react';

const KVARTOVI = ['Gornji Grad', 'Maksimir', 'Trešnjevka', 'Črnomerec', 'Trnje', 'Novi Zagreb', 'Sesvete'];

export default function HeroSection() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/FindNannies?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/FindNannies');
    }
  };

  return (
    <section className="relative min-h-[85vh] min-h-[620px] overflow-hidden pt-16">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://v3b.fal.media/files/b/0a91dbaa/t6_jK9LqIBSvqTfKXK_2Z_NrjWtPNu.png"
          alt="Warm family nursery"
          className="h-full w-full object-cover brightness-[0.96]"
        />
        {/* Primary warm ivory veil */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, rgba(255,253,248,0.97) 0%, rgba(255,253,248,0.88) 22%, rgba(255,253,248,0.68) 40%, rgba(255,253,248,0.28) 58%, transparent 75%)',
          }}
        />
        {/* Secondary vertical warmth */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(255,253,248,0.35) 0%, transparent 40%)',
          }}
        />
      </div>

      <div className="relative z-10 flex h-full items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl">
          {/* Social proof pill */}
          <div
            className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary"
            style={{
              background: 'rgba(200,142,142,0.10)',
              border: '1px solid rgba(200,142,142,0.25)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
          >
            <Star className="h-3.5 w-3.5 fill-current" />
            Vjeruju nam zagrebačke obitelji · Više od 200 provjerenih dadilja
          </div>

          {/* Frosted content veil */}
          <div className="relative rounded-2xl p-1" style={{ isolation: 'isolate' }}>
            <div
              className="absolute inset-0 -inset-x-4 rounded-2xl"
              style={{
                background:
                  'radial-gradient(ellipse 110% 100% at 30% 50%, rgba(255,253,248,0.55) 0%, rgba(255,253,248,0.18) 60%, transparent 100%)',
                backdropFilter: 'blur(2px)',
                WebkitBackdropFilter: 'blur(2px)',
                zIndex: -1,
              }}
            />
            <h1
              className="font-display text-5xl md:text-7xl font-bold leading-[1.08] tracking-tight text-foreground"
              style={{
                textShadow:
                  '0 1px 12px rgba(255,253,248,0.85), 0 0 32px rgba(255,253,248,0.6)',
              }}
            >
              <span className="text-primary italic">Topla</span> dobrodošlica{' '}
              <span className="block">za vaše mališane.</span>
            </h1>
            <p
              className="mt-6 text-lg md:text-xl max-w-lg leading-relaxed font-medium text-foreground"
              style={{
                opacity: 0.82,
                textShadow: '0 1px 8px rgba(255,253,248,0.9)',
              }}
            >
              Pregledajte našu kolekciju provjerenih dadilja — račun nije potreban
              dok ne budete spremni rezervirati. Svaka dadilja je provjerena,
              s potvrđenim identitetom i referencama.
            </p>
          </div>

          {/* Location search bar */}
          <div className="mt-8">
            <div
              className="flex items-center rounded-full shadow-lg shadow-foreground/5 overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.92)',
                border: '1px solid rgba(200,142,142,0.18)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <Search className="w-5 h-5 text-muted-foreground ml-5 flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Unesite kvart ili dio grada..."
                className="flex-1 h-14 px-4 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button
                onClick={handleSearch}
                className="h-14 px-7 bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors flex-shrink-0"
              >
                Traži
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {KVARTOVI.map(k => (
                <button
                  key={k}
                  onClick={() => { setQuery(k); navigate(`/FindNannies?q=${encodeURIComponent(k)}`); }}
                  className="text-xs px-3.5 py-1.5 rounded-full font-medium border transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.55)',
                    borderColor: 'rgba(200,142,142,0.22)',
                    backdropFilter: 'blur(8px)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,142,142,0.45)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(200,142,142,0.22)'; }}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              asChild
              className="bg-primary text-primary-foreground h-14 px-10 text-lg hover:bg-primary/90 group"
            >
              <Link to="/FindNannies">
                Pronađi svoju dadilju
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="h-14 px-10 text-lg text-foreground group"
              style={{
                background: 'rgba(255,253,248,0.45)',
                border: '1px solid rgba(200,142,142,0.30)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
            >
              <Link to="/Onboarding">Pridruži se CozyCare-u</Link>
            </Button>
          </div>

          <p
            className="mt-5 text-xs text-center sm:text-left italic tracking-wide text-muted-foreground"
            style={{ opacity: 0.9 }}
          >
            Provjerene dadilje
            <span className="mx-2 opacity-40">·</span>
            Pažljivo uparivanje
            <span className="mx-2 opacity-40">·</span>
            Pouzdana skrb
          </p>
        </div>
      </div>
    </section>
  );
}