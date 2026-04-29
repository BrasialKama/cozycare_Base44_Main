import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { ArrowLeft, Star, Heart, Shield, MessageCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import StarRating from '@/components/shared/StarRating';
import { toast } from 'sonner';

export default function LeaveReview() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('booking_id');
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: booking, isLoading: bookingLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => base44.entities.Booking.get(bookingId),
    enabled: !!bookingId,
  });

  // Ownership & status guard
  const isOwner = booking && user && booking.family_user_email === user.email;
  const isCompleted = booking && booking.status === 'Završeno';

  const [rating, setRating] = useState(0);
  const [warmth, setWarmth] = useState(0);
  const [reliability, setReliability] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [comment, setComment] = useState('');

  const submitMutation = useMutation({
    mutationFn: async () => {
      console.log('[LeaveReview] invoking createReview');
      let res;
      try {
        res = await base44.functions.invoke('createReview', {
          review: {
            booking_id: bookingId,
            parent_name: user.display_name || user.full_name,
            rating,
            warmth_rating: warmth,
            reliability_rating: reliability,
            communication_rating: communication,
            comment,
          },
        });
      } catch (invokeErr) {
        console.error('[LeaveReview] invoke threw:', invokeErr);
        const status = invokeErr?.response?.status || invokeErr?.status;
        if (status === 401 || invokeErr?.message?.includes('401') || invokeErr?.message?.includes('Authentication')) {
          throw new Error('Vaša sesija je istekla. Molimo osvježite stranicu i prijavite se ponovno.');
        }
        const serverErr = invokeErr?.response?.data?.error || invokeErr?.data?.error;
        throw new Error(serverErr || invokeErr?.message || 'Veza s poslužiteljem nije uspjela.');
      }
      console.log('[LeaveReview] response:', res);
      const data = res?.data || res;
      if (!data?.success) {
        throw new Error(data?.error || 'Recenzija nije poslana.');
      }
    },
    onSuccess: () => {
      toast.success('Hvala na vašoj recenziji!');
      navigate('/MyBookings');
    },
    onError: (err) => {
      console.error('[LeaveReview] mutation onError:', err);
      toast.error(err?.message || 'Recenzija nije poslana. Pokušajte ponovno.');
    },
  });

  if (!bookingId) {
    return (
      <div className="max-w-lg mx-auto pt-16 text-center">
        <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-4" />
        <h2 className="font-display text-xl font-bold mb-2">Rezervacija nije odabrana</h2>
        <p className="text-muted-foreground mb-6">Nije moguće ostaviti recenziju bez povezane rezervacije.</p>
        <Button onClick={() => navigate('/MyBookings')} className="rounded-2xl px-8">Moje rezervacije</Button>
      </div>
    );
  }

  if (bookingLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!booking || !isOwner) {
    return (
      <div className="max-w-lg mx-auto pt-16 text-center">
        <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-4" />
        <h2 className="font-display text-xl font-bold mb-2">Pristup odbijen</h2>
        <p className="text-muted-foreground mb-6">Ovu rezervaciju ne možete recenzirati.</p>
        <Button onClick={() => navigate('/MyBookings')} className="rounded-2xl px-8">Moje rezervacije</Button>
      </div>
    );
  }

  if (!isCompleted) {
    return (
      <div className="max-w-lg mx-auto pt-16 text-center">
        <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display text-xl font-bold mb-2">Recenzija nije moguća</h2>
        <p className="text-muted-foreground mb-6">Recenzije su moguće samo za završene rezervacije.</p>
        <Button onClick={() => navigate('/MyBookings')} className="rounded-2xl px-8">Moje rezervacije</Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <Button variant="ghost" className="mb-4 text-muted-foreground" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Natrag
      </Button>

      <div className="text-center mb-6">
        <h1 className="font-display text-2xl font-bold">Ostavi recenziju</h1>
        {booking && <p className="text-sm text-muted-foreground mt-1">za {booking.nanny_name}</p>}
      </div>

      <Card className="p-6 space-y-6">
        <div>
          <Label className="mb-2 block">Ukupna ocjena</Label>
          <StarRating rating={rating} size="lg" interactive onChange={setRating} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label className="text-xs mb-1 block flex items-center gap-1">
              <Heart className="w-3 h-3" /> Toplina
            </Label>
            <StarRating rating={warmth} interactive onChange={setWarmth} />
          </div>
          <div>
            <Label className="text-xs mb-1 block flex items-center gap-1">
              <Shield className="w-3 h-3" /> Pouzdanost
            </Label>
            <StarRating rating={reliability} interactive onChange={setReliability} />
          </div>
          <div>
            <Label className="text-xs mb-1 block flex items-center gap-1">
              <MessageCircle className="w-3 h-3" /> Komunikacija
            </Label>
            <StarRating rating={communication} interactive onChange={setCommunication} />
          </div>
        </div>

        <div>
          <Label>Vaša recenzija</Label>
          <Textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={4}
            className="mt-1"
            placeholder="Podijelite svoje iskustvo s ovom dadiljom..."
          />
        </div>

        <Button
          onClick={() => submitMutation.mutate()}
          disabled={rating === 0 || submitMutation.isPending}
          className="w-full h-11 font-semibold"
        >
          {submitMutation.isPending ? 'Šaljem...' : 'Pošalji recenziju'}
        </Button>
      </Card>
    </div>
  );
}