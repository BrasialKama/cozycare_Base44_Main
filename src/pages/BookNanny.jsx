import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { ArrowLeft, Calendar, Clock, Shield, Heart, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  const canBook = form.date && form.start_time && form.end_time && hours > 0;

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
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const initial = (nanny.display_name || nanny.full_name || '?')[0];

  return (
    <div className="max-w-lg mx-auto pb-12">

      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-7 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back
      </button>

      {/* Nanny preview strip */}
      <div className="flex items-center gap-4 bg-card border border-border/40 rounded-2xl p-4 mb-7 shadow-sm">
        <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0">
          {nanny.photo_url ? (
            <img src={nanny.photo_url} alt={nanny.display_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-rose-light to-peach flex items-center justify-center">
              <span className="text-xl font-display font-bold text-primary">{initial}</span>
            </div>
          )}
        </div>
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-primary/60 mb-0.5">
            <Sparkles className="w-3 h-3 inline mr-1" />Booking
          </p>
          <h1 className="font-display text-xl font-bold text-foreground">{nanny.display_name || nanny.full_name}</h1>
          <p className="text-sm text-muted-foreground">€{rate}/hr · Trusted caregiver</p>
        </div>
      </div>

      {/* Form card */}
      <div className="bg-card border border-border/40 rounded-3xl p-7 shadow-sm space-y-6">

        {/* Date & time */}
        <div>
          <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <Calendar className="w-4.5 h-4.5 text-primary" /> When do you need care?
          </h2>
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Date</Label>
              <Input type="date" value={form.date} onChange={e => update('date', e.target.value)} className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Start</Label>
                <Input type="time" value={form.start_time} onChange={e => update('start_time', e.target.value)} className="rounded-xl" />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">End</Label>
                <Input type="time" value={form.end_time} onChange={e => update('end_time', e.target.value)} className="rounded-xl" />
              </div>
            </div>
            {hours > 0 && (
              <div className="inline-flex items-center gap-2 bg-sage/15 text-sage-foreground text-sm px-3.5 py-2 rounded-xl font-medium">
                <Clock className="w-3.5 h-3.5" /> {hours.toFixed(1)} hours
              </div>
            )}
          </div>
        </div>

        <Separator className="opacity-40" />

        {/* Booking type */}
        <div>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 block">Booking Type</Label>
          <RadioGroup value={form.booking_type} onValueChange={v => update('booking_type', v)} className="flex gap-3">
            {[
              { value: 'one_time', label: 'One-time', sub: 'A single session' },
              { value: 'recurring', label: 'Recurring', sub: 'Weekly schedule' },
            ].map(opt => (
              <label key={opt.value} className={`flex-1 flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                form.booking_type === opt.value ? 'border-primary/40 bg-primary/5' : 'border-border/50 hover:border-primary/20'
              }`}>
                <RadioGroupItem value={opt.value} id={opt.value} className="mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.sub}</p>
                </div>
              </label>
            ))}
          </RadioGroup>
        </div>

        <Separator className="opacity-40" />

        {/* Kids & notes */}
        <div className="space-y-4">
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Children's Names</Label>
            <Input value={form.children_names} onChange={e => update('children_names', e.target.value)} placeholder="e.g., Emma and Jack" className="rounded-xl" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Special Instructions</Label>
            <Textarea value={form.notes} onChange={e => update('notes', e.target.value)} placeholder="Allergies, nap schedules, house rules…" rows={3} className="rounded-xl resize-none" />
          </div>
        </div>

        <Separator className="opacity-40" />

        {/* Price breakdown */}
        <div className="bg-gradient-to-br from-ivory to-rose-light/30 rounded-2xl p-5 space-y-3">
          <h3 className="font-display font-semibold text-base">Price Breakdown</h3>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{hours > 0 ? `${hours.toFixed(1)} hrs` : '0 hrs'} × €{rate}/hr</span>
            <span className="font-medium">€{nannyPay.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Platform fee (15%)</span>
            <span className="font-medium">€{platformFee.toFixed(2)}</span>
          </div>
          <Separator className="opacity-40" />
          <div className="flex justify-between font-semibold text-base">
            <span>Total</span>
            <span className="text-primary font-display text-xl">€{totalCost.toFixed(2)}</span>
          </div>
        </div>

        {/* Guarantee note */}
        <div className="flex items-start gap-3 bg-emerald-50 rounded-2xl p-4">
          <Shield className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-800 leading-relaxed">
            Your payment is protected. You'll only be charged once the nanny confirms the booking.
          </p>
        </div>

        <Button
          onClick={() => bookMutation.mutate()}
          disabled={!canBook || bookMutation.isPending}
          className="w-full h-13 text-base font-semibold rounded-2xl shadow-lg shadow-primary/20"
          style={{ height: '3.25rem' }}
        >
          {bookMutation.isPending ? (
            <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Sending request…</span>
          ) : canBook ? (
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Request Booking · €{totalCost.toFixed(2)}</span>
          ) : (
            'Select a date & time to continue'
          )}
        </Button>
      </div>
    </div>
  );
}