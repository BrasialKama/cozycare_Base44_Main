import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { ArrowLeft, Calendar, Clock, Shield, CheckCircle2, Sparkles, MapPin, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function BookNanny() {
  const params = new URLSearchParams(window.location.search);
  const nannyId = params.get('nanny_id');
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [submitted, setSubmitted] = useState(false);

  const { data: nanny, isLoading, isError } = useQuery({
    queryKey: ['nannyProfile', nannyId],
    queryFn: async () => {
      console.log('BookNanny: fetching nanny with id =', nannyId);
      const all = await base44.entities.NannyProfile.list();
      const found = all.find(p => String(p.id) === String(nannyId));
      console.log('BookNanny: found nanny =', found ? `${found.first_name} ${found.last_name}` : 'NOT FOUND');
      return found || null;
    },
    enabled: !!nannyId,
  });

  const [form, setForm] = useState({
    date: '',
    start_time: '',
    end_time: '',
    address: '',
    notes: '',
    children_count: 1,
    special_notes: '',
  });

  const update = (key, val) => {
    console.log(`Field update: ${key} =`, JSON.stringify(val));
    setForm(prev => ({ ...prev, [key]: val }));
  };

  // Calculate duration and price whenever times change
  const calculateDuration = (start, end) => {
    if (!start || !end) return 0;
    try {
      const normalize = (t) => {
        const s = String(t).replace(/\s/g, '');
        const m12 = s.match(/^(\d{1,2}):(\d{2})(AM|PM)$/i);
        if (m12) {
          let h = parseInt(m12[1]);
          const min = parseInt(m12[2]);
          if (/pm/i.test(m12[3]) && h !== 12) h += 12;
          if (/am/i.test(m12[3]) && h === 12) h = 0;
          return h * 60 + min;
        }
        const m24 = s.match(/^(\d{1,2}):(\d{2})$/);
        if (m24) return parseInt(m24[1]) * 60 + parseInt(m24[2]);
        return null;
      };
      const startMins = normalize(start);
      const endMins = normalize(end);
      if (startMins === null || endMins === null) return 0;
      const diff = endMins - startMins;
      return diff > 0 ? +(diff / 60).toFixed(2) : 0;
    } catch (e) {
      return 0;
    }
  };

  const durationHours = calculateDuration(form.start_time, form.end_time);
  const rate = nanny?.hourly_rate || 0;
  const totalPrice = +(durationHours * rate).toFixed(2);
  const timeError = form.start_time && form.end_time && durationHours <= 0 ? 'Vrijeme završetka mora biti nakon vremena početka' : null;
  const canBook = form.date && form.start_time && form.end_time && form.address.trim() && durationHours > 0;

  const nannyName = nanny ? `${nanny.first_name} ${nanny.last_name}` : '';

  const bookMutation = useMutation({
    mutationFn: async () => {
      const bookingData = {
        nanny_id: nanny.id,
        nanny_name: nannyName,
        family_name: user.full_name || '',
        date: form.date,
        start_time: form.start_time,
        end_time: form.end_time,
        duration_hours: durationHours,
        total_price: totalPrice,
        status: 'Na čekanju',
        address: form.address,
        message: form.notes,
        children_count: Number(form.children_count) || 1,
        special_notes: form.special_notes,
      };

      await base44.entities.Booking.create(bookingData);

      // 1. Email notification (fire-and-forget)
      fetch('https://eutow-7c2f3dd9.base44.app/functions/bookingNotification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking: bookingData }),
      }).catch(() => {});

      // 2. In-app confirmation message to parent
      const botMessage = `✅ Vaša rezervacija s dadiljom ${nanny.first_name} ${nanny.last_name} za ${bookingData.date} od ${bookingData.start_time} do ${bookingData.end_time} je zaprimljena. Ukupno: €${bookingData.total_price}. Dadilja će potvrditi u najkraćem roku.`;
      const conv = await base44.entities.Conversation.create({
        participant_emails: ['bot@cozycare.hr', user.email],
        participant_names: ['CozyCare Bot', user.full_name || 'Roditelj'],
        last_message: `Rezervacija s dadiljom ${nanny.first_name} zaprimljena.`,
        last_message_date: new Date().toISOString(),
        unread_count: 1,
      });
      await base44.entities.Message.create({
        conversation_id: String(conv.id),
        sender_email: 'bot@cozycare.hr',
        sender_name: 'CozyCare Bot',
        receiver_email: user.email,
        content: botMessage,
        read: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parentBookings'] });
      setSubmitted(true);
    },
  });

  if (!nannyId) {
    return (
      <div className="max-w-lg mx-auto pt-16 text-center">
        <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-4" />
        <h2 className="font-display text-xl font-bold mb-2">Dadilja nije odabrana</h2>
        <p className="text-muted-foreground mb-6">Niste odabrali dadilju za rezervaciju.</p>
        <Link to="/FindNannies">
          <Button className="rounded-2xl px-8">Pronađi dadilje</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!nanny) {
    return (
      <div className="max-w-lg mx-auto pt-16 text-center">
        <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-4" />
        <h2 className="font-display text-xl font-bold mb-2">Dadilja nije pronađena</h2>
        <p className="text-muted-foreground mb-6">Profil dadilje nije dostupan. Pokušajte ponovo.</p>
        <Link to="/FindNannies">
          <Button className="rounded-2xl px-8">Pronađi dadilje</Button>
        </Link>
      </div>
    );
  }

  const initial = (nanny.first_name || '?')[0];

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto pt-12 pb-12 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">Rezervacija poslana!</h1>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
          {nannyName} će potvrditi vaš termin uskoro. Pratite status u vašim rezervacijama.
        </p>
        <Link to="/MyBookings">
          <Button className="rounded-2xl px-8 h-12 text-base font-semibold shadow-lg shadow-primary/20">
            Idi na Rezervacije
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto pb-12">

      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-7 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Natrag
      </button>

      {/* Nanny preview strip */}
      <div className="flex items-center gap-4 bg-card border border-border/40 rounded-2xl p-4 mb-7 shadow-sm">
        <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0">
          {nanny.photo_url ? (
            <img src={nanny.photo_url} alt={nannyName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-rose-light to-peach flex items-center justify-center">
              <span className="text-xl font-display font-bold text-primary">{initial}</span>
            </div>
          )}
        </div>
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-primary/60 mb-0.5">
            <Sparkles className="w-3 h-3 inline mr-1" />Rezervacija
          </p>
          <h1 className="font-display text-xl font-bold text-foreground">{nannyName}</h1>
          <p className="text-sm text-muted-foreground">€{rate}/sat</p>
        </div>
      </div>

      {/* Form card */}
      <div className="bg-card border border-border/40 rounded-3xl p-7 shadow-sm space-y-6">

        {/* Date & time */}
        <div>
          <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <Calendar className="w-4.5 h-4.5 text-primary" /> Kada vam treba skrb?
          </h2>
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Datum</Label>
              <input
                type="date"
                value={form.date}
                onChange={e => update('date', e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Početak</Label>
                <input
                  type="time"
                  value={form.start_time}
                  onChange={e => update('start_time', e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Završetak</Label>
                <input
                  type="time"
                  value={form.end_time}
                  onChange={e => update('end_time', e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {timeError && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/8 px-3.5 py-2 rounded-xl">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {timeError}
              </div>
            )}

            {durationHours > 0 && !timeError && (
              <div className="inline-flex items-center gap-2 bg-sage/15 text-sage-foreground text-sm px-3.5 py-2 rounded-xl font-medium">
                <Clock className="w-3.5 h-3.5" /> {durationHours % 1 === 0 ? durationHours : durationHours.toFixed(1)} sati × €{rate}/sat = <span className="font-bold">€{totalPrice.toFixed(2)} ukupno</span>
              </div>
            )}
          </div>
        </div>

        <Separator className="opacity-40" />

        {/* Address */}
        <div>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
            <MapPin className="w-3 h-3 inline mr-1" />Adresa
          </Label>
          <Input value={form.address} onChange={e => update('address', e.target.value)} placeholder="npr. Ilica 42, Zagreb" className="rounded-xl" />
        </div>

        <Separator className="opacity-40" />

        {/* Kids & notes */}
        <div className="space-y-4">
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Broj djece</Label>
            <Input type="number" min="1" max="10" value={form.children_count} onChange={e => update('children_count', e.target.value)} className="rounded-xl w-24" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Poruka dadinji</Label>
            <Textarea value={form.notes} onChange={e => update('notes', e.target.value)} placeholder="Predstavite se, opišite svoju obitelj…" rows={2} className="rounded-xl resize-none" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Posebne upute</Label>
            <Textarea value={form.special_notes} onChange={e => update('special_notes', e.target.value)} placeholder="Alergije, raspored spavanja, kućna pravila…" rows={2} className="rounded-xl resize-none" />
          </div>
        </div>

        <Separator className="opacity-40" />

        {/* Price breakdown */}
        <div className="bg-gradient-to-br from-ivory to-rose-light/30 rounded-2xl p-5 space-y-3">
          <h3 className="font-display font-semibold text-base">Pregled cijene</h3>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{durationHours > 0 ? `${durationHours % 1 === 0 ? durationHours : durationHours.toFixed(1)} sati` : '0 sati'} × €{rate}/sat</span>
            <span className="font-medium">€{totalPrice.toFixed(2)}</span>
          </div>
          <Separator className="opacity-40" />
          <div className="flex justify-between font-semibold text-base">
            <span>Ukupno</span>
            <span className="text-primary font-display text-xl">€{totalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Guarantee note */}
        <div className="flex items-start gap-3 bg-emerald-50 rounded-2xl p-4">
          <Shield className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-800 leading-relaxed">
            Vaše plaćanje je zaštićeno. Naplatit će vam se tek kada dadilja potvrdi rezervaciju.
          </p>
        </div>

        {canBook ? (
          <Button
            onClick={() => bookMutation.mutate()}
            disabled={bookMutation.isPending}
            className="w-full text-base font-semibold rounded-2xl shadow-lg shadow-primary/20"
            style={{ height: '3.25rem' }}
          >
            {bookMutation.isPending ? (
              <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Šaljem zahtjev…</span>
            ) : (
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Potvrdi rezervaciju</span>
            )}
          </Button>
        ) : (
          <Button
            disabled
            variant="secondary"
            className="w-full text-base font-semibold rounded-2xl"
            style={{ height: '3.25rem' }}
          >
            Ispunite sva polja za nastavak
          </Button>
        )}
      </div>
    </div>
  );
}