import React from 'react';
import { Heart } from 'lucide-react';

export default function EmptyState({ icon: Icon = Heart, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-primary/60" />
      </div>
      <h3 className="font-display text-lg font-semibold text-foreground mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}