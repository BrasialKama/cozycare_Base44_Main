import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Award, CheckCircle2, Star, Video } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const CERT_STYLE = {
  'Potvrđen ID': 'text-primary bg-primary/8',
  'Provjera pozadine': 'text-sage-foreground bg-sage/20',
  'Reference': 'text-sage-foreground bg-sage/20',
  'Video': 'text-muted-foreground bg-muted/60',
};

export default function NannyCard({ nanny, onWatchVideo }) {
  const name = `${nanny.first_name} ${nanny.last_name}`;
  const initial = (nanny.first_name || '?')[0];

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-5 hover:shadow-lg hover:border-primary/15 transition-all duration-300">
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

      {nanny.certifications?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {nanny.certifications.slice(0, 3).map(c => {
            const color = CERT_STYLE[c] || 'text-muted-foreground bg-muted/50';
            return (
              <span key={c} className={`inline-flex items-center gap-1 text-[10px] font-semibold ${color} px-2.5 py-1 rounded-full`}>
                <CheckCircle2 className="w-2.5 h-2.5" />
                {c}
              </span>
            );
          })}
        </div>
      )}

      {nanny.video_url && onWatchVideo && (
        <div className="mt-3 pt-3 border-t border-border/40">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onWatchVideo(nanny); }}
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