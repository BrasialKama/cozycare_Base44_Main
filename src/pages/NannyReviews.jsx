import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Star, Heart } from 'lucide-react';

function Stars({ rating, size = 'w-4 h-4' }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`${size} ${i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`} />
      ))}
    </div>
  );
}

function relativeTime(iso) {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (days < 1) return 'danas';
  if (days === 1) return 'jučer';
  if (days < 7) return `prije ${days} dana`;
  if (days < 30) {
    const w = Math.floor(days / 7);
    return `prije ${w} ${w === 1 ? 'tjedan' : w < 5 ? 'tjedna' : 'tjedana'}`;
  }
  if (days < 365) {
    const m = Math.floor(days / 30);
    return `prije ${m} ${m === 1 ? 'mjesec' : m < 5 ? 'mjeseca' : 'mjeseci'}`;
  }
  const y = Math.floor(days / 365);
  return `prije ${y} ${y === 1 ? 'godinu' : y < 5 ? 'godine' : 'godina'}`;
}

function avgOf(reviews, field) {
  const vals = reviews.map(r => Number(r[field])).filter(n => Number.isFinite(n) && n > 0);
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function StrengthBar({ label, value }) {
  const pct = value ? (value / 5) * 100 : 0;
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground font-mono">{value ? value.toFixed(1) : '—'} / 5.0</span>
      </div>
      <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function NannyReviews() {
  const { user } = useAuth();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['nannyOwnReviews', user?.email],
    queryFn: () => base44.entities.Review.filter({ nanny_email: user?.email }, '-created_date', 200),
    enabled: !!user?.email,
  });

  const overallAvg = avgOf(reviews, 'rating');
  const warmth = avgOf(reviews, 'warmth_rating');
  const reliability = avgOf(reviews, 'reliability_rating');
  const communication = avgOf(reviews, 'communication_rating');

  return (
    <div className="max-w-3xl mx-auto px-5 py-8 space-y-8">
      <Link to="/Home" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Natrag
      </Link>

      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Vaše recenzije</h1>
        <p className="text-sm text-muted-foreground mt-1">Pregled svih recenzija koje ste primili od obitelji.</p>
      </div>

      {/* ── Summary ── */}
      <section className="bg-gradient-to-br from-rose-light/40 to-peach/20 border border-rose-light/50 rounded-3xl p-8 text-center">
        {reviews.length === 0 ? (
          <>
            <Heart className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="font-display text-lg font-semibold text-foreground">Još nema recenzija</p>
            <p className="text-sm text-muted-foreground mt-1">Kad završite svoje prve rezervacije, obitelji će moći ostaviti recenziju.</p>
          </>
        ) : (
          <>
            <p className="font-display text-6xl font-bold text-foreground">{overallAvg?.toFixed(1) || '—'}</p>
            <div className="flex justify-center mt-3">
              <Stars rating={overallAvg || 0} size="w-5 h-5" />
            </div>
            <p className="text-sm text-muted-foreground mt-3">na temelju {reviews.length} {reviews.length === 1 ? 'recenzije' : reviews.length < 5 ? 'recenzije' : 'recenzija'}</p>
          </>
        )}
      </section>

      {/* ── Strengths breakdown ── */}
      {reviews.length > 0 && (
        <section className="bg-card border border-border/50 rounded-3xl p-6">
          <h2 className="font-display text-lg font-semibold mb-5">U čemu ste najbolji</h2>
          <StrengthBar label="Toplina i ljubaznost" value={warmth} />
          <StrengthBar label="Pouzdanost" value={reliability} />
          <StrengthBar label="Komunikacija" value={communication} />
        </section>
      )}

      {/* ── Full list ── */}
      {reviews.length > 0 && (
        <section>
          <h2 className="font-display text-lg font-semibold mb-4">Sve recenzije</h2>
          <div className="space-y-3">
            {reviews.map(r => (
              <div key={r.id} className="bg-card border border-border/50 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-sm text-foreground">{r.parent_name || 'Obitelj'}</p>
                  <div className="flex items-center gap-3">
                    <Stars rating={r.rating} />
                    <span className="text-xs text-muted-foreground">{relativeTime(r.created_date)}</span>
                  </div>
                </div>
                {r.comment && (
                  <p className="text-sm text-foreground/80 leading-relaxed">{r.comment}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {isLoading && (
        <p className="text-center text-sm text-muted-foreground py-6">Učitavanje…</p>
      )}
    </div>
  );
}