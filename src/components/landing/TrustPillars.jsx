import React from 'react';
import { ShieldCheck, BadgeCheck, Video, Heart } from 'lucide-react';
import TrustCard from './TrustCard';

export default function TrustPillars() {
  return (
    <section className="py-24 bg-card/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary mb-4">
            Why CozyCare
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            The Gold Standard of Trust
          </h2>
          <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
            Every caregiver on CozyCare goes through our rigorous boutique vetting
            process — so you browse with complete confidence.
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
            description="Comprehensive criminal record and safety screening."
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
  );
}