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
  'https://images.unsplash.com/photo-1530026405186-ed1f139313f0?w=800&q=80',
  'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=800&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
];

const BADGE_META = {
  id_verified: { label: 'ID Verified', icon: CheckCircle2, color: 'text-primary bg-primary/8' },
  background_check: { label: 'Background Check', icon: Shield, color: 'text-sage-foreground bg-sage/20' },
  reference_checked: { label: 'References Checked', icon: CheckCircle2, color: 'text-sage-foreground bg-sage/20' },
  video_verified: { label: 'Video Intro', icon: Play, color: 'text-peach-dark bg-peach/50' },
  certifications_verified: { label: 'Certified', icon: Award, color: 'text-primary bg-primary/8' },
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
            <p className="text-sm font-semibold text-foreground">{review.parent_name || 'Parent'}</p>
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
              {review.warmth_rating && <span className="text-[11px] text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-lg">Warmth <strong className="text-foreground">{review.warmth_rating}/5</strong></span>}
              {review.reliability_rating && <span className="text-[11px] text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-lg">Reliability <strong className="text-foreground">{review.reliability_rating}/5</strong></span>}
              {review.communication_rating && <span className="text-[11px] text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-lg">Communication <strong className="text-foreground">{review.communication_rating}/5</strong></span>}
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
    const existing = await base44.entities.Conversation.filter({});
    const found = existing.find(c =>
      c.participant_emails?.includes(user.email) &&
      c.participant_emails?.includes(nanny.user_email)
    );
    if (found) {
      navigate(`/Messages?conversation=${found.id}`);
    } else {
      const conv = await base44.entities.Conversation.create({
        participant_emails: [user.email, nanny.user_email],
        participant_names: [user.display_name || user.full_name, nanny.display_name || nanny.full_name],
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

  if (!nanny) return <div className="text-center py-16 text-muted-foreground">Caregiver not found.</div>;

  const initial = (nanny.display_name || nanny.full_name || '?')[0];

  return (
    <div className="pb-12">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-medium text-primary/70 hover:text-primary mb-7 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to results
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">

        {/* ── LEFT: Main content ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Hero card */}
          <div className="rounded-3xl overflow-hidden border border-border/50 shadow-lg shadow-primary/5 bg-card relative">
            {/* Warm lifestyle background */}
            <div className="absolute inset-0 z-0">
              <img
                src={heroImage}
                alt=""
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to bottom, rgba(250,248,245,0.25) 0%, rgba(250,248,245,0.80) 55%, rgba(250,248,245,1) 100%)' }}
              />
            </div>
            <div className="relative z-10 px-7 pt-8 pb-7">
              <div className="flex items-end gap-5 mb-5">
                <div className="relative flex-shrink-0">
                  {/* Warm gradient ring behind photo */}
                  <div className="absolute -inset-2 rounded-[1.75rem] bg-gradient-to-br from-rose-light via-peach/60 to-sage/30 opacity-70 blur-sm" />
                  <div className="absolute -inset-1.5 rounded-[1.5rem] bg-gradient-to-br from-primary/15 via-peach/40 to-sage/20" />
                  <div className="relative w-24 h-24 rounded-3xl overflow-hidden border-[3px] border-card shadow-xl">
                    {nanny.photo_url ? (
                      <img src={nanny.photo_url} alt={nanny.display_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-rose-light to-peach flex items-center justify-center">
                        <span className="text-4xl font-display font-bold text-primary">{initial}</span>
                      </div>
                    )}
                  </div>
                </div>
                {nanny.avg_rating > 0 && (
                  <div className="pb-1 flex items-center gap-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.round(nanny.avg_rating) ? 'text-amber-400 fill-amber-400' : 'text-muted/30'}`} />
                    ))}
                    <span className="text-sm font-semibold text-foreground ml-1">{nanny.avg_rating.toFixed(1)}</span>
                    {nanny.total_reviews > 0 && <span className="text-xs text-muted-foreground">({nanny.total_reviews} reviews)</span>}
                  </div>
                )}
              </div>

              <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-2">
                {nanny.display_name || nanny.full_name}
              </h1>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-5">
                {nanny.service_area && (
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-primary/60" /> {nanny.service_area}</span>
                )}
                {nanny.years_experience > 0 && (
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary/60" /> {nanny.years_experience} years experience</span>
                )}
              </div>

              {nanny.badges?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {nanny.badges.map(b => {
                    const meta = BADGE_META[b];
                    if (!meta) return null;
                    const Icon = meta.icon;
                    return (
                      <span key={b} className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${meta.color}`}>
                        <Icon className="w-3 h-3" />
                        {meta.label}
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
                About Me
              </h3>
              <p className="text-sm text-muted-foreground leading-[1.8] whitespace-pre-line">{nanny.bio}</p>
            </div>
          )}

          {/* Intro video */}
          {nanny.intro_video_url && (
            <div className="bg-card border border-border/50 rounded-3xl p-7 shadow-sm shadow-primary/3">
              <h3 className="font-display font-semibold text-xl mb-4 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Play className="w-3.5 h-3.5 text-primary" />
                </div>
                Introduction Video
              </h3>
              <div className="rounded-2xl overflow-hidden bg-muted aspect-video">
                <video src={nanny.intro_video_url} controls className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {/* Details & credentials */}
          <div className="bg-card border border-border/50 rounded-3xl p-7 shadow-sm shadow-primary/3">
            <h3 className="font-display font-semibold text-xl mb-6 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-peach/50 flex items-center justify-center">
                <Award className="w-3.5 h-3.5 text-peach-dark" />
              </div>
              Details & Credentials
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
              {nanny.languages?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-3">
                    <Globe className="w-3.5 h-3.5" /> Languages
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {nanny.languages.map(l => <Badge key={l} variant="secondary" className="rounded-xl text-xs px-3 py-1">{l}</Badge>)}
                  </div>
                </div>
              )}
              {nanny.specialties?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-3">
                    <Sparkles className="w-3.5 h-3.5" /> Specialties
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {nanny.specialties.map(s => <Badge key={s} className="rounded-xl text-xs px-3 py-1 bg-sage/20 text-sage-foreground border-0">{s}</Badge>)}
                  </div>
                </div>
              )}
              {nanny.certifications?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-3">
                    <Award className="w-3.5 h-3.5" /> Certifications
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {nanny.certifications.map(c => <Badge key={c} className="rounded-xl text-xs px-3 py-1 bg-peach/50 text-peach-dark border-0">{c}</Badge>)}
                  </div>
                </div>
              )}
              {nanny.education && (
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-3">
                    <BookOpen className="w-3.5 h-3.5" /> Education
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">{nanny.education}</p>
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
                Family Reviews
                <span className="ml-2 text-sm font-body font-normal text-muted-foreground">({reviews.length})</span>
              </h3>
              {reviews.map((r, i) => (
                <ReviewCard key={r.id} review={r} isFirst={i === 0} />
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: Sticky sidebar ── */}
        <div>
          <div className="sticky top-6 space-y-4">

            {/* Booking card */}
            <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-lg shadow-primary/5">
              <div className="text-center mb-6">
                <p className="font-display text-5xl font-bold text-primary leading-none">${nanny.hourly_rate}</p>
                <p className="text-sm text-muted-foreground mt-1.5">per hour</p>
              </div>
              <Separator className="mb-6 opacity-40" />
              {user?.role === 'parent' && (
                <div className="space-y-2.5">
                  <Link to={`/BookNanny?nanny_id=${nanny.id}`} className="block">
                    <Button className="w-full h-12 font-semibold rounded-2xl text-sm shadow-md shadow-primary/25">
                      <Calendar className="w-4 h-4 mr-2" />
                      Book a Session
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full h-12 rounded-2xl text-sm border-border/60" onClick={handleMessage}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Send a Message
                  </Button>
                </div>
              )}
              <div className="mt-6 pt-5 border-t border-border/40">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sage/25 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-sage-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground mb-0.5">CozyCare Guarantee</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Every nanny is background-screened, reference-verified, and reviewed by real families.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            {(nanny.total_bookings > 0 || nanny.avg_rating > 0 || nanny.total_reviews > 0) && (
              <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm shadow-primary/3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">At a Glance</h4>
                <div className="space-y-3.5">
                  {nanny.total_bookings > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Total sessions</span>
                      <span className="text-sm font-semibold text-foreground">{nanny.total_bookings}</span>
                    </div>
                  )}
                  {nanny.avg_rating > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Average rating</span>
                      <span className="text-sm font-semibold text-foreground flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />{nanny.avg_rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                  {nanny.total_reviews > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Family reviews</span>
                      <span className="text-sm font-semibold text-foreground">{nanny.total_reviews}</span>
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