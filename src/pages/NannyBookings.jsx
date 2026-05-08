import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Calendar, Clock, Check, X, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { buildConversationKey } from '@/lib/chat';
import { format, parseISO } from 'date-fns';
import { hr } from 'date-fns/locale';

function formatCreated(iso) {
  if (!iso) return '';
  try {
    const normalized = iso.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(iso) ? iso : iso + 'Z';
    return format(parseISO(normalized), 'd. MMM yyyy.', { locale: hr });
  } catch {
    return '';
  }
}

const statusStyles = {
  'Na čekanju': 'bg-peach/50 text-peach-dark',
  'Potvrđeno': 'bg-sage/30 text-sage-foreground',
  'Završeno': 'bg-muted text-muted-foreground',
  'Otkazano': 'bg-destructive/10 text-destructive',
  'Odbijeno': 'bg-destructive/10 text-destructive',
};

export default function NannyBookings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [pastSubTab, setPastSubTab] = useState('all');

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['nannyBookingsAll', user?.email],
    queryFn: () => base44.entities.Booking.filter({ nanny_user_email: user?.email }, '-date', 100),
    enabled: !!user?.email,
  });

  const sendBookingMessage = async (booking, newStatus) => {
    const parentEmail = booking.family_user_email;
    const nannyEmail = user.email;
    const nannyName = user.full_name || 'Dadilja';
    const statusText = newStatus === 'Potvrđeno' ? 'potvrđena' : newStatus === 'Odbijeno' ? 'odbijena' : 'otkazana';
    const content = `Vaša rezervacija za ${booking.date} je ${statusText}.`;

    const conversationKey = buildConversationKey(parentEmail, nannyEmail);
    const existing = await base44.entities.Conversation.filter(
      { conversation_key: conversationKey },
      '-updated_date',
      1
    );

    let conv = existing?.[0];

    if (!conv) {
      const convResp = await base44.functions.invoke('createConversation', {
        conversation: {
          conversation_key: conversationKey,
          participant_emails: [nannyEmail, parentEmail],
          participant_names: [nannyName, booking.family_name || 'Roditelj'],
          last_message: content,
          last_message_date: new Date().toISOString(),
          hidden_for: [],
        },
      });
      const convRespData = convResp?.data || convResp;
      if (convRespData?.success && convRespData?.conversation) {
        conv = convRespData.conversation;
      } else {
        throw new Error(convRespData?.error || 'Razgovor nije kreiran.');
      }
    } else {
      await base44.entities.Conversation.update(conv.id, {
        last_message: content,
        last_message_date: new Date().toISOString(),
        hidden_for: (conv.hidden_for || []).filter(e => e !== parentEmail),
      });
    }

    await base44.entities.Message.create({
      conversation_id: String(conv.id),
      sender_email: nannyEmail,
      sender_name: nannyName,
      receiver_email: parentEmail,
      content,
      read: false,
    });
  };

  const updateMutation = useMutation({
    mutationFn: async ({ id, data, booking }) => {
      const resp = await base44.functions.invoke('updateBooking', {
        booking_id: id,
        updates: data,
      });
      const respData = resp?.data || resp;
      if (!respData?.success) throw new Error(respData?.error || 'Ažuriranje nije uspjelo.');
      // Best-effort notification. Failure here doesn't undo the status change.
      try { await sendBookingMessage(booking, data.status); } catch (e) { console.error('sendBookingMessage failed:', e?.message); }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nannyBookingsAll', user?.email] });
      toast.success('Rezervacija ažurirana');
    },
    onError: (err) => {
      toast.error(err?.message || 'Ažuriranje nije uspjelo.');
    },
  });

  const pending = bookings.filter(b => b.status === 'Na čekanju');
  const upcoming = bookings.filter(b => b.status === 'Potvrđeno');
  const past = bookings.filter(b => ['Završeno', 'Otkazano', 'Odbijeno'].includes(b.status));

  // Group past bookings by status, most-recently-created first within each group.
  const pastByStatus = (() => {
    const groups = { 'Završeno': [], 'Otkazano': [], 'Odbijeno': [] };
    for (const b of past) {
      if (groups[b.status]) groups[b.status].push(b);
    }
    for (const k of Object.keys(groups)) {
      groups[k].sort((a, b) => Date.parse(b.created_date) - Date.parse(a.created_date));
    }
    return groups;
  })();
  const PAST_SECTION_ORDER = ['Završeno', 'Otkazano', 'Odbijeno'];
  const PAST_SECTION_LABELS = {
    'Završeno': 'Završene',
    'Otkazano': 'Otkazane',
    'Odbijeno': 'Odbijene',
  };

  const BookingCard = ({ booking }) => (
    <Card
      className="p-4 border-border/60 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/BookingDetail?id=${booking.id}`)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm">
              {booking.family_display_name || booking.family_name || 'Obitelj'}
            </h3>
            <Badge className={`text-[11px] ${statusStyles[booking.status]} border-0`}>
              {booking.status}
            </Badge>
          </div>
          {booking.family_name && booking.family_display_name && booking.family_name !== booking.family_display_name && (
            <p className="text-xs text-muted-foreground mb-1">
              Obitelj {booking.family_name}
            </p>
          )}
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {booking.date}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3" /> {booking.start_time} - {booking.end_time}
          </p>
          {booking.created_date && (
            <p className="text-[11px] text-muted-foreground/70 mt-1">
              Kreirano {formatCreated(booking.created_date)}
            </p>
          )}
          {booking.special_notes && (
            <p className="text-xs text-muted-foreground mt-1">Napomene: {booking.special_notes}</p>
          )}
        </div>

        <div className="text-right">
          <p className="font-display font-semibold text-primary">€{booking.total_price?.toFixed(2)}</p>

          {booking.status === 'Potvrđeno' && (
            <div className="flex gap-1.5 mt-2 justify-end" onClick={(e) => e.stopPropagation()}>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2.5 text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <X className="w-3 h-3 mr-1" /> Otkaži
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Otkazati potvrđenu rezervaciju?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Obitelj se već pripremila za ovaj termin. Otkazivanje potvrđene rezervacije može utjecati na vašu ocjenu pouzdanosti. Otkazujte samo u opravdanim slučajevima (bolest, hitan slučaj). Obitelj će biti odmah obaviještena.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Ne, ostavi</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateMutation.mutate({
                          id: booking.id,
                          data: { status: 'Otkazano' },
                          booking,
                        });
                      }}
                    >
                      Da, otkaži
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button
                size="sm"
                className="h-7 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  updateMutation.mutate({
                    id: booking.id,
                    data: { status: 'Završeno' },
                    booking,
                  });
                }}
              >
                <CheckCircle2 className="w-3 h-3 mr-1" /> Završi
              </Button>
            </div>
          )}

          {booking.status === 'Na čekanju' && (
            <div className="flex gap-1.5 mt-2" onClick={(e) => e.stopPropagation()}>
              <Button
                size="sm"
                className="h-7 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  updateMutation.mutate({
                    id: booking.id,
                    data: { status: 'Potvrđeno' },
                    booking,
                  });
                }}
              >
                <Check className="w-3 h-3 mr-1" /> Prihvati
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2.5 text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <X className="w-3 h-3 mr-1" /> Odbij
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Jesi li siguran/sigurna?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Ova rezervacija će biti odbijena i obitelj će biti obaviještena.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Odustani</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateMutation.mutate({
                          id: booking.id,
                          data: { status: 'Odbijeno' },
                          booking,
                        });
                      }}
                    >
                      Odbij rezervaciju
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div>
      <PageHeader icon={Calendar} title="Moje rezervacije" subtitle="Upravljajte zahtjevima za čuvanje" />

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-36 bg-muted/40 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
      <>
      {pending.length > 0 && (
        <div className="mb-6">
          <h2 className="font-display font-semibold mb-3 text-sm text-primary">
            Zahtjevi na čekanju ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map(b => <BookingCard key={b.id} booking={b} />)}
          </div>
        </div>
      )}

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Nadolazeći ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Prošli ({past.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {upcoming.length === 0 ? (
            <div className="text-center py-12 bg-card border border-dashed border-border/60 rounded-3xl">
              <div className="w-16 h-16 rounded-2xl bg-rose-light flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-primary/40" />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-1.5">Nema nadolazećih termina</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">Kad obitelji rezerviraju vaše vrijeme, novi termini će se pojaviti ovdje.</p>
            </div>
          ) : (
            <div className="space-y-3">{upcoming.map(b => <BookingCard key={b.id} booking={b} />)}</div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {past.length === 0 ? (
            <div className="text-center py-12 bg-card border border-dashed border-border/60 rounded-3xl">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <p className="text-muted-foreground text-sm">Vaši završeni termini će se pojaviti ovdje.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Sub-tabs to filter past by status */}
              <div className="flex gap-1 mb-4 overflow-x-auto -mx-1 px-1">
                {[
                  { key: 'all', label: 'Sve', count: past.length },
                  { key: 'Završeno', label: 'Završene', count: (pastByStatus['Završeno'] || []).length },
                  { key: 'Otkazano', label: 'Otkazane', count: (pastByStatus['Otkazano'] || []).length },
                  { key: 'Odbijeno', label: 'Odbijene', count: (pastByStatus['Odbijeno'] || []).length },
                ].map(({ key, label, count }) => {
                  if (key !== 'all' && count === 0) return null;
                  const isActive = pastSubTab === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setPastSubTab(key)}
                      className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                        isActive
                          ? 'bg-foreground text-background font-medium'
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                      }`}
                      style={{ touchAction: 'manipulation' }}
                    >
                      {label} ({count})
                    </button>
                  );
                })}
              </div>

              {pastSubTab === 'all' ? (
                PAST_SECTION_ORDER.map(status => {
                  const items = pastByStatus[status] || [];
                  if (items.length === 0) return null;
                  return (
                    <div key={status} className="space-y-3">
                      <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mt-6 first:mt-0 mb-2">
                        {PAST_SECTION_LABELS[status]} ({items.length})
                      </h3>
                      {items.map(b => <BookingCard key={b.id} booking={b} />)}
                    </div>
                  );
                })
              ) : (
                (pastByStatus[pastSubTab] || []).map(b => <BookingCard key={b.id} booking={b} />)
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
      </>
      )}
    </div>
  );
}