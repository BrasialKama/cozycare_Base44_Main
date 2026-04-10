import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { ArrowLeft, Calendar, Clock, Shield, CheckCircle2, Sparkles, MapPin, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { config } from '@/lib/config';

export default function BookNanny() {
  const [searchParams] = useSearchParams();
  const nannyId = searchParams.get('nanny_id');
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [submitted, setSubmitted] = useState(false);

  const publicId = searchParams.get('public_id');

  // Fetch PublicNannyProfile for display
  const { data: nanny, isLoading } = useQuery({
    queryKey: ['publicNannyForBooking', nannyId],
    queryFn: async () => {
      const results = await base44.entities.PublicNannyProfile.filter(
        { nanny_profile_id: nannyId },
        '-created_date',
        1
      );
      return results?.[0] || null;
    },
    enabled: !!nannyId,
  });

  const displayNanny = nanny;

  const [form, setForm] = useState({
    date: '',
    start_time: '',
    end_time: '',
    address: '',
    notes: '',
    children_count: 1,
    special_notes: '',
  });

  // Pre-fill address from FamilyProfile
  const { data: familyProfiles = [] } = useQuery({
    queryKey: ['familyProfile', user?.email],
    queryFn: () =>
      base44.entities.FamilyProfile.filter({ user_email: user?.email }, '-created_date', 1),
    enabled: !!user?.email,
  });

  useEffect(() => {
    const addr = familyProfiles?.[0]?.address;
    if (addr && !form.address) {
      setForm(prev => ({ ...prev, address: addr }));
    }
  }, [familyProfiles]);

  const update = (key, val) => {
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
  const rate = displayNanny?.hourly_rate || nanny?.hourly_rate || 0;
  const totalPrice = +(durationHours * rate).toFixed(2);
  const timeError = form.start_time && form.end_time && durationHours <= 0 ? 'Vrijeme završetka mora biti nakon vremena početka' : null;
  const canBook = form.date && form.start_time && form.end_time && form.address.trim() && durationHours > 0;

  const nannyName = displayNanny ? `${displayNanny.first_name || displayNanny.display_name || ''} ${displayNanny.last_name_initial || displayNanny.last_name || ''}`.trim() : '';

  const bookMutation = useMutation({
    mutationFn: async () => {
      const familyProfile = familyProfiles?.[0] || null;

      // Resolve private NannyProfile at booking time
      const privateNanny = await base44.entities.NannyProfile.get(nanny.nanny_profile_id);

      const bookingData = {
        nanny_id: privateNanny.id,
        nanny_user_email: privateNanny.user_email,
        nanny_name: privateNanny.display_name || `${privateNanny.first_name} ${privateNanny.last_name}`,
        family_user_email: user.email,
        family_profile_id: familyProfile?.id || '',
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

      const booking = await base44.entities.Booking.create(bookingData);

      // Optional notification call: only send booking id, not full private payload
      fetch(config.notificationApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: booking.id }),
      }).catch(err => console.error('Booking notification failed:', err));

      const botConversationKey = `${config.bot.email}__${String(user.email).toLowerCase()}`;
      const existingBotConversations = await base44.entities.Conversation.filter(
        { conversation_key: botConversationKey },
        '-updated_date',
        1
      );

      let conv = existingBotConversations?.[0];

      if (!conv) {
        conv = await base44.entities.Conversation.create({
          conversation_key: botConversationKey,
          participant_emails: [config.bot.email, user.email],
          participant_names: [config.bot.name, user.full_name || 'Roditelj'],
          last_message: `Rezervacija s dadiljom ${privateNanny.first_name} zaprimljena.`,
          last_message_date: new Date().toISOString(),
          hidden_for: [],
        });
      } else {
        await base44.entities.Conversation.update(conv.id, {
          last_message: `Rezervacija s dadiljom ${privateNanny.first_name} zaprimljena.`,
          last_message_date: new Date().toISOString(),
          hidden_for: (conv.hidden_for || []).filter(e => e !== user.email),
        });
      }

      const botMsg = [
        `\u2705 Va\u0161a rezervacija s dadiljom ${privateNanny.first_name} ${privateNanny.last_name}`,
        `za ${bookingData.date} od ${bookingData.start_time} do ${bookingData.end_time}`,
        `je zaprimljena. Ukupno: \u20ac${bookingData.total_price}.`,
        `Dadilja \u0107e potvrditi u najkra\u0107em roku.`
      ].join(' ');
      const botMessage = botMsg; do ${bookingData.end_time} je zaprimljena. Ukupno: €${bookingData.total_price}. Dadilja će potvrditi u najkraćem roku.`; od ${bookingData.start_time} do ${bookingData.end_time} je zaprimljena. Ukupno: €${bookingData.total_price}. Dadilja će potvrditi u najkraćem roku.`;

      await base44.entities.Message.create({
        conversation_id: String(conv.id),
        sender_email: config.bot.email,
        sender_name: config.bot.name,
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

  const displayName = displayNanny?.first_name || nanny?.first_name || '?';
  const initial = displayName[0];

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
          {(displayNanny?.profile_photo_url || nanny?.photo_url) ? (
            <img src={displayNanny?.profile_photo_url || nanny?.photo_url} alt={nannyName} className="w-full h-full object-cover" />
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
                <Select value={form.start_time} onValueChange={val => update('start_time', val)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Odaberi" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 48 }, (_, i) => {
                      const h = String(Math.floor(i / 2)).padStart(2, '0');
                      const m = i % 2 === 0 ? '00' : '30';
                      return <SelectItem key={`s-${i}`} value={`${h}:${m}`}>{h}:{m}</SelectItem>;
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Završetak</Label>
                <Select value={form.end_time} onValueChange={val => update('end_time', val)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Odaberi" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 48 }, (_, i) => {
                      const h = String(Math.floor(i / 2)).padStart(2, '0');
                      const m = i % 2 === 0 ? '00' : '30';
                      return <SelectItem key={`e-${i}`} value={`${h}:${m}`}>{h}:{m}</SelectItem>;
                    })}
                  </SelectContent>
                </Select>
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
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Poruka dadilji</Label>
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