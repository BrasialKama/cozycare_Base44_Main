import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Heart, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TrustBadgeRow } from './TrustBadge';
import StarRating from './StarRating';

export default function NannyCard({ nanny }) {
  return (
    <Link to={`/NannyDetail?id=${nanny.id}`} className="block group">
      <div className="bg-card border border-border rounded-xl p-5 hover:shadow-lg hover:border-primary/20 transition-all duration-300">
        {/* Top row: photo + basic info */}
        <div className="flex gap-4">
          {/* Framed profile photo - small, not dominant */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-peach/60 shadow-sm">
              {nanny.photo_url ? (
                <img src={nanny.photo_url} alt={nanny.display_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-display font-semibold text-primary">
                    {(nanny.display_name || nanny.full_name || '?')[0]}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display font-semibold text-base text-foreground group-hover:text-primary transition-colors">
                  {nanny.display_name || nanny.full_name}
                </h3>
                {nanny.service_area && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {nanny.service_area}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="font-display font-semibold text-lg text-primary">
                  ${nanny.hourly_rate}
                  <span className="text-xs font-body text-muted-foreground font-normal">/hr</span>
                </p>
              </div>
            </div>

            {/* Rating */}
            {nanny.avg_rating > 0 && (
              <div className="mt-1.5">
                <StarRating rating={nanny.avg_rating} total={nanny.total_reviews} />
              </div>
            )}
          </div>
        </div>

        {/* Trust badges */}
        {nanny.badges?.length > 0 && (
          <div className="mt-3.5 pt-3.5 border-t border-border/60">
            <TrustBadgeRow badges={nanny.badges} />
          </div>
        )}

        {/* Bio preview */}
        {nanny.bio && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {nanny.bio}
          </p>
        )}

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {nanny.years_experience > 0 && (
            <Badge variant="secondary" className="text-[11px] font-medium bg-peach/50 text-peach-dark border-0">
              <Clock className="w-3 h-3 mr-1" />
              {nanny.years_experience} yrs exp
            </Badge>
          )}
          {nanny.specialties?.slice(0, 2).map((s) => (
            <Badge key={s} variant="secondary" className="text-[11px] font-medium bg-sage/30 text-sage-foreground border-0">
              {s}
            </Badge>
          ))}
          {nanny.certifications?.length > 0 && (
            <Badge variant="secondary" className="text-[11px] font-medium bg-primary/8 text-primary border-0">
              <Award className="w-3 h-3 mr-1" />
              {nanny.certifications.length} cert{nanny.certifications.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}