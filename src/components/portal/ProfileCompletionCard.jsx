import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, FileText, Award, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FIELDS = [
  { key: 'photo_url', label: 'Profilna fotografija', icon: Camera },
  { key: 'bio', label: 'Biografija', icon: FileText },
  { key: 'certifications', label: 'Certifikati', icon: Award, isArray: true },
  { key: 'availability', label: 'Dostupnost', icon: Clock },
];

export default function ProfileCompletionCard({ profile }) {
  const completed = FIELDS.filter(f => {
    const val = profile?.[f.key];
    if (f.isArray) return val && val.length > 0;
    return !!val;
  });
  const pct = Math.round((completed.length / FIELDS.length) * 100);

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-base">Potpunost profila</h3>
        <span className="text-sm font-bold text-primary">{pct}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden mb-5">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="space-y-3">
        {FIELDS.map(f => {
          const val = profile?.[f.key];
          const done = f.isArray ? val && val.length > 0 : !!val;
          return (
            <div key={f.key} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                done ? 'bg-emerald-50 text-emerald-600' : 'bg-muted/60 text-muted-foreground'
              }`}>
                {done ? <CheckCircle2 className="w-4 h-4" /> : <f.icon className="w-4 h-4" />}
              </div>
              <span className={`text-sm ${done ? 'text-foreground' : 'text-muted-foreground'}`}>{f.label}</span>
            </div>
          );
        })}
      </div>

      {pct < 100 && (
        <Link to="/NannyProfile">
          <Button size="sm" variant="outline" className="rounded-full mt-5 w-full">
            Dovrši profil
          </Button>
        </Link>
      )}
    </div>
  );
}