import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

/**
 * Document list sidebar. Desktop: sticky left column.
 * Mobile: drawer toggled by a button.
 */
export default function KBSidebar({ docs = [], currentSlug }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const sorted = [...docs].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  const list = (
    <nav className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-3">
        Sve sekcije
      </p>
      {sorted.map(doc => {
        const active = doc.slug === currentSlug;
        return (
          <Link
            key={doc.slug}
            to={`/AdminKB/${doc.slug}`}
            onClick={() => setMobileOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
              active
                ? 'bg-primary/12 text-primary font-semibold'
                : 'text-foreground/75 hover:bg-muted/60 hover:text-foreground'
            }`}
          >
            {doc.display_number != null && (
              <span className="text-muted-foreground mr-2 tabular-nums">
                {String(doc.display_number).padStart(2, '0')}
              </span>
            )}
            {doc.title}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:block w-[280px] flex-shrink-0">
        <div className="sticky top-24">{list}</div>
      </aside>

      {/* Mobile trigger */}
      <div className="lg:hidden mb-4">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border/60 text-sm font-medium text-foreground hover:bg-muted/40"
        >
          <Menu className="w-4 h-4" />
          Sve sekcije
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="relative ml-auto w-[85%] max-w-xs h-full bg-background shadow-2xl overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-5">
              <p className="font-display font-semibold text-lg">Sve sekcije</p>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted/60"
                aria-label="Zatvori"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {list}
          </div>
        </div>
      )}
    </>
  );
}