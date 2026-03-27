import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Award, CheckCircle2, Star, Video } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const BADGE_CONFIG = {
  id_verified: { label: 'Potvrđen ID', color: 'text-primary bg-primary/8' },
  background_check: { label: 'Provjera pozadine', color: 'text-sage-foreground bg-sage/20' },
  reference_checked: { label: 'Reference', color: 'text-sage-foreground bg-sage/20' },
  video_verified: { label: 'Video', color: 'text-muted-foreground bg-muted/60' },
  certifications_verified: { label: 'Certificirana', color: 'text-primary bg-primary/8' },
};

export default function NannyCard({ nanny, onWatchVideo }) {
  const initial = (nanny.display_name || nanny.full_name || '?')[0];
  const topBadges = (nanny.badges || []).slice(0, 3);

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-5 hover:shadow-lg hover:border-primary/15 transition-all duration-300">
      {/* Top row: photo + info side by side */}
      <div className="flex gap-4">
        {/* Profile photo */}
        <Link to={`/NannyDetail?id=${nanny.id}`} className="flex-shrink-0">
          <div className="w-20 h-20 rounded-xl overflow-hidden border border-border/30">
            {nanny.photo_url ? (
              <img src={nanny.photo_url} alt={nanny.display_name || nanny.full_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-rose-light to-peach flex items-center justify-center">
                <span className="text-2xl font-display font-bold text-primary">{initial}</span>
              </div>
            )}
          </div>
        </Link>

        {/* Name, rating, rate, location */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <Link to={`/NannyDetail?id=${nanny.id}`} className="group min-w-0">
              <h3 className="font-display font-bold text-lg text-foreground leading-tight truncate group-hover:text-primary transition-colors">
                {nanny.display_name || nanny.full_name}
              </h3>
            </Link>
            {nanny.avg_rating > 0 && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-sm font-semibold text-foreground">{nanny.avg_rating.toFixed(1)}</span>
                {nanny.total_reviews > 0 && (
                  <span className="text-xs text-muted-foreground">({nanny.total_reviews})</span>
                )}
              </div>
            )}
          </div>

          {/* Experience + rate */}
          <p className="text-sm text-muted-foreground mt-0.5">
            {nanny.years_experience > 0 && <>{nanny.years_experience}+ god. iskustva · </>}
            <span className="font-semibold text-foreground">€{nanny.hourly_rate}</span>/hr
          </p>

          {/* Location */}
          {nanny.service_area && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {nanny.service_area}
            </p>
          )}
        </div>
      </div>

      {/* Bio snippet */}
      {nanny.bio && (
        <p className="text-sm text-muted-foreground leading-relaxed mt-3 line-clamp-2">
          {nanny.bio}
        </p>
      )}

      {/* Tags: specialties, languages, certs */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {nanny.years_experience > 0 && (
          <Badge className="text-[11px] font-medium bg-peach/50 text-peach-dark border-0 rounded-full px-2.5 py-0.5">
            <Clock className="w-2.5 h-2.5 mr-1" />{nanny.years_experience} god.
          </Badge>
        )}
        {nanny.specialties?.slice(0, 2).map(s => (
          <Badge key={s} className="text-[11px] font-medium bg-muted/60 text-foreground/70 border-0 rounded-full px-2.5 py-0.5">{s}</Badge>
        ))}
        {nanny.languages?.slice(0, 2).map(l => (
          <Badge key={l} className="text-[11px] font-medium bg-sage/15 text-sage-foreground border-0 rounded-full px-2.5 py-0.5">{l}</Badge>
        ))}
        {nanny.certifications?.length > 0 && (
          <Badge className="text-[11px] font-medium bg-primary/8 text-primary border-0 rounded-full px-2.5 py-0.5">
            <Award className="w-2.5 h-2.5 mr-1" />{nanny.certifications.length} cert.
          </Badge>
        )}
      </div>

      {/* Trust badges */}
      {topBadges.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {topBadges.map(b => {
            const cfg = BADGE_CONFIG[b] || { label: b, color: 'text-muted-foreground bg-muted/50' };
            return (
              <span key={b} className={`inline-flex items-center gap-1 text-[10px] font-semibold ${cfg.color} px-2.5 py-1 rounded-full`}>
                <CheckCircle2 className="w-2.5 h-2.5" />
                {cfg.label}
              </span>
            );
          })}
          {(nanny.badges?.length || 0) > 3 && (
            <span className="text-[10px] text-muted-foreground self-center ml-1">+{nanny.badges.length - 3} more</span>
          )}
        </div>
      )}

      {/* Action row */}
      {(nanny.intro_video_url || nanny.badges?.includes('video_verified')) && onWatchVideo && (
        <div className="mt-3 pt-3 border-t border-border/40">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onWatchVideo(nanny);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            <Video className="w-3.5 h-3.5" />
            Pogledaj video
          </button>
        </div>
      )}
    </div>
  );
}