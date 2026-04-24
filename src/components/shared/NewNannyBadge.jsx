import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * Badge shown in place of a star rating for nannies who haven't received
 * any reviews yet. Prevents the empty-looking "no rating" gap and makes
 * clear they are new (rather than low-rated) without fabricating social proof.
 *
 * Size variants:
 *   sm: compact, for cards and list items
 *   md: for detail/hero areas
 */
export default function NewNannyBadge({ size = 'sm' }) {
  const classes = size === 'md'
    ? 'text-xs px-2.5 py-1 gap-1.5'
    : 'text-[11px] px-2 py-0.5 gap-1';
  const iconSize = size === 'md' ? 'w-3.5 h-3.5' : 'w-3 h-3';
  return (
    <span className={`inline-flex items-center ${classes} rounded-full bg-peach/40 text-peach-dark font-medium whitespace-nowrap`}>
      <Sparkles className={iconSize} /> Nova na platformi
    </span>
  );
}