import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Award, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import StarRating from './StarRating';

const BADGE_LABELS = {
  id_verified: 'ID Verified',
  background_check: 'Background Check',
  reference_checked: 'References',
  video_verified: 'Video Intro',
  certifications_verified: 'Certified',
};

export default function NannyCard({ nanny }) {
  const topBadges = (nanny.badges || []).slice(0, 3);

  return (
    <Link to={`/NannyDetail?id=${nanny.id}`} className="block group">
      <div className="bg-card border border-border/60 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-foreground/5 hover:border-primary/25 transition-all duration-300">

        {/* Photo banner */}
        <div className="relative h-32 bg-gradient-to-br from-rose-light via-peach/60 to-ivory overflow-hidden">
          {nanny.photo_url ? (
            <img
              src={nanny.photo_url}
              alt={nanny.display_name}
              className="w-full h-full object-cover object-top opacity-60 group-hover:opacity-75 transition-opacity duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-display text-6xl font-bold text-primary/20">
                {(nanny.display_name || nanny.full_name || '?')[0]}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-transparent to-transparent" />
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-sm">
            <span className="font-display font-bold text-primary text-base leading-none">${nanny.hourly_rate}</span>
            <span className="text-[10px] text-muted-foreground font-body">/hr</span>
          </div>
        </div>

        <div className="px-5 pb-5">
          {/* Avatar + rating */}
          <div className="flex items-end justify-between -mt-8 mb-3">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-[3px] border-card shadow-md flex-shrink-0">
              {nanny.photo_url ? (
                <img src={nanny.photo_url} alt={nanny.display_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-display font-semibold text-primary">
                    {(nanny.display_name || nanny.full_name || '?')[0]}
                  </span>
                </div>
              )}
            </div>
            {nanny.avg_rating > 0 && (
              <StarRating rating={nanny.avg_rating} total={nanny.total_reviews} />
            )}
          </div>

          <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors leading-tight">
            {nanny.display_name || nanny.full_name}
          </h3>
          {nanny.service_area && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {nanny.service_area}
            </p>
          )}

          {nanny.bio && (
            <p className="mt-3 text-sm text-muted-foreground line-clamp-2 leading-relaxed">{nanny.bio}</p>
          )}

          <div className="mt-3.5 flex flex-wrap gap-2">
            {nanny.years_experience > 0 && (
              <Badge variant="secondary" className="text-[11px] font-medium bg-peach/50 text-peach-dark border-0 rounded-lg">
                <Clock className="w-3 h-3 mr-1" />{nanny.years_experience} yrs exp
              </Badge>
            )}
            {nanny.specialties?.slice(0, 2).map((s) => (
              <Badge key={s} variant="secondary" className="text-[11px] font-medium bg-sage/25 text-sage-foreground border-0 rounded-lg">{s}</Badge>
            ))}
            {nanny.certifications?.length > 0 && (
              <Badge variant="secondary" className="text-[11px] font-medium bg-primary/8 text-primary border-0 rounded-lg">
                <Award className="w-3 h-3 mr-1" />{nanny.certifications.length} cert{nanny.certifications.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {topBadges.length > 0 && (
            <div className="mt-3.5 pt-3.5 border-t border-border/50 flex flex-wrap gap-2">
              {topBadges.map(badge => (
                <span key={badge} className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary/80 bg-primary/6 px-2 py-1 rounded-lg">
                  <CheckCircle2 className="w-3 h-3 text-primary" />
                  {BADGE_LABELS[badge] || badge}
                </span>
              ))}
              {(nanny.badges?.length || 0) > 3 && (
                <span className="text-[10px] text-muted-foreground px-2 py-1">+{nanny.badges.length - 3} more</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}