import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Award, CheckCircle2, Star, Video } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import NannyTrustBadges from '@/components/shared/NannyTrustBadges';

const CERT_STYLE = {
  'Potvrđen ID': 'text-primary bg-primary/8',
  'Provjera pozadine': 'text-sage-foreground bg-sage/20',
  'Reference': 'text-sage-foreground bg-sage/20',
  'Video': 'text-muted-foreground bg-muted/60',
};

const LIFESTYLE_IMAGES = [
  'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=60',
  'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=800&q=60',
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=60',
  'https://images.unsplash.com/photo-1484665754804-74b091211472?w=800&q=60',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=60',
];

const dailyImageUrl = LIFESTYLE_IMAGES[Math.floor(Date.now() / 86400000) % LIFESTYLE_IMAGES.length];

export default function NannyCard({ nanny, onWatchVideo }) {
  const name = `${nanny.first_name} ${nanny.last_name}`;
  const initial = (nanny.first_name || '?')[0];

  return (
    <div
      className="relative rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
      style={{
        border: '1px solid rgba(255,255,255,0.4)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      }}
    >
      {/* Background lifestyle image */}
      <div className="absolute inset-0 z-0">
        <img src={dailyImageUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0" style={{ background: 'rgba(255,255,255,0.84)' }} />
      </div>
      {/* Card content */}
      <div className="relative z-10 p-5">
      <div className="flex gap-4">
        <Link to={`/NannyDetail?id=${nanny.id}`} className="flex-shrink-0">
          <div className="w-20 h-20 rounded-xl overflow-hidden border border-border/30">
            {nanny.photo_url ? (
              <img src={nanny.photo_url} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-rose-light to-peach flex items-center justify-center">
                <span className="text-2xl font-display font-bold text-primary">{initial}</span>
              </div>
            )}
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <Link to={`/NannyDetail?id=${nanny.id}`} className="group min-w-0">
              <h3 className="font-display font-bold text-lg text-foreground leading-tight truncate group-hover:text-primary transition-colors">
                {name}
              </h3>
            </Link>
            {nanny.rating > 0 && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-sm font-semibold text-foreground">{nanny.rating.toFixed(1)}</span>
                {nanny.review_count > 0 && (
                  <span className="text-xs text-muted-foreground">({nanny.review_count})</span>
                )}
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground mt-0.5">
            {nanny.years_experience > 0 && <>{nanny.years_experience}+ god. iskustva · </>}
            <span className="font-semibold text-foreground">€{nanny.hourly_rate}</span>/sat
          </p>

          {nanny.location && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {nanny.location}
            </p>
          )}
        </div>
      </div>

      {nanny.bio && (
        <p className="text-sm text-muted-foreground leading-relaxed mt-3 line-clamp-2">{nanny.bio}</p>
      )}

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

      {/* Trust & scarcity badges */}
      <div className="mt-3">
        <NannyTrustBadges nanny={nanny} />
      </div>

      {nanny.video_url && onWatchVideo && (
        <div className="mt-3">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onWatchVideo(nanny); }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            <Video className="w-3.5 h-3.5" />
            Pogledaj video
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-4 pt-3.5 border-t border-border/40 flex items-center justify-between">
        <Link
          to={`/NannyDetail?id=${nanny.id}`}
          className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          Pogledaj profil
        </Link>
        <Link
          to={`/BookNanny?nanny_id=${nanny.id}`}
          className="text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 px-5 py-2 rounded-full transition-colors"
        >
          Rezerviraj
        </Link>
      </div>
      </div>
    </div>
  );
}