import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { ArrowLeft, Star, Heart, Shield, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import StarRating from '@/components/shared/StarRating';
import { toast } from 'sonner';

export default function LeaveReview() {
  const params = new URLSearchParams(window.location.search);
  const bookingId = params.get('booking_id');
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: booking } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      const bookings = await base44.entities.Booking.filter({ id: bookingId });
      return bookings[0];
    },
    enabled: !!bookingId,
  });

  const [rating, setRating] = useState(0);
  const [warmth, setWarmth] = useState(0);
  const [reliability, setReliability] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [comment, setComment] = useState('');

  const submitMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Review.create({
        booking_id: bookingId,
        nanny_profile_id: booking.nanny_profile_id,
        parent_email: user.email,
        parent_name: user.display_name || user.full_name,
        nanny_email: booking.nanny_email,
        rating,
        warmth_rating: warmth,
        reliability_rating: reliability,
        communication_rating: communication,
        comment,
      });
    },
    onSuccess: () => {
      toast.success('Hvala na vašoj recenziji!');
      navigate('/MyBookings');
    },
  });

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