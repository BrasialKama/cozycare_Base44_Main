import React from 'react';
import { ShieldCheck, Camera, FileCheck, UserCheck, Award } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const badgeConfig = {
  id_verified: {
    icon: ShieldCheck,
    label: 'Potvrđen identitet',
    description: 'Identitet potvrđen službenim dokumentom',
    color: 'text-primary bg-primary/10',
  },
  background_check: {
    icon: FileCheck,
    label: 'Provjera pozadine',
    description: 'Prošla kompletnu provjeru pozadine',
    color: 'text-secondary-foreground bg-secondary/60',
  },
  reference_checked: {
    icon: UserCheck,
    label: 'Provjerene reference',
    description: 'Profesionalne reference su kontaktirane i provjerene',
    color: 'text-accent-foreground bg-accent',
  },
  video_verified: {
    icon: Camera,
    label: 'Video verifikacija',
    description: 'Završen video intervju za verifikaciju',
    color: 'text-terracotta bg-peach',
  },
  certifications_verified: {
    icon: Award,
    label: 'Certifikati provjereni',
    description: 'Profesionalni certifikati su provjereni',
    color: 'text-sage-foreground bg-sage/40',
  },
};

export default function TrustBadge({ badge, size = 'sm' }) {
  const config = badgeConfig[badge];
  if (!config) return null;

  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'w-7 h-7' : 'w-9 h-9';
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className={`${sizeClasses} rounded-full ${config.color} flex items-center justify-center`}>
            <Icon className={iconSize} />
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-[200px]">
          <p className="font-semibold text-xs">{config.label}</p>
          <p className="text-xs text-muted-foreground">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function TrustBadgeRow({ badges = [], size = 'sm' }) {
  if (!badges.length) return null;
  return (
    <div className="flex items-center gap-1.5">
      {badges.map((badge) => (
        <TrustBadge key={badge} badge={badge} size={size} />
      ))}
    </div>
  );
}