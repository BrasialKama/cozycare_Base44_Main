import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function VettingBanner() {
  return (
    <div className="bg-sage/15 border border-sage/25 rounded-2xl px-6 py-5 flex items-start gap-4 max-w-3xl mx-auto">
      <div className="w-10 h-10 rounded-xl bg-sage/30 flex items-center justify-center flex-shrink-0">
        <ShieldCheck className="w-5 h-5 text-sage-foreground" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground mb-1">Svaka dadilja prolazi temeljitu provjeru</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Provjera identiteta, osobne reference i razgovor uživo — sve prije nego što profil postane vidljiv.
          Jer vaš mir je naša briga.
        </p>
      </div>
    </div>
  );
}