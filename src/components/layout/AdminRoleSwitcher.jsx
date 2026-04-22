import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Eye } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ROLES = [
  { key: 'admin', label: 'Admin' },
  { key: 'parent', label: 'Roditelj' },
  { key: 'nanny', label: 'Dadilja' },
];

export default function AdminRoleSwitcher() {
  const { user, viewAsRole, setViewAsRole } = useAuth();

  if (user?.app_role !== 'admin' && user?.role !== 'admin') return null;

  // null means admin (no override), otherwise parent/nanny
  const currentValue = viewAsRole || 'admin';

  return (
    <div className="px-1">
      <label className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground mb-1.5 px-1">
        <Eye className="w-3 h-3" />
        Prikaz uloge
      </label>
      <Select
        value={currentValue}
        onValueChange={(val) => setViewAsRole(val === 'admin' ? null : val)}
      >
        <SelectTrigger className="h-8 text-xs rounded-lg bg-muted/40 border-border/50">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ROLES.map((r) => (
            <SelectItem key={r.key} value={r.key} className="text-xs">
              {r.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}