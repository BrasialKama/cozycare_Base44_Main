import React from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProfileHeader({ user, onEdit }) {
  const initials = (user?.display_name || user?.full_name || user?.email || '?')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-light to-peach flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/10">
        <span className="text-xl font-display font-bold text-primary">{initials}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h1 className="font-display text-xl font-bold text-foreground truncate">{user?.display_name || user?.full_name || (user?.email ? user.email.split('@')[0] : 'Korisnik')}</h1>
        <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
      </div>
      <Button variant="outline" size="icon" onClick={onEdit} className="rounded-xl border-border/60 flex-shrink-0">
        <Pencil className="w-4 h-4" />
      </Button>
    </div>
  );
}