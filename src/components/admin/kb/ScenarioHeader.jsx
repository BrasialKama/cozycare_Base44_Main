import React from 'react';
import { Link } from 'react-router-dom';
import SeverityBadge from './SeverityBadge';
import { LEGAL_SIGNOFF_LABELS } from './kbTokens';

/**
 * Header card shown immediately after the title on every scenario document.
 * Five rows: severity, owner, response time, legal sign-off, related.
 */
export default function ScenarioHeader({
  severity,
  owner,
  responseTime,
  legalSignoff,
  relatedSlugs = [],
  relatedDocs = [],
}) {
  const Row = ({ label, children }) => (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2.5 first:pt-0 last:pb-0 border-b border-border/40 last:border-0">
      <div className="sm:w-44 flex-shrink-0 text-sm font-semibold text-foreground">{label}</div>
      <div className="flex-1 text-sm text-foreground/85">{children}</div>
    </div>
  );

  const relatedMap = new Map(relatedDocs.map(d => [d.slug, d]));

  return (
    <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 my-6">
      <Row label="Razina ozbiljnosti">
        <SeverityBadge severity={severity} />
      </Row>
      {owner && <Row label="Vlasnik">{owner}</Row>}
      {responseTime && <Row label="Vrijeme odgovora">{responseTime}</Row>}
      <Row label="Pravni pregled">{LEGAL_SIGNOFF_LABELS[legalSignoff] || legalSignoff}</Row>
      {relatedSlugs.length > 0 && (
        <Row label="Povezano">
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {relatedSlugs.map(slug => {
              const doc = relatedMap.get(slug);
              return (
                <Link
                  key={slug}
                  to={`/AdminKB/${slug}`}
                  className="text-primary hover:underline"
                >
                  {doc ? doc.title : slug}
                </Link>
              );
            })}
          </div>
        </Row>
      )}
    </div>
  );
}