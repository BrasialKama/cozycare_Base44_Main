import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, ChevronRight, X, CheckCheck } from 'lucide-react';
import useNotifications from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

function NotificationRow({ item, onClick, onDismiss, muted = false }) {
  return (
    <div
      className={`flex items-center gap-3 bg-card border border-border/50 rounded-2xl px-4 py-3 transition-all duration-200 ${
        muted ? 'opacity-70' : 'hover:shadow-md hover:border-primary/15'
      }`}
    >
      <Link
        to={item.to}
        onClick={onClick}
        className="flex items-center gap-3 flex-1 min-w-0"
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
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          aria-label="Označi kao pročitano"
          style={{ touchAction: 'manipulation' }}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default function Inbox() {
  const { items, previousItems, isLoading, dismiss, dismissAll } = useNotifications();
  const [tab, setTab] = useState('active');
  const navigate = useNavigate();

  const handleItemClick = (item) => (e) => {
    // Dismiss before letting <Link> navigate.
    dismiss(item.id);
  };

  return (
    <div className="space-y-6 pb-8">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Obavijesti</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Stvari koje trebaju vašu pažnju.
          </p>
        </div>
        {items.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={dismissAll}
            className="rounded-full text-xs gap-1.5 flex-shrink-0"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Očisti sve
          </Button>
        )}
      </header>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-2 w-full max-w-sm rounded-full p-1 bg-muted/40">
          <TabsTrigger value="active" className="rounded-full text-xs">
            Aktivne {items.length > 0 ? `(${items.length})` : ''}
          </TabsTrigger>
          <TabsTrigger value="previous" className="rounded-full text-xs">
            Prethodne {previousItems.length > 0 ? `(${previousItems.length})` : ''}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-5">
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
                <NotificationRow
                  key={item.id}
                  item={item}
                  onClick={handleItemClick(item)}
                  onDismiss={() => dismiss(item.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="previous" className="mt-5">
          {previousItems.length === 0 ? (
            <div className="text-center py-20 bg-card border border-dashed border-border/60 rounded-3xl">
              <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
                <Bell className="w-7 h-7 text-muted-foreground/60" />
              </div>
              <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                Nema prethodnih obavijesti
              </h2>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Obavijesti koje pročitate pojavit će se ovdje tijekom 7 dana.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {previousItems.map((item) => (
                <NotificationRow key={item.id} item={item} muted />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}