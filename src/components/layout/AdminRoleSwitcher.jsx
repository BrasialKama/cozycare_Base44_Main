import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Eye, Shield, Heart, User } from 'lucide-react';

const ROLES = [
  { key: null, label: 'Admin', icon: Shield, color: 'bg-primary text-primary-foreground' },
  { key: 'parent', label: 'Roditelj', icon: Heart, color: 'bg-rose-light text-rose' },
  { key: 'nanny', label: 'Dadilja', icon: User, color: 'bg-sage text-sage-foreground' },
];

export default function AdminRoleSwitcher() {
  const { user, viewAsRole, setViewAsRole } = useAuth();

  // Only show for real admins
  if (user?.role !== 'admin') return null;

  const activeKey = viewAsRole;

  return (
    <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-muted/60 border border-border/50">
      <Eye className="w-3.5 h-3.5 text-muted-foreground mr-1 flex-shrink-0" />
      {ROLES.map((r) => {
        const active = activeKey === r.key;
        const Icon = r.icon;
        return (
          <button
            key={r.key ?? 'admin'}
            onClick={() => setViewAsRole(r.key)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              active ? r.color + ' shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Icon className="w-3 h-3" />
            {r.label}
          </button>
        );
      })}
    </div>
  );
}