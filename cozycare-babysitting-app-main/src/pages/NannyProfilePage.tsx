import { useParams, Link, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { blink } from '../blink/client';
import { getDemoNannyById } from '../features/nannies/demoNannies';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  ShieldCheck, 
  Video, 
  BadgeCheck, 
  Star, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2,
  ChevronLeft,
  PlayCircle
} from 'lucide-react';

export function NannyProfilePage() {
  const { nannyId } = useParams({ from: '/nannies/$nannyId' });
  const navigate = useNavigate();
  const [nanny, setNanny] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fallbackNanny = getDemoNannyById(nannyId)

    const fetchNanny = async () => {
      if (fallbackNanny) {
        setNanny({
          ...fallbackNanny,
          service_area: fallbackNanny.serviceArea,
          video_url: fallbackNanny.videoUrl,
        })
      }

      try {
        const result = await blink.db.nannies.get(nannyId);
        if (result) {
          setNanny(result);
        }
      } catch {
        // Keep curated profile browsing available for anonymous users.
      } finally {
        setLoading(false);
      }
    };

    fetchNanny();
  }, [nannyId]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  if (!nanny) return <div className="min-h-screen bg-background flex items-center justify-center text-center">
    <div>
      <h2 className="text-2xl font-serif font-bold">Nanny not found</h2>
      <Link to="/nannies" className="text-primary mt-4 inline-block">Back to nannies</Link>
    </div>
  </div>;

  return (
    <div className="bg-background min-h-screen pb-24">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-8">
          <Link to="/nannies" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Discovery
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header Profile */}
            <div className="boutique-card p-8">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="framed-image h-48 w-48 shrink-0 mx-auto md:mx-0">
                  <img src={nanny.photoUrl} alt={nanny.displayName} className="h-full w-full object-cover" />
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">{nanny.displayName}</h1>
                      <div className="flex items-center text-muted-foreground text-sm font-medium">
                        <MapPin className="h-4 w-4 mr-1 text-primary" />
                        {nanny.service_area}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-2xl font-serif font-bold text-primary">${nanny.hourlyRate}<span className="text-sm font-sans font-normal text-muted-foreground">/hr</span></div>
                      <div className="flex items-center text-sm text-primary font-bold">
                        <Star className="h-4 w-4 fill-current mr-1" />
                        {nanny.rating} ({nanny.reviewCount} Reviews)
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mb-6">
                    {nanny.isVerified && (
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 rounded-full px-4 py-1">
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        ID Verified
                      </Badge>
                    )}
                    {nanny.isBackgroundChecked && (
                      <Badge variant="outline" className="bg-secondary/5 text-secondary border-secondary/20 rounded-full px-4 py-1">
                        <BadgeCheck className="h-4 w-4 mr-2" />
                        Background Checked
                      </Badge>
                    )}
                    {nanny.isReferenceChecked && (
                      <Badge variant="outline" className="bg-accent/5 text-accent border-accent/20 rounded-full px-4 py-1">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        References Verified
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6 border-t border-border/50">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-primary/60" />
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Experience</div>
                        <div className="text-sm font-medium">{nanny.yearsOfExperience}+ Years</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-primary/60" />
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Availability</div>
                        <div className="text-sm font-medium">Full-time</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="boutique-card p-8">
              <h2 className="text-2xl font-serif font-bold mb-6">About Me</h2>
              <p className="text-muted-foreground leading-relaxed italic text-lg">
                "{nanny.bio}"
              </p>
            </div>

            {/* Video & Verification */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="boutique-card p-8 bg-primary/5 border-primary/20">
                <h3 className="font-serif text-xl font-bold mb-6 flex items-center">
                  <Video className="h-5 w-5 mr-2 text-primary" />
                  Intro Video
                </h3>
                <div className="aspect-video relative rounded-xl overflow-hidden bg-muted group cursor-pointer shadow-md">
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <PlayCircle className="h-16 w-16 text-white/80 transition-transform group-hover:scale-110" />
                  </div>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                  <img src={nanny.photoUrl} className="h-full w-full object-cover blur-[2px]" />
                </div>
                <p className="mt-4 text-xs text-muted-foreground italic text-center">
                  Video verification confirmed identity on Mar 10, 2026.
                </p>
              </div>

              <div className="boutique-card p-8 border-accent/20">
                <h3 className="font-serif text-xl font-bold mb-6">Expertise</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-2">Certifications</div>
                    <div className="flex flex-wrap gap-2">
                      {nanny.certifications?.map((cert: string, i: number) => (
                        <div key={i} className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full font-medium border border-accent/10">
                          {cert}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-2">Languages</div>
                    <div className="flex flex-wrap gap-2">
                      {nanny.languages?.map((lang: string, i: number) => (
                        <div key={i} className="text-xs bg-secondary/10 text-secondary px-3 py-1 rounded-full font-medium border border-secondary/10">
                          {lang}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="boutique-card p-8 bg-card shadow-lg border-primary/10">
                <h3 className="font-serif text-2xl font-bold mb-6">Book {nanny.displayName.split(' ')[0]}</h3>
                
                <div className="space-y-6 mb-8">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Hourly Rate</span>
                    <span className="font-bold font-serif text-xl">${nanny.hourlyRate}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground">CozyCare Service Fee</span>
                    <span className="font-bold text-sm">$3.50/hr</span>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-xl flex justify-between items-center">
                    <span className="font-bold">Estimated Total</span>
                    <span className="font-bold font-serif text-2xl text-primary">${nanny.hourlyRate + 3.50}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button onClick={() => navigate({ to: '/booking/$nannyId', params: { nannyId } })} className="w-full h-14 text-lg font-bold bg-primary text-primary-foreground shadow-elegant hover:bg-primary/90 rounded-full transition-all hover:scale-[1.02] active:scale-[0.98]">
                    Request to Book
                  </Button>
                  <Button onClick={() => navigate({ to: '/auth/choose' })} variant="outline" className="w-full h-14 text-lg font-bold border-accent text-accent hover:bg-accent/5 rounded-full">
                    Message {nanny.displayName.split(' ')[0]}
                  </Button>
                </div>
                
                <p className="mt-6 text-center text-xs text-muted-foreground leading-relaxed">
                  No payment is taken now. We'll confirm details with {nanny.displayName.split(' ')[0]} before anything is finalised.
                </p>
              </div>

              <div className="boutique-card p-6 border-secondary/20">
                <h4 className="font-serif font-bold text-secondary mb-4 flex items-center">
                  <ShieldCheck className="h-5 w-5 mr-2" />
                  Our Trust Guarantee
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  All bookings are backed by our full liability cover and 24/7 CozyCare support. You're in safe hands.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}