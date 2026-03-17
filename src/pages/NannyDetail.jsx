import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Clock, Award, MessageCircle, Calendar, ArrowLeft,
  Play, Shield, Star, Heart, Globe, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TrustBadgeRow } from '@/components/shared/TrustBadge';
import StarRating from '@/components/shared/StarRating';
import PageHeader from '@/components/shared/PageHeader';

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
    return <div className="h-96 flex items-center justify-center"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;
  }

  if (!nanny) return <div className="text-center py-16 text-muted-foreground">Nanny not found</div>;

  return (
    <div>
      <Button variant="ghost" className="mb-4 text-muted-foreground" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header card */}
          <Card className="p-6 border-border/60">
            <div className="flex gap-5">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-peach/60 shadow-md">
                  {nanny.photo_url ? (
                    <img src={nanny.photo_url} alt={nanny.display_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <span className="text-2xl font-display font-semibold text-primary">
                        {(nanny.display_name || nanny.full_name || '?')[0]}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <h1 className="font-display text-2xl font-bold text-foreground">
                  {nanny.display_name || nanny.full_name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-1.5">
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
                {nanny.avg_rating > 0 && (
                  <div className="mt-2">
                    <StarRating rating={nanny.avg_rating} total={nanny.total_reviews} size="md" />
                  </div>
                )}
                {nanny.badges?.length > 0 && (
                  <div className="mt-3">
                    <TrustBadgeRow badges={nanny.badges} size="md" />
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Bio */}
          {nanny.bio && (
            <Card className="p-6 border-border/60">
              <h3 className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" /> About Me
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{nanny.bio}</p>
            </Card>
          )}

          {/* Video */}
          {nanny.intro_video_url && (
            <Card className="p-6 border-border/60">
              <h3 className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
                <Play className="w-4 h-4 text-primary" /> Introduction Video
              </h3>
              <div className="rounded-xl overflow-hidden bg-muted aspect-video">
                <video src={nanny.intro_video_url} controls className="w-full h-full object-cover" />
              </div>
            </Card>
          )}

          {/* Details */}
          <Card className="p-6 border-border/60">
            <h3 className="font-display font-semibold text-lg mb-4">Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {nanny.languages?.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-1 mb-1">
                    <Globe className="w-3 h-3" /> Languages
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {nanny.languages.map(l => (
                      <Badge key={l} variant="secondary" className="text-xs">{l}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {nanny.specialties?.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-1 mb-1">
                    <Star className="w-3 h-3" /> Specialties
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {nanny.specialties.map(s => (
                      <Badge key={s} variant="secondary" className="text-xs bg-sage/30 text-sage-foreground">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {nanny.certifications?.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-1 mb-1">
                    <Award className="w-3 h-3" /> Certifications
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {nanny.certifications.map(c => (
                      <Badge key={c} variant="secondary" className="text-xs bg-peach/50 text-peach-dark">{c}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {nanny.education && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-1 mb-1">
                    <BookOpen className="w-3 h-3" /> Education
                  </p>
                  <p className="text-sm">{nanny.education}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Reviews */}
          {reviews.length > 0 && (
            <Card className="p-6 border-border/60">
              <h3 className="font-display font-semibold text-lg mb-4">Reviews</h3>
              <div className="space-y-4">
                {reviews.map(r => (
                  <div key={r.id} className="pb-4 border-b border-border/40 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-semibold">{r.parent_name || 'Parent'}</p>
                      <StarRating rating={r.rating} />
                    </div>
                    {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="p-6 border-border/60 sticky top-6">
            <div className="text-center mb-5">
              <p className="font-display text-3xl font-bold text-primary">${nanny.hourly_rate}</p>
              <p className="text-sm text-muted-foreground">per hour</p>
            </div>
            <Separator className="mb-5" />
            {user?.role === 'parent' && (
              <div className="space-y-3">
                <Link to={`/BookNanny?nanny_id=${nanny.id}`} className="block">
                  <Button className="w-full h-11 font-semibold">
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Now
                  </Button>
                </Link>
                <Button variant="outline" className="w-full h-11" onClick={handleMessage}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            )}

            {/* Trust section */}
            <div className="mt-6 pt-5 border-t border-border/60">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold">Trust & Safety</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All CozyCare nannies undergo identity verification, background checks, and reference screening. 
                Your family's safety is our top priority.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}