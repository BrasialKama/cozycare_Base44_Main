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
    <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-1">
      <Eye className="w-3 h-3 text-muted-foreground mx-1 flex-shrink-0" />
      {ROLES.map((r) => {
        const active = activeKey === r.key;
        const Icon = r.icon;
        return (
          <button
            key={r.key ?? 'admin'}
            onClick={() => setViewAsRole(r.key)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all whitespace-nowrap ${
              active ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="w-3 h-3 flex-shrink-0" />
            {r.label}
          </button>
        );
      })}
    </div>
  );
}