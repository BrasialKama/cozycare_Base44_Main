import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, ShieldAlert, Baby, Heart, Pencil } from 'lucide-react';

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="w-8 h-8 rounded-xl bg-muted/60 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">{label}</p>
        <p className="text-sm text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function ProfileView({ profile, onEdit }) {
  if (!profile) {
    return (
      <Card className="p-8 text-center border-border/50 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-rose-light/40 flex items-center justify-center mx-auto mb-4">
          <Heart className="w-7 h-7 text-primary/60" />
        </div>
        <h3 className="font-display font-semibold text-lg mb-1">Dopunite profil vaše obitelji</h3>
        <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
          Dodajte podatke o obitelji kako bismo vam pronašli najbolje dadilje.
        </p>
        <Button onClick={onEdit} className="rounded-2xl px-6 font-semibold shadow-md shadow-primary/15">
          <Pencil className="w-4 h-4 mr-2" /> Uredi profil
        </Button>
      </Card>
    );
  }

  const childrenText = profile.children?.length > 0
    ? profile.children.map(c => `${c.name}${c.age ? ` (${c.age} god.)` : ''}`).join(', ')
    : null;

  return (
    <Card className="border-border/50 shadow-sm overflow-hidden">
      {/* Family name banner */}
      <div className="bg-gradient-to-r from-rose-light/30 via-peach/20 to-ivory px-6 py-4 border-b border-border/30">
        <p className="text-xs font-semibold text-primary/60 uppercase tracking-widest mb-0.5">Obitelj</p>
        <h2 className="font-display text-lg font-bold text-foreground">{profile.family_name || '—'}</h2>
      </div>

      <div className="px-6 py-3 divide-y divide-border/30">
        <InfoRow icon={MapPin} label="Kvart" value={profile.neighborhood} />
        <InfoRow icon={MapPin} label="Adresa" value={profile.address} />
        <InfoRow icon={Phone} label="Telefon" value={profile.phone} />
        <InfoRow icon={ShieldAlert} label="Hitni kontakt" value={profile.emergency_contact} />
        <InfoRow icon={Baby} label="Djeca" value={childrenText} />
        {profile.preferred_languages?.length > 0 && (
          <InfoRow icon={Heart} label="Željeni jezici" value={profile.preferred_languages.join(', ')} />
        )}
        {profile.schedule_preferences && (
          <InfoRow icon={Heart} label="Raspored" value={profile.schedule_preferences} />
        )}
        {profile.special_requirements && (
          <InfoRow icon={Heart} label="Posebni zahtjevi" value={profile.special_requirements} />
        )}
      </div>
    </Card>
  );
}