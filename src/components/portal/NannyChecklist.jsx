import React from 'react';
import { Link } from 'react-router-dom';
import {
  Camera, FileText, MapPin, Clock, Award, Globe,
  Video, Users, Send, CheckCircle2, Circle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const CHECKLIST = [
  { key: 'photo_url', label: 'Profilna fotografija', icon: Camera, hint: 'Dodajte toplu, prijateljsku fotografiju' },
  { key: 'bio', label: 'Biografija', icon: FileText, hint: 'Opišite svoju filozofiju čuvanja djece' },
  { key: 'location', label: 'Lokacija', icon: MapPin, hint: 'Dodajte područje u kojem radite' },
  { key: 'years_experience', label: 'Iskustvo', icon: Clock, hint: 'Unesite godine iskustva', isNumber: true },
  { key: 'specialties', label: 'Specijalnosti', icon: Award, hint: 'Dodajte barem jednu specijalnost', isArray: true },
  { key: 'languages', label: 'Jezici', icon: Globe, hint: 'Navedite jezike koje govorite', isArray: true },
  { key: 'availability', label: 'Dostupnost', icon: Clock, hint: 'Označite kada ste dostupni', isArray: true },
  { key: 'intro_video_url', label: 'Video predstavljanje', icon: Video, hint: 'Snimite kratki video od 1-2 minute' },
  { key: 'certifications', label: 'Certifikati / Reference', icon: Users, hint: 'Dodajte certifikate ili reference', isArray: true },
  { key: '_submitted', label: 'Poslano na pregled', icon: Send, hint: 'Vaš profil je poslan na odobrenje' },
];

function isComplete(profile, item) {
  if (!profile) return false;
  if (item.key === '_submitted') return profile.status !== 'pending' || profile.is_active;
  const val = profile[item.key];
  if (item.isArray) return Array.isArray(val) && val.length > 0;
  if (item.isNumber) return typeof val === 'number' && val > 0;
  return !!val;
}

export default function NannyChecklist({ profile }) {
  const completedCount = CHECKLIST.filter(item => isComplete(profile, item)).length;
  const pct = Math.round((completedCount / CHECKLIST.length) * 100);

  const statusLabel = !profile
    ? 'Profil nije kreiran'
    : profile.status === 'pending'
    ? 'Na čekanju odobrenja'
    : profile.status === 'approved'
    ? 'Odobren'
    : 'Odbijen';

  const statusColor = !profile
    ? 'text-muted-foreground'
    : profile?.status === 'approved'
    ? 'text-emerald-600'
    : profile?.status === 'rejected'
    ? 'text-destructive'
    : 'text-amber-600';

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-display font-semibold text-base">Potpunost profila</h3>
        <span className="text-sm font-bold text-primary">{pct}%</span>
      </div>

      <Progress value={pct} className="h-2 mb-2" />

      <div className="flex items-center justify-between mb-5">
        <p className="text-xs text-muted-foreground">{completedCount} od {CHECKLIST.length} koraka završeno</p>
        <span className={`text-xs font-semibold ${statusColor}`}>{statusLabel}</span>
      </div>

      <div className="space-y-2.5">
        {CHECKLIST.map(item => {
          const done = isComplete(profile, item);
          return (
            <div key={item.key} className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                done ? 'bg-emerald-50 text-emerald-600' : 'bg-muted/50 text-muted-foreground'
              }`}>
                {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-sm font-medium ${done ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
                {!done && (
                  <p className="text-[11px] text-muted-foreground/70 leading-tight mt-0.5">{item.hint}</p>
                )}
              </div>
              {done && <item.icon className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" />}
            </div>
          );
        })}
      </div>

      {pct < 100 && (
        <Link to="/NannyProfile">
          <Button size="sm" className="rounded-xl mt-5 w-full shadow-sm shadow-primary/15">
            Dovrši profil
          </Button>
        </Link>
      )}
    </div>
  );
}