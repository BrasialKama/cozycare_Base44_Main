import React from 'react';
import { CheckCircle2 } from 'lucide-react';

/**
 * Trust badges for nanny cards. Currently shows verification status only.
 * Activity-based badges (demand, response time) live on /NannyDetail and are
 * driven by real data via getNannyActivitySignal — we do not show them on
 * cards to avoid double-counting and stale rolling-window cache concerns.
 */
export default function NannyTrustBadges({ nanny }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
        <CheckCircle2 className="w-2.5 h-2.5" />
        Provjerena dadilja
      </span>
    </div>
  );
}