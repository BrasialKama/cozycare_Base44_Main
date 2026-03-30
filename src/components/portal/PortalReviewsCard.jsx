import React from 'react';
import { Star, Heart } from 'lucide-react';

function MiniStars({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3 h-3 ${i <= rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`} />
      ))}
    </div>
  );
}

export default function PortalReviewsCard({ reviews, avgRating, totalReviews }) {
  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display font-semibold text-base">Recenzije</h3>
        <div className="flex items-center gap-1.5">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="text-sm font-bold">{avgRating ? avgRating.toFixed(1) : '—'}</span>
          <span className="text-xs text-muted-foreground">({totalReviews || 0})</span>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-6">
          <Heart className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Još nema recenzija</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.slice(0, 3).map(r => (
            <div key={r.id} className="border-b border-border/40 last:border-0 pb-3 last:pb-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-foreground">{r.parent_name || 'Roditelj'}</p>
                <MiniStars rating={r.rating} />
              </div>
              {r.comment && (
                <p className="text-xs text-muted-foreground line-clamp-2">{r.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}