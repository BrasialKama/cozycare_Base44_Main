import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, ChevronRight } from 'lucide-react';
import useNotifications from '@/hooks/useNotifications';

export default function Inbox() {
  const { items, isLoading } = useNotifications();

  return (
    <div className="space-y-6 pb-8">
      <header>
        <h1 className="font-display text-3xl font-bold text-foreground">Obavijesti</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Stvari koje trebaju vašu pažnju.
        </p>
      </header>

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-card border border-dashed border-border/60 rounded-3xl">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Bell className="w-7 h-7 text-primary/60" />
          </div>
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">
            Nema novih obavijesti
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Ovdje ćete vidjeti stvari koje trebaju vašu pažnju.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Link
              key={item.id}
              to={item.to}
              className="flex items-center gap-3 bg-card border border-border/50 rounded-2xl px-4 py-3 hover:shadow-md hover:border-primary/15 transition-all duration-200"
              style={{ touchAction: 'manipulation' }}
            >
              <div className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center flex-shrink-0`}>
                <item.icon className={`w-4 h-4 ${item.iconFg}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground leading-tight">{item.label}</p>
                {item.sublabel && (
                  <p className="text-xs text-muted-foreground mt-0.5">{item.sublabel}</p>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/60 flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}