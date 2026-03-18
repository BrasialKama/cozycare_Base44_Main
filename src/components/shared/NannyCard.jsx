import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Award, CheckCircle2, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const BADGE_LABELS = {
  id_verified: 'ID Verified',
  background_check: 'Background Check',
  reference_checked: 'References',
  video_verified: 'Video Intro',
  certifications_verified: 'Certified',
};

export default function NannyCard({ nanny }) {
  const topBadges = (nanny.badges || []).slice(0, 3);
  const initial = (nanny.display_name || nanny.full_name || '?')[0];

  return (
    <Link to={`/NannyDetail?id=${nanny.id}`} className="block group">
      <div className="bg-card border border-border/50 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-foreground/6 hover:-translate-y-0.5 hover:border-primary/20 transition-all duration-300">

        {/* Hero banner */}
        <div className="relative h-36 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-light via-peach/50 to-ivory" />
          {nanny.photo_url && (
            <img
              src={nanny.photo_url}
              alt={nanny.display_name}
              className="absolute inset-0 w-full h-full object-cover object-top opacity-40 group-hover:opacity-55 transition-opacity duration-500"
            />
          )}
          {/* Rate pill */}
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl px-3.5 py-2 shadow-md shadow-foreground/8">
            <span className="font-display font-bold text-primary text-lg leading-none">${nanny.hourly_rate}</span>
            <span className="text-[10px] text-muted-foreground font-body ml-0.5">/hr</span>
          </div>
          {/* Rating pill */}
          {nanny.avg_rating > 0 && (
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-2xl px-3 py-1.5 shadow-md shadow-foreground/8 flex items-center gap-1.5">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-xs font-semibold text-foreground">{nanny.avg_rating.toFixed(1)}</span>
              {nanny.total_reviews > 0 && <span className="text-[10px] text-muted-foreground">({nanny.total_reviews})</span>}
            </div>
          )}
        </div>

        <div className="px-5 pb-6">
          {/* Avatar overlap */}
          <div className="-mt-9 mb-4">
            <div className="w-18 h-18 rounded-2xl overflow-hidden border-[3px] border-card shadow-lg inline-block" style={{width:'4.5rem',height:'4.5rem'}}>
              {nanny.photo_url ? (
                <img src={nanny.photo_url} alt={nanny.display_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-rose-light to-peach flex items-center justify-center">
                  <span className="text-2xl font-display font-bold text-primary">{initial}</span>
                </div>
              )}
            </div>
          </div>

          {/* Name & location */}
          <h3 className="font-display font-bold text-xl text-foreground group-hover:text-primary transition-colors leading-tight mb-0.5">
            {nanny.display_name || nanny.full_name}
          </h3>
          {nanny.service_area && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {nanny.service_area}
            </p>
          )}

          {/* Bio */}
          {nanny.bio && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">{nanny.bio}</p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {nanny.years_experience > 0 && (
              <Badge className="text-[11px] font-medium bg-peach/50 text-peach-dark border-0 rounded-xl px-2.5 py-1">
                <Clock className="w-2.5 h-2.5 mr-1" />{nanny.years_experience} yrs
              </Badge>
            )}
            {nanny.specialties?.slice(0, 2).map(s => (
              <Badge key={s} className="text-[11px] font-medium bg-sage/20 text-sage-foreground border-0 rounded-xl px-2.5 py-1">{s}</Badge>
            ))}
            {nanny.certifications?.length > 0 && (
              <Badge className="text-[11px] font-medium bg-primary/8 text-primary border-0 rounded-xl px-2.5 py-1">
                <Award className="w-2.5 h-2.5 mr-1" />{nanny.certifications.length} cert{nanny.certifications.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {/* Trust badges */}
          {topBadges.length > 0 && (
            <div className="pt-3.5 border-t border-border/40 flex flex-wrap gap-1.5">
              {topBadges.map(b => (
                <span key={b} className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  {BADGE_LABELS[b] || b}
                </span>
              ))}
              {(nanny.badges?.length || 0) > 3 && (
                <span className="text-[10px] text-muted-foreground self-center ml-1">+{nanny.badges.length - 3} more</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}