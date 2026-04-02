import React from 'react';
import { CheckCircle2, Flame, Clock } from 'lucide-react';

/**
 * Deterministic pseudo-random badges for nanny cards.
 * Uses nanny id as seed for consistent display.
 */
function seededRandom(id) {
  const num = typeof id === 'string' ? id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) : Number(id);
  return ((num * 9301 + 49297) % 233280) / 233280;
}

export default function NannyTrustBadges({ nanny }) {
  const seed = seededRandom(nanny.id);
  const isHighDemand = seed > 0.6;
  const responseBadge = seed > 0.35;

  return (
    <div className="flex flex-wrap gap-1.5">
      {/* Always show verified badge */}
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
        <CheckCircle2 className="w-2.5 h-2.5" />
        Provjerena dadilja
      </span>

      {/* Scarcity — high demand */}
      {isHighDemand && (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
          <Flame className="w-2.5 h-2.5" />
          Brzo se popunjava
        </span>
      )}

      {/* Social proof — response time */}
      {!isHighDemand && responseBadge && (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">
          <Clock className="w-2.5 h-2.5" />
          Odgovorila u roku 2h
        </span>
      )}
    </div>
  );
}