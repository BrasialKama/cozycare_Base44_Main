import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SeverityBadge from './SeverityBadge';

/**
 * Card used on the KB index for scenario documents.
 */
export default function ScenarioCard({ doc }) {
  const num = doc.display_number != null ? String(doc.display_number).padStart(2, '0') : null;
  return (
    <Link
      to={`/AdminKB/${doc.slug}`}
      className="group relative block bg-card border border-border/60 rounded-2xl p-5 hover:shadow-md hover:border-primary/20 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {num ? `Scenarij ${num}` : 'Dokument'}
        </p>
        <SeverityBadge severity={doc.severity} />
      </div>
      <h3 className="font-display text-lg font-semibold text-foreground leading-snug mb-2">
        {num ? `${num} — ${doc.title}` : doc.title}
      </h3>
      {doc.subtitle && (
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{doc.subtitle}</p>
      )}
      <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
        Otvori <ArrowRight className="w-3.5 h-3.5" />
      </div>
    </Link>
  );
}