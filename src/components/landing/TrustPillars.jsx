import React from 'react';
import { ShieldCheck, BadgeCheck, Video, Heart } from 'lucide-react';
import TrustCard from './TrustCard';

export default function TrustPillars() {
  return (
    <section className="py-24 bg-card/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary mb-4">
            Zašto CozyCare
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Zlatni standard povjerenja
          </h2>
          <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
            Svaka dadilja na CozyCare-u prolazi naš rigorozan postupak provjere
            — kako biste pregledavali s potpunim povjerenjem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <TrustCard
            icon={<ShieldCheck className="h-7 w-7 text-primary" />}
            title="Potvrđen identitet"
            description="Službeni dokument provjeren sigurnim biometrijskim uparivanjem."
          />
          <TrustCard
            icon={<BadgeCheck className="h-7 w-7 text-secondary" />}
            title="Provjera pozadine"
            description="Kompletna provjera kaznene evidencije i sigurnosni pregled."
          />
          <TrustCard
            icon={<Video className="h-7 w-7 text-accent-foreground" />}
            title="Video verifikacija"
            description="Svaka dadilja snima osobni video — pregledan i potvrđen od našeg tima."
          />
          <TrustCard
            icon={<Heart className="h-7 w-7 text-primary/80" />}
            title="Provjerene reference"
            description="Osobno kontaktiramo i provjeravamo prethodne reference obitelji prije odobrenja."
          />
        </div>
      </div>
    </section>
  );
}