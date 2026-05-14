import React from 'react';

/**
 * Sticky draft banner shown on every KB page.
 * Sits at the top of the KB layout, does not scroll away.
 */
export default function DraftBanner() {
  return (
    <div className="sticky top-0 z-20 bg-red-100 border-b border-red-200 text-red-900 px-4 py-2 text-sm font-medium text-center">
      ⚠️ NACRT — NIJE ZA OPERATIVNU UPORABU. Sadržaj nije pravno pregledan i podložan je promjenama.
    </div>
  );
}