import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';
import { DOC_TYPE_LABELS } from './kbTokens';

/**
 * Wider card used on the KB index for non-scenario documents
 * (principles, glossary, decision_index).
 */
export default function PrincipleCard({ doc }) {
  return (
    <Link
      to={`/AdminKB/${doc.slug}`}
      className="group block bg-card border border-border/60 rounded-2xl p-6 hover:shadow-md hover:border-primary/20 transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            {DOC_TYPE_LABELS[doc.doc_type] || 'Dokument'}
          </p>
          <h3 className="font-display text-xl font-semibold text-foreground leading-snug mb-2">
            {doc.title}
          </h3>
          {doc.subtitle && (
            <p className="text-sm text-muted-foreground leading-relaxed">{doc.subtitle}</p>
          )}
          <div className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Otvori <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}