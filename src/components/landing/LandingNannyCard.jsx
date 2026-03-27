import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShieldCheck, CheckCircle2, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BADGE_CONFIG = {
  id_verified: { label: 'ID Verified', icon: ShieldCheck, color: 'text-primary', bg: 'bg-primary/8' },
  background_check: { label: 'SafeCheck', icon: CheckCircle2, color: 'text-muted-foreground', bg: 'bg-muted/50' },
  video_verified: { label: 'Video Intro', icon: Video, color: 'text-muted-foreground', bg: 'bg-muted/50' },
  reference_checked: { label: 'References', icon: CheckCircle2, color: 'text-muted-foreground', bg: 'bg-muted/50' },
  certifications_verified: { label: 'Certified', icon: CheckCircle2, color: 'text-muted-foreground', bg: 'bg-muted/50' },
};

export default function LandingNannyCard({ nanny }) {
  const initial = (nanny.display_name || nanny.full_name || '?')[0];
  const badges = (nanny.badges || []).slice(0, 3);
  const expLabel = nanny.years_experience
    ? `${nanny.years_experience}+ Years Experience`
    : 'Experienced';

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300">
      {/* Top row: photo + info */}
      <div className="flex gap-4 mb-4">
        {/* Profile image */}
        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-border/30">
          {nanny.photo_url ? (
            <img
              src={nanny.photo_url}
              alt={nanny.display_name || nanny.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-rose-light to-peach flex items-center justify-center">
              <span className="text-2xl font-display font-bold text-primary">{initial}</span>
            </div>
          )}
        </div>

        {/* Name, rating, details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display font-bold text-lg text-foreground leading-tight truncate">
              {nanny.display_name || nanny.full_name}
            </h3>
            {nanny.avg_rating > 0 && (
              <span className="inline-flex items-center gap-1 flex-shrink-0">
                <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                <span className="text-sm font-semibold text-primary">{nanny.avg_rating.toFixed(1)}</span>
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {expLabel} · €{nanny.hourly_rate}/hr
          </p>

          {/* Trust badges */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {badges.map((b) => {
                const cfg = BADGE_CONFIG[b] || { label: b, icon: CheckCircle2, color: 'text-muted-foreground', bg: 'bg-muted/50' };
                const Icon = cfg.icon;
                return (
                  <span
                    key={b}
                    className={`inline-flex items-center gap-1 text-[11px] font-medium ${cfg.color} ${cfg.bg} px-2 py-0.5 rounded-full`}
                  >
                    <Icon className="w-3 h-3" />
                    {cfg.label}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bio quote */}
      {nanny.bio && (
        <p className="text-sm text-muted-foreground italic leading-relaxed mb-5 line-clamp-3">
          "{nanny.bio}"
        </p>
      )}

      {/* Divider + actions */}
      <div className="border-t border-border/40 pt-4 flex items-center justify-between gap-3">
        <Link
          to={`/NannyDetail?id=${nanny.id}`}
          className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          View Full Portfolio
        </Link>
        <Button
          size="sm"
          asChild
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-5 h-9 text-sm font-semibold"
        >
          <Link to={`/BookNanny?nannyId=${nanny.id}`}>Request Booking</Link>
        </Button>
      </div>
    </div>
  );
}