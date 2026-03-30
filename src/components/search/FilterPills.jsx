import React from 'react';

export default function FilterPills({ label, options, selected, onToggle }) {
  return (
    <div>
      <p className="text-xs font-semibold text-foreground mb-2.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => {
          const active = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => onToggle(opt.value)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${
                active
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card text-muted-foreground border-border/60 hover:border-primary/30 hover:text-foreground'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}