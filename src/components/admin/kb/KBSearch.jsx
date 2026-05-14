import React from 'react';
import { Search, X } from 'lucide-react';

export default function KBSearch({ value, onChange }) {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Pretraži scenarije, principe i pojmove..."
        className="w-full h-14 pl-12 pr-12 rounded-2xl bg-card border border-border/60 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 outline-none text-base placeholder:text-muted-foreground"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
          aria-label="Očisti pretragu"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

/**
 * Pure filter helper: case-insensitive contains match across title, subtitle, body_markdown.
 * Returns full list when query is empty/whitespace.
 */
export function filterDocs(docs, query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return docs;
  return docs.filter(d => {
    const hay = `${d.title || ''}\n${d.subtitle || ''}\n${d.body_markdown || ''}`.toLowerCase();
    return hay.includes(q);
  });
}