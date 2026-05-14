import React from 'react';
import { SEVERITY_LABELS, SEVERITY_BADGE_CLASSES } from './kbTokens';

export default function SeverityBadge({ severity, className = '' }) {
  const label = SEVERITY_LABELS[severity];
  if (!label) return null;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${SEVERITY_BADGE_CLASSES[severity] || ''} ${className}`}
    >
      {label}
    </span>
  );
}