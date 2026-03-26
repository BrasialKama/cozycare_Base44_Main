import { Link } from '@tanstack/react-router';
import { Badge } from '../../../components/ui/badge';
import { ShieldCheck, Video, BadgeCheck, Star } from 'lucide-react';

interface NannyCardProps {
  nanny: {
    id: string;
    displayName: string;
    photoUrl: string;
    hourlyRate: number;
    yearsOfExperience: number;
    bio: string;
    rating: number;
    isVerified: boolean;
    isBackgroundChecked: boolean;
    isVideoVerified: boolean;
  };
}

export function NannyCard({ nanny }: NannyCardProps) {
  return (
    <div className="boutique-card group">
      <div className="p-6">
        <div className="flex items-start space-x-5">
          {/* Framed Image */}
          <div className="framed-image h-24 w-24 shrink-0">
            <img 
              src={nanny.photoUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200"} 
              alt={nanny.displayName}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-serif text-xl font-bold text-foreground truncate">{nanny.displayName}</h3>
              <div className="flex items-center text-primary">
                <Star className="h-4 w-4 fill-current" />
                <span className="ml-1 text-sm font-bold">{nanny.rating.toFixed(1)}</span>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground font-medium mb-3">
              {nanny.yearsOfExperience}+ Years Experience • ${nanny.hourlyRate}/hr
            </p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {nanny.isVerified && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] h-5 px-2 font-medium">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  ID Verified
                </Badge>
              )}
              {nanny.isBackgroundChecked && (
                <Badge variant="secondary" className="bg-secondary/10 text-secondary border-none text-[10px] h-5 px-2 font-medium">
                  <BadgeCheck className="h-3 w-3 mr-1" />
                  SafeCheck
                </Badge>
              )}
              {nanny.isVideoVerified && (
                <Badge variant="secondary" className="bg-accent/10 text-accent border-none text-[10px] h-5 px-2 font-medium">
                  <Video className="h-3 w-3 mr-1" />
                  Video Intro
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <p className="mt-4 text-sm text-muted-foreground line-clamp-3 leading-relaxed italic">
          "{nanny.bio}"
        </p>
        
        <div className="mt-6 pt-6 border-t flex items-center justify-between">
          <Link 
            to="/nannies/$nannyId" 
            params={{ nannyId: nanny.id }}
            className="text-primary font-bold text-sm hover:underline underline-offset-4 transition-colors"
          >
            View Full Portfolio
          </Link>
          <Link 
            to="/booking/$nannyId" 
            params={{ nannyId: nanny.id }}
            className="bg-primary text-primary-foreground text-xs font-bold h-9 px-5 rounded-full flex items-center shadow-sm hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
          >
            Request Booking
          </Link>
        </div>
      </div>
    </div>
  );
}
