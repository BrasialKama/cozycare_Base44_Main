import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Clock, Award, MessageCircle, Calendar, ArrowLeft,
  Play, Shield, Star, Heart, Globe, BookOpen, CheckCircle2, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import StarRating from '@/components/shared/StarRating';

const BADGE_META = {
  id_verified: { label: 'ID Verified', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
  background_check: { label: 'Background Check', icon: Shield, color: 'text-blue-600 bg-blue-50' },
  reference_checked: { label: 'References Checked', icon: CheckCircle2, color: 'text-violet-600 bg-violet-50' },
  video_verified: { label: 'Video Intro', icon: Play, color: 'text-orange-600 bg-orange-50' },
  certifications_verified: { label: 'Certified', icon: Award, color: 'text-primary bg-rose-light' },
};

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

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!nanny) return <div className="text-center py-16 text-muted-foreground">Caregiver not found.</div>;

  return (
    <div className="pb-12">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to results
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">

        {/* ── LEFT / MAIN ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Hero card */}
          <div className="rounded-3xl overflow-hidden border border-border/50 shadow-sm bg-card">
            {/* Banner */}
            <div className="relative h-44 bg-gradient-to-br from-rose-light via-peach/70 to-ivory overflow-hidden">
              {nanny.photo_url && (
                <img
                  src={nanny.photo_url}
                  alt={nanny.display_name}
                  className="w-full h-full object-cover object-top opacity-50"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
            </div>

            <div className="px-6 pb-6">
              {/* Avatar row */}
              <div className="flex items-end gap-4 -mt-10 mb-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-[3px] border-card shadow-lg flex-shrink-0">
                  {nanny.photo_url ? (
                    <img src={nanny.photo_url} alt={nanny.display_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <span className="text-3xl font-display font-bold text-primary">
                        {(nanny.display_name || nanny.full_name || '?')[0]}
                      </span>
                    </div>
                  )}
                </div>
                <div className="pb-1">
                  {nanny.avg_rating > 0 && (
                    <StarRating rating={nanny.avg_rating} total={nanny.total_reviews} size="md" />
                  )}
                </div>
              </div>

              <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground leading-tight">
                {nanny.display_name || nanny.full_name}
              </h1>
              <div className="flex flex-wrap gap-3 mt-2">
                {nanny.service_area && (
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {nanny.service_area}
                  </span>
                )}
                {nanny.years_experience > 0 && (
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {nanny.years_experience} years experience
                  </span>
                )}
              </div>

              {/* Trust badges */}
              {nanny.badges?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {nanny.badges.map(b => {
                    const meta = BADGE_META[b];
                    if (!meta) return null;
                    const Icon = meta.icon;
                    return (
                      <span key={b} className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${meta.color}`}>
                        <Icon className="w-3.5 h-3.5" />
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
            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <h3 className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" fill="currentColor" /> About Me
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{nanny.bio}</p>
            </div>
          )}

          {/* Intro video */}
          {nanny.intro_video_url && (
            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <h3 className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
                <Play className="w-4 h-4 text-primary" /> Introduction Video
              </h3>
              <div className="rounded-xl overflow-hidden bg-muted aspect-video">
                <video src={nanny.intro_video_url} controls className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {/* Details grid */}
          <div className="bg-card border border-border/50 rounded-2xl p-6">
            <h3 className="font-display font-semibold text-lg mb-5">Details & Credentials</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {nanny.languages?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-2">
                    <Globe className="w-3.5 h-3.5" /> Languages
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {nanny.languages.map(l => (
                      <Badge key={l} variant="secondary" className="rounded-lg text-xs">{l}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {nanny.specialties?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3.5 h-3.5" /> Specialties
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {nanny.specialties.map(s => (
                      <Badge key={s} variant="secondary" className="rounded-lg text-xs bg-sage/25 text-sage-foreground border-0">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {nanny.certifications?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-2">
                    <Award className="w-3.5 h-3.5" /> Certifications
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {nanny.certifications.map(c => (
                      <Badge key={c} variant="secondary" className="rounded-lg text-xs bg-peach/50 text-peach-dark border-0">{c}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {nanny.education && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-2">
                    <BookOpen className="w-3.5 h-3.5" /> Education
                  </p>
                  <p className="text-sm text-foreground">{nanny.education}</p>
                </div>
              )}
            </div>
          </div>

          {/* Reviews */}
          {reviews.length > 0 && (
            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <h3 className="font-display font-semibold text-lg mb-5">
                Family Reviews
                <span className="ml-2 text-sm font-body font-normal text-muted-foreground">({reviews.length})</span>
              </h3>
              <div className="space-y-5">
                {reviews.map((r, i) => (
                  <div key={r.id}>
                    {i > 0 && <Separator className="mb-5 opacity-50" />}
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-primary">
                          {(r.parent_name || 'P')[0]}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <p className="text-sm font-semibold text-foreground">{r.parent_name || 'Parent'}</p>
                          <StarRating rating={r.rating} />
                        </div>
                        {r.comment && (
                          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">"{r.comment}"</p>
                        )}
                        {(r.warmth_rating || r.reliability_rating || r.communication_rating) && (
                          <div className="flex flex-wrap gap-3 mt-2.5">
                            {r.warmth_rating && (
                              <span className="text-[11px] text-muted-foreground">
                                Warmth <span className="font-semibold text-foreground">{r.warmth_rating}/5</span>
                              </span>
                            )}
                            {r.reliability_rating && (
                              <span className="text-[11px] text-muted-foreground">
                                Reliability <span className="font-semibold text-foreground">{r.reliability_rating}/5</span>
                              </span>
                            )}
                            {r.communication_rating && (
                              <span className="text-[11px] text-muted-foreground">
                                Communication <span className="font-semibold text-foreground">{r.communication_rating}/5</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT / SIDEBAR ── */}
        <div>
          <div className="sticky top-6 space-y-4">
            {/* Booking card */}
            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
              <div className="text-center mb-5">
                <p className="font-display text-4xl font-bold text-primary">${nanny.hourly_rate}</p>
                <p className="text-sm text-muted-foreground mt-0.5">per hour</p>
              </div>
              <Separator className="mb-5 opacity-50" />

              {user?.role === 'parent' && (
                <div className="space-y-2.5">
                  <Link to={`/BookNanny?nanny_id=${nanny.id}`} className="block">
                    <Button className="w-full h-12 font-semibold rounded-xl text-sm shadow-md shadow-primary/20">
                      <Calendar className="w-4 h-4 mr-2" />
                      Book a Session
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full h-12 rounded-xl text-sm"
                    onClick={handleMessage}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Send a Message
                  </Button>
                </div>
              )}

              {/* Trust guarantee */}
              <div className="mt-5 pt-5 border-t border-border/50">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-0.5">CozyCare Guarantee</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Every nanny is background-screened, reference-verified, and reviewed by real families. Your family's safety comes first.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            {(nanny.total_bookings > 0 || nanny.total_reviews > 0) && (
              <div className="bg-card border border-border/50 rounded-2xl p-5">
                <h4 className="text-sm font-semibold text-foreground mb-4">At a Glance</h4>
                <div className="space-y-3">
                  {nanny.total_bookings > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Total sessions</span>
                      <span className="text-sm font-semibold text-foreground">{nanny.total_bookings}</span>
                    </div>
                  )}
                  {nanny.avg_rating > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Average rating</span>
                      <span className="text-sm font-semibold text-foreground">{nanny.avg_rating} ⭐</span>
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