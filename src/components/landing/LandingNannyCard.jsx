import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShieldCheck, CheckCircle2, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CERT_CONFIG = {
  'Potvrđen ID': { label: 'Potvrđen ID', icon: ShieldCheck, color: 'text-primary', bg: 'bg-primary/8' },
  'Provjera pozadine': { label: 'Provjera pozadine', icon: CheckCircle2, color: 'text-muted-foreground', bg: 'bg-muted/50' },
  'Video': { label: 'Video', icon: Video, color: 'text-muted-foreground', bg: 'bg-muted/50' },
  'Reference': { label: 'Reference', icon: CheckCircle2, color: 'text-muted-foreground', bg: 'bg-muted/50' },
};

export default function LandingNannyCard({ nanny }) {
  const name = `${nanny.first_name || ''} ${nanny.last_name_initial || ''}`.trim();
  const initial = (nanny.first_name || '?')[0];
  const expLabel = nanny.experience_years
    ? `${nanny.experience_years}+ god. iskustva`
    : 'Iskusna';

  const certs = (nanny.badges || []).slice(0, 3);

  return (
    <div
      className="rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
      style={{
        background: 'rgba(255,255,255,0.7)',
        border: '1px solid rgba(255,255,255,0.4)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      }}
    >
      <div className="flex gap-4 mb-4">
        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-border/30">
          {nanny.profile_photo_url ? (
            <img src={nanny.profile_photo_url} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-rose-light to-peach flex items-center justify-center">
              <span className="text-2xl font-display font-bold text-primary">{initial}</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display font-bold text-lg text-foreground leading-tight truncate">{name}</h3>
            {nanny.rating > 0 && (
              <span className="inline-flex items-center gap-1 flex-shrink-0">
                <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                <span className="text-sm font-semibold text-primary">{nanny.rating.toFixed(1)}</span>
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {expLabel} · €{nanny.hourly_rate}/sat
          </p>

          {certs.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {certs.map(c => {
                const cfg = CERT_CONFIG[c] || { label: c, icon: CheckCircle2, color: 'text-muted-foreground', bg: 'bg-muted/50' };
                const Icon = cfg.icon;
                return (
                  <span key={c} className={`inline-flex items-center gap-1 text-[11px] font-medium ${cfg.color} ${cfg.bg} px-2 py-0.5 rounded-full`}>
                    <Icon className="w-3 h-3" />
                    {cfg.label}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {nanny.bio && (
        <p className="text-sm text-muted-foreground italic leading-relaxed mb-5 line-clamp-3">
          "{nanny.bio}"
        </p>
      )}

      <div className="border-t border-border/40 pt-4 flex items-center justify-between gap-3">
        <Link
          to={`/NannyDetail?id=${nanny.id}`}
          className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          Pogledaj profil
        </Link>
        <Button
          size="sm"
          asChild
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-5 h-9 text-sm font-semibold"
        >
          <Link to={`/BookNanny?nanny_id=${nanny.id}`}>Rezerviraj</Link>
        </Button>
      </div>
    </div>
  );
}