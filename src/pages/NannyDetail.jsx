import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin, Clock, Award, MessageCircle, Calendar, ArrowLeft,
  Play, Shield, Heart, Globe, BookOpen, CheckCircle2, Sparkles, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&q=80',
  'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&q=80',
  'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=80',
  'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80',
  'https://images.unsplash.com/photo-1566140967404-b8b3932483f5?w=800&q=80',
  'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&q=80',
  'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800&q=80',
  'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=800&q=80',
];

const CERT_STYLE = {
  'Potvrđen ID': 'text-primary bg-primary/8',
  'Provjera pozadine': 'text-sage-foreground bg-sage/20',
  'Reference': 'text-sage-foreground bg-sage/20',
  'Video': 'text-peach-dark bg-peach/50',
};

function ReviewCard({ review, isFirst }) {
  return (
    <div>
      {!isFirst && <Separator className="my-5 opacity-40" />}
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-light to-peach/60 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-primary">{(review.parent_name || 'P')[0]}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
            <p className="text-sm font-semibold text-foreground">{review.parent_name || 'Roditelj'}</p>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-muted/40'}`} />
              ))}
            </div>
          </div>
          {review.comment && (
            <p className="text-sm text-muted-foreground leading-relaxed italic">"{review.comment}"</p>
          )}
          {(review.warmth_rating || review.reliability_rating || review.communication_rating) && (
            <div className="flex flex-wrap gap-3 mt-3">
              {review.warmth_rating && <span className="text-[11px] text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-lg">Toplina <strong className="text-foreground">{review.warmth_rating}/5</strong></span>}
              {review.reliability_rating && <span className="text-[11px] text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-lg">Pouzdanost <strong className="text-foreground">{review.reliability_rating}/5</strong></span>}
              {review.communication_rating && <span className="text-[11px] text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-lg">Komunikacija <strong className="text-foreground">{review.communication_rating}/5</strong></span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NannyDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: nanny, isLoading } = useQuery({
    queryKey: ['nannyProfile', id],
    queryFn: async () => {
      const profiles = await base44.entities.NannyProfile.filter({ id });
      return profiles[0];
    },
    enabled: !!id,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['nannyReviews', id],
    queryFn: () => base44.entities.Review.filter({ nanny_profile_id: id }, '-created_date', 10),
    enabled: !!id,
  });

  const handleMessage = async () => {
    if (!nanny) return;
    const nannyEmail = nanny.created_by;
    const existing = await base44.entities.Conversation.filter({});
    const found = existing.find(c =>
      c.participant_emails?.includes(user.email) &&
      c.participant_emails?.includes(nannyEmail)
    );
    if (found) {
      navigate(`/Messages?conversation=${found.id}`);
    } else {
      const name = `${nanny.first_name} ${nanny.last_name}`;
      const conv = await base44.entities.Conversation.create({
        participant_emails: [user.email, nannyEmail],
        participant_names: [user.display_name || user.full_name, name],
        last_message: '',
      });
      navigate(`/Messages?conversation=${conv.id}`);
    }
  };

  const heroImage = useMemo(() => HERO_IMAGES[Math.floor(Math.random() * HERO_IMAGES.length)], [id]);

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!nanny) return <div className="text-center py-16 text-muted-foreground">Dadilja nije pronađena.</div>;

  const name = `${nanny.first_name} ${nanny.last_name}`;
  const initial = (nanny.first_name || '?')[0];

  return (
    <div className="pb-12">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-medium text-primary/70 hover:text-primary mb-7 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Natrag na rezultate
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        {/* LEFT: Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Hero card */}
          <div className="rounded-3xl overflow-hidden border border-border/50 shadow-lg shadow-primary/5 bg-card relative">
            <div className="absolute inset-0 z-0">
              <img src={heroImage} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(250,248,245,0.25) 0%, rgba(250,248,245,0.80) 55%, rgba(250,248,245,1) 100%)' }} />
            </div>
            <div className="relative z-10 px-7 pt-8 pb-7">
              <div className="flex items-end gap-5 mb-5">
                <div className="relative flex-shrink-0">
                  <div className="absolute -inset-2 rounded-[1.75rem] bg-gradient-to-br from-rose-light via-peach/60 to-sage/30 opacity-70 blur-sm" />
                  <div className="absolute -inset-1.5 rounded-[1.5rem] bg-gradient-to-br from-primary/15 via-peach/40 to-sage/20" />
                  <div className="relative w-24 h-24 rounded-3xl overflow-hidden border-[3px] border-card shadow-xl">
                    {nanny.photo_url ? (
                      <img src={nanny.photo_url} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-rose-light to-peach flex items-center justify-center">
                        <span className="text-4xl font-display font-bold text-primary">{initial}</span>
                      </div>
                    )}
                  </div>
                </div>
                {nanny.rating > 0 && (
                  <div className="pb-1 flex items-center gap-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.round(nanny.rating) ? 'text-amber-400 fill-amber-400' : 'text-muted/30'}`} />
                    ))}
                    <span className="text-sm font-semibold text-foreground ml-1">{nanny.rating.toFixed(1)}</span>
                    {nanny.review_count > 0 && <span className="text-xs text-muted-foreground">({nanny.review_count} recenzija)</span>}
                  </div>
                )}
              </div>

              <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-2">{name}</h1>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-5">
                {nanny.location && (
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-primary/60" /> {nanny.location}</span>
                )}
                {nanny.years_experience > 0 && (
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary/60" /> {nanny.years_experience} godina iskustva</span>
                )}
              </div>

              {nanny.certifications?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {nanny.certifications.map(c => {
                    const color = CERT_STYLE[c] || 'text-muted-foreground bg-muted/50';
                    return (
                      <span key={c} className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${color}`}>
                        <CheckCircle2 className="w-3 h-3" />
                        {c}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* About */}
          {nanny.bio && (
            <div className="bg-card border border-border/50 rounded-3xl p-7 shadow-sm shadow-primary/3">
              <h3 className="font-display font-semibold text-xl mb-4 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Heart className="w-3.5 h-3.5 text-primary" fill="currentColor" />
                </div>
                O meni
              </h3>
              <p className="text-sm text-muted-foreground leading-[1.8] whitespace-pre-line">{nanny.bio}</p>
            </div>
          )}

          {/* Intro video */}
          {nanny.video_url && (
            <div className="bg-card border border-border/50 rounded-3xl p-7 shadow-sm shadow-primary/3">
              <h3 className="font-display font-semibold text-xl mb-4 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Play className="w-3.5 h-3.5 text-primary" />
                </div>
                Video predstavljanje
              </h3>
              <div className="rounded-2xl overflow-hidden bg-muted aspect-video">
                <video src={nanny.video_url} controls className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {/* Details & credentials */}
          <div className="bg-card border border-border/50 rounded-3xl p-7 shadow-sm shadow-primary/3">
            <h3 className="font-display font-semibold text-xl mb-6 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-peach/50 flex items-center justify-center">
                <Award className="w-3.5 h-3.5 text-peach-dark" />
              </div>
              Detalji i kvalifikacije
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
              {nanny.languages?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-3">
                    <Globe className="w-3.5 h-3.5" /> Jezici
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {nanny.languages.map(l => <Badge key={l} variant="secondary" className="rounded-xl text-xs px-3 py-1">{l}</Badge>)}
                  </div>
                </div>
              )}
              {nanny.specialties?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-3">
                    <Sparkles className="w-3.5 h-3.5" /> Specijalnosti
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {nanny.specialties.map(s => <Badge key={s} className="rounded-xl text-xs px-3 py-1 bg-sage/20 text-sage-foreground border-0">{s}</Badge>)}
                  </div>
                </div>
              )}
              {nanny.availability?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-3">
                    <Clock className="w-3.5 h-3.5" /> Dostupnost
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {nanny.availability.map(a => <Badge key={a} className="rounded-xl text-xs px-3 py-1 bg-peach/50 text-peach-dark border-0">{a}</Badge>)}
                  </div>
                </div>
              )}
              {nanny.age_groups?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-3">
                    <Heart className="w-3.5 h-3.5" /> Dobne skupine
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {nanny.age_groups.map(a => <Badge key={a} className="rounded-xl text-xs px-3 py-1 bg-primary/8 text-primary border-0">{a}</Badge>)}
                  </div>
                </div>
              )}
              {nanny.certifications?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-3">
                    <Award className="w-3.5 h-3.5" /> Certifikati
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {nanny.certifications.map(c => <Badge key={c} className="rounded-xl text-xs px-3 py-1 bg-peach/50 text-peach-dark border-0">{c}</Badge>)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reviews */}
          {reviews.length > 0 && (
            <div className="bg-card border border-border/50 rounded-3xl p-7 shadow-sm shadow-primary/3">
              <h3 className="font-display font-semibold text-xl mb-6 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Star className="w-3.5 h-3.5 text-primary" fill="currentColor" />
                </div>
                Recenzije obitelji
                <span className="ml-2 text-sm font-body font-normal text-muted-foreground">({reviews.length})</span>
              </h3>
              {reviews.map((r, i) => (
                <ReviewCard key={r.id} review={r} isFirst={i === 0} />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Sticky sidebar */}
        <div>
          <div className="sticky top-6 space-y-4">
            <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-lg shadow-primary/5">
              <div className="text-center mb-6">
                <p className="font-display text-5xl font-bold text-primary leading-none">€{nanny.hourly_rate}</p>
                <p className="text-sm text-muted-foreground mt-1.5">po satu</p>
              </div>
              <Separator className="mb-6 opacity-40" />
              {user?.role === 'parent' && (
                <div className="space-y-2.5">
                  <Link to={`/BookNanny?nanny_id=${nanny.id}`} className="block">
                    <Button className="w-full h-12 font-semibold rounded-2xl text-sm shadow-md shadow-primary/25">
                      <Calendar className="w-4 h-4 mr-2" />
                      Rezerviraj termin
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full h-12 rounded-2xl text-sm border-border/60" onClick={handleMessage}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Pošalji poruku
                  </Button>
                </div>
              )}
              <div className="mt-6 pt-5 border-t border-border/40">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sage/25 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-sage-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground mb-0.5">CozyCare jamstvo</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Svaka dadilja ima provjeru pozadine, verificirane reference i recenzije stvarnih obitelji.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {(nanny.review_count > 0 || nanny.rating > 0) && (
              <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm shadow-primary/3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Pregled</h4>
                <div className="space-y-3.5">
                  {nanny.rating > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Prosječna ocjena</span>
                      <span className="text-sm font-semibold text-foreground flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />{nanny.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                  {nanny.review_count > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Recenzije obitelji</span>
                      <span className="text-sm font-semibold text-foreground">{nanny.review_count}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}