import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { ArrowLeft, Calendar, Clock, DollarSign, Shield, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

const PLATFORM_FEE_RATE = 0.15;

export default function BookNanny() {
  const params = new URLSearchParams(window.location.search);
  const nannyId = params.get('nanny_id');
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: nanny } = useQuery({
    queryKey: ['nannyProfile', nannyId],
    queryFn: async () => {
      const profiles = await base44.entities.NannyProfile.filter({ id: nannyId });
      return profiles[0];
    },
    enabled: !!nannyId,
  });

  const { data: familyProfiles = [] } = useQuery({
    queryKey: ['myFamily', user?.email],
    queryFn: () => base44.entities.FamilyProfile.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });
  const family = familyProfiles[0];

  const [form, setForm] = useState({
    date: '',
    start_time: '',
    end_time: '',
    booking_type: 'one_time',
    notes: '',
    children_names: '',
  });

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const hours = (() => {
    if (!form.start_time || !form.end_time) return 0;
    const [sh, sm] = form.start_time.split(':').map(Number);
    const [eh, em] = form.end_time.split(':').map(Number);
    return Math.max(0, (eh + em / 60) - (sh + sm / 60));
  })();

  const rate = nanny?.hourly_rate || 0;
  const nannyPay = hours * rate;
  const platformFee = nannyPay * PLATFORM_FEE_RATE;
  const totalCost = nannyPay + platformFee;

  const bookMutation = useMutation({
    mutationFn: () => base44.entities.Booking.create({
      parent_email: user.email,
      nanny_email: nanny.user_email,
      nanny_profile_id: nanny.id,
      family_profile_id: family?.id,
      date: form.date,
      start_time: form.start_time,
      end_time: form.end_time,
      hours,
      hourly_rate: rate,
      platform_fee: Math.round(platformFee * 100) / 100,
      total_cost: Math.round(totalCost * 100) / 100,
      nanny_payout: Math.round(nannyPay * 100) / 100,
      status: 'pending',
      booking_type: form.booking_type,
      notes: form.notes,
      children_names: form.children_names,
      parent_name: user.display_name || user.full_name,
      nanny_name: nanny.display_name || nanny.full_name,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      toast.success('Booking request sent!');
      navigate('/MyBookings');
    },
  });

  if (!nanny) {
    return <div className="h-96 flex items-center justify-center"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-xl mx-auto">
      <Button variant="ghost" className="mb-4 text-muted-foreground" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>

      <div className="text-center mb-6">
        <h1 className="font-display text-2xl font-bold">Book {nanny.display_name || nanny.full_name}</h1>
        <p className="text-sm text-muted-foreground mt-1">${rate}/hr · Trusted caregiver</p>
      </div>

      <Card className="p-6 space-y-5">
        <div>
          <Label>Date</Label>
          <Input type="date" value={form.date} onChange={e => update('date', e.target.value)} className="mt-1" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Start Time</Label>
            <Input type="time" value={form.start_time} onChange={e => update('start_time', e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>End Time</Label>
            <Input type="time" value={form.end_time} onChange={e => update('end_time', e.target.value)} className="mt-1" />
          </div>
        </div>
        <div>
          <Label>Booking Type</Label>
          <RadioGroup value={form.booking_type} onValueChange={v => update('booking_type', v)} className="flex gap-4 mt-2">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="one_time" id="one_time" />
              <Label htmlFor="one_time" className="font-normal cursor-pointer">One-time</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="recurring" id="recurring" />
              <Label htmlFor="recurring" className="font-normal cursor-pointer">Recurring</Label>
            </div>
          </RadioGroup>
        </div>
        <div>
          <Label>Children's Names</Label>
          <Input value={form.children_names} onChange={e => update('children_names', e.target.value)} placeholder="e.g., Emma and Jack" className="mt-1" />
        </div>
        <div>
          <Label>Special Instructions</Label>
          <Textarea value={form.notes} onChange={e => update('notes', e.target.value)} placeholder="Any special instructions for the nanny..." rows={3} className="mt-1" />
        </div>

        <Separator />

        {/* Price breakdown */}
        <div className="bg-muted/40 rounded-xl p-4 space-y-2.5">
          <h3 className="font-display font-semibold text-sm flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" /> Price Breakdown
          </h3>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{hours.toFixed(1)} hrs × ${rate}/hr</span>
            <span>${nannyPay.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Platform fee (15%)</span>
            <span>${platformFee.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span className="text-primary">${totalCost.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-primary/5 rounded-lg p-3">
          <Shield className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <span>Your payment is protected. You will only be charged once the nanny confirms the booking.</span>
        </div>

        <Button
          onClick={() => bookMutation.mutate()}
          disabled={!form.date || !form.start_time || !form.end_time || hours <= 0 || bookMutation.isPending}
          className="w-full h-12 font-semibold text-base"
        >
          {bookMutation.isPending ? 'Sending request...' : `Request Booking · $${totalCost.toFixed(2)}`}
        </Button>
      </Card>
    </div>
  );
}