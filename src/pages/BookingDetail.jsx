import React from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import {
  ArrowLeft, Calendar, Clock, MapPin, Users, Euro, MessageCircle,
  AlertTriangle, Star, ChevronRight, Shield, CheckCircle2, History, X
} from 'lucide-react';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { hr } from 'date-fns/locale';
import { toast } from 'sonner';

const STATUS_BADGE_TONE = {
  'Na čekanju': 'bg-amber-100 text-amber-800 border-amber-200',
  'Potvrđeno': 'bg-green-100 text-green-800 border-green-200',
  'Otkazano': 'bg-muted text-muted-foreground border-border',
  'Odbijeno': 'bg-rose-100 text-rose-800 border-rose-200',
  'Završeno': 'bg-sage/30 text-foreground border-sage/40',
};

const REPORT_CATEGORY_LABEL = {
  early_completion: 'Prerani završetak',
  parent_dispute: 'Prijava obitelji',
  safety_concern: 'Sigurnosni problem',
  inappropriate_behavior: 'Neprimjereno ponašanje',
  no_show: 'Nedolazak',
  payment_dispute: 'Spor oko plaćanja',
  other: 'Ostalo',
};

const REPORT_STATUS_LABEL = {
  open: 'Otvoreno',
  investigating: 'U obradi',
  resolved: 'Riješeno',
  dismissed: 'Odbačeno',
};

// Base44 timestamps come without Z suffix despite being UTC. Normalize before parsing.
function normalizeIso(iso) {
  if (!iso) return iso;
  return iso.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(iso) ? iso : iso + 'Z';
}

function formatTimestamp(iso) {
  if (!iso) return '';
  try {
    return format(parseISO(normalizeIso(iso)), "d. MMM yyyy. 'u' HH:mm", { locale: hr });
  } catch {
    return iso;
  }
}

function formatMessageTime(iso) {
  if (!iso) return '';
  try {
    const d = parseISO(normalizeIso(iso));
    if (isToday(d)) return format(d, 'HH:mm', { locale: hr });
    if (isYesterday(d)) return 'jučer ' + format(d, 'HH:mm', { locale: hr });
    return format(d, 'd. MMM HH:mm', { locale: hr });
  } catch {
    return '';
  }
}

function renderMessageContent(content) {
  if (!content) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);
  return parts.map((part, i) => {
    if (urlRegex.test(part)) {
      urlRegex.lastIndex = 0;
      try {
        const u = new URL(part);
        const isInternal = u.host.endsWith('base44.app');
        if (isInternal) {
          // Internal nav — keep user inside the app shell via react-router
          const path = u.pathname + u.search;
          let label = u.host.replace(/^www\./, '') + (u.pathname.split('/').filter(Boolean).pop() ? '/' + u.pathname.split('/').filter(Boolean).pop() : '');
          if (u.pathname.includes('BookingDetail')) {
            label = 'Otvori detalje rezervacije →';
          }
          return (
            <Link
              key={i}
              to={path}
              className="text-primary underline underline-offset-2 hover:text-primary/80"
              onClick={(e) => e.stopPropagation()}
            >
              {label}
            </Link>
          );
        }
        // External URL — keep new-tab behavior
        const lastSeg = u.pathname.split('/').filter(Boolean).pop() || '';
        const label = u.host.replace(/^www\./, '') + (lastSeg ? '/' + lastSeg : '');
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:text-primary/80"
            onClick={(e) => e.stopPropagation()}
          >
            {label}
          </a>
        );
      } catch (_) {
        return <span key={i}>{part}</span>;
      }
    }
    return <span key={i}>{part}</span>;
  });
}

export default function BookingDetail() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('id');
  const navigate = useNavigate();
  const { user } = useAuth();

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['bookingDetail', bookingId, user?.email],
    queryFn: async () => {
      const resp = await base44.functions.invoke('getBookingDetail', { booking_id: bookingId });
      const d = resp?.data || resp;
      if (!d?.success) throw new Error(d?.error || 'Učitavanje nije uspjelo.');
      return d;
    },
    enabled: !!bookingId && !!user?.email,
    refetchInterval: 15000,
  });

  // Status-change mutation (used by parent cancel + nanny cancel/complete buttons below).
  const statusMutation = useMutation({
    mutationFn: async (newStatus) => {
      const resp = await base44.functions.invoke('updateBooking', {
        booking_id: bookingId,
        updates: { status: newStatus },
      });
      const d = resp?.data || resp;
      if (!d?.success) throw new Error(d?.error || 'Ažuriranje nije uspjelo.');
      return d.booking;
    },
    onSuccess: (_, newStatus) => {
      queryClient.invalidateQueries({ queryKey: ['bookingDetail'] });
      const msg = newStatus === 'Otkazano'
        ? 'Rezervacija otkazana'
        : newStatus === 'Završeno'
        ? 'Rezervacija označena kao završena'
        : 'Rezervacija ažurirana';
      toast.success(msg);
    },
    onError: (err) => {
      console.error('BookingDetail status change failed:', err);
      toast.error(err?.message || 'Ažuriranje nije uspjelo.');
    },
  });

  if (!bookingId) {
    return (
      <div className="max-w-2xl mx-auto pt-16 text-center px-4">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
        <p className="text-muted-foreground">Rezervacija nije navedena u URL-u.</p>
        <Link to="/MyBookings"><Button variant="ghost" className="mt-4">Natrag</Button></Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 pt-6 space-y-4">
        <div className="h-10 w-32 bg-muted/40 rounded-xl animate-pulse" />
        <div className="h-48 bg-muted/40 rounded-3xl animate-pulse" />
        <div className="h-32 bg-muted/40 rounded-2xl animate-pulse" />
        <div className="h-32 bg-muted/40 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto pt-16 text-center px-4">
        <AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-4" />
        <p className="text-muted-foreground">{error?.message || 'Učitavanje nije uspjelo.'}</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate(-1)}>Natrag</Button>
      </div>
    );
  }

  const { booking, conversation, messages_preview = [], reports = [], review, viewer_role } = data;
  const otherPartyName = viewer_role === 'parent'
    ? (booking.nanny_name || 'Dadilja')
    : (booking.family_display_name || booking.family_name || 'Obitelj');
  const otherPartyEmail = viewer_role === 'parent' ? booking.nanny_user_email : booking.family_user_email;
  const otherPartyLabel = viewer_role === 'parent' ? 'Dadilja' : 'Obitelj';

  const statusHistory = Array.isArray(booking.status_history) ? booking.status_history : [];
  const tone = STATUS_BADGE_TONE[booking.status] || STATUS_BADGE_TONE['Na čekanju'];

  return (
    <div className="max-w-3xl mx-auto px-4 pt-4 pb-12 space-y-5">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="text-muted-foreground hover:text-foreground -ml-2"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Natrag
      </Button>

      {viewer_role === 'admin' && (
        <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl px-4 py-2 text-xs text-amber-900 flex items-center gap-2">
          <Shield className="w-3.5 h-3.5" />
          Pregled administratora — vidite sve podatke i sve prijave o ovoj rezervaciji.
        </div>
      )}

      {/* Header card — booking essentials */}
      <Card className="p-6 border-border/60 rounded-3xl">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              Rezervacija
            </p>
            <h1 className="font-display font-bold text-2xl text-foreground leading-tight">
              {otherPartyLabel}: {otherPartyName}
            </h1>
          </div>
          <Badge className={`${tone} font-medium border whitespace-nowrap`}>
            {booking.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-foreground">
            <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span>{booking.date}</span>
          </div>
          <div className="flex items-center gap-2 text-foreground">
            <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span>{booking.start_time} – {booking.end_time} ({booking.duration_hours} h)</span>
          </div>
          <div className="flex items-center gap-2 text-foreground">
            <Euro className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span>€{booking.total_price?.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2 text-foreground">
            <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span>{booking.children_count} {booking.children_count === 1 ? 'dijete' : 'djece'}</span>
          </div>
          {booking.address && (
            <div className="flex items-start gap-2 text-foreground sm:col-span-2">
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <span>{booking.address}</span>
            </div>
          )}
        </div>

        {booking.special_notes && (
          <div className="mt-4 pt-4 border-t border-border/40">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              Napomene
            </p>
            <p className="text-sm text-foreground whitespace-pre-wrap">{booking.special_notes}</p>
          </div>
        )}

        {booking.message && (
          <div className="mt-4 pt-4 border-t border-border/40">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              Poruka obitelji
            </p>
            <p className="text-sm text-foreground italic whitespace-pre-wrap">"{booking.message}"</p>
          </div>
        )}
      </Card>

      {/* Status history */}
      {statusHistory.length > 0 && (
        <Card className="p-5 border-border/60 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-display font-semibold text-foreground">Tijek rezervacije</h2>
          </div>
          <ol className="space-y-3">
            {statusHistory.map((entry, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-1.5 w-2 h-2 rounded-full bg-primary/60 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{entry.status}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimestamp(entry.at)}
                    {entry.by_role && entry.by_role !== 'parent' && entry.by_role !== 'nanny'
                      ? '' // admin or system — don't show
                      : entry.by_role === 'parent' ? ' · od obitelji' : entry.by_role === 'nanny' ? ' · od dadilje' : ''}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      )}

      {/* Chat preview + link */}
      <Card className="p-5 border-border/60 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-muted-foreground" />
              <h2 className="font-display font-semibold text-foreground">Razgovor</h2>
            </div>
            {conversation && (
              <Link to={`/Messages?conversation_id=${conversation.id}`}>
                <Button variant="ghost" size="sm" className="text-primary text-xs">
                  Otvori razgovor <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            )}
          </div>
          {messages_preview.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              Još nema poruka. Možete započeti razgovor s {otherPartyLabel.toLowerCase()}om.
            </p>
          ) : (
            <div className="space-y-2">
              {messages_preview.slice(-3).map(m => {
                const fromMe = m.sender_email === user?.email;
                return (
                  <div key={m.id} className={`flex ${fromMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] flex flex-col ${fromMe ? 'items-end' : 'items-start'}`}>
                      <div className={`rounded-xl px-3 py-2 text-sm ${
                        fromMe ? 'bg-primary/10 text-foreground' : 'bg-muted text-foreground'
                      }`}>
                        <p className="text-[10px] font-semibold mb-0.5 opacity-70">
                          {fromMe ? 'Vi' : (m.sender_name || otherPartyName)}
                        </p>
                        <p className="whitespace-pre-wrap">{renderMessageContent(m.content)}</p>
                      </div>
                      <p className="text-[10px] mt-1 opacity-50 text-muted-foreground">{formatMessageTime(m.created_date)}</p>
                    </div>
                  </div>
                );
              })}
              {messages_preview.length > 3 && (
                <p className="text-xs text-center text-muted-foreground pt-1">
                  Prikazano {Math.min(3, messages_preview.length)} od ukupno više poruka — otvorite za sve.
                </p>
              )}
            </div>
          )}
        </Card>

      {/* Reports related to this booking */}
      {reports.length > 0 && (
        <Card className="p-5 border-amber-200/60 bg-amber-50/30 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-amber-700" />
            <h2 className="font-display font-semibold text-foreground">Prijave</h2>
          </div>
          <div className="space-y-3">
            {reports.map(r => (
              <div key={r.id} className="bg-card border border-border/40 rounded-xl p-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground">
                    {REPORT_CATEGORY_LABEL[r.category] || r.category}
                  </span>
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                    {REPORT_STATUS_LABEL[r.status] || r.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {formatTimestamp(r.created_date)}
                </p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{r.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Review (if exists) */}
      {review && (
        <Card className="p-5 border-border/60 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <h2 className="font-display font-semibold text-foreground">Recenzija</h2>
          </div>
          <div className="flex items-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${i < (review.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-muted/40'}`} />
            ))}
            <span className="text-sm font-semibold text-foreground ml-1">{review.rating}/5</span>
          </div>
          {review.comment && (
            <p className="text-sm text-foreground italic whitespace-pre-wrap">"{review.comment}"</p>
          )}
          <p className="text-xs text-muted-foreground mt-2">— {review.parent_name || 'Obitelj'}</p>
        </Card>
      )}

      {/* Action buttons */}
      <Card className="p-4 border-border/60 rounded-2xl bg-muted/20">
        <div className="flex flex-wrap gap-2 justify-end">
          {viewer_role === 'parent' && booking.status === 'Završeno' && !review && (
            <Link to={`/LeaveReview?booking_id=${booking.id}`}>
              <Button size="sm" variant="default" className="rounded-xl">
                <Star className="w-3.5 h-3.5 mr-1.5" /> Ostavi recenziju
              </Button>
            </Link>
          )}

          {/* Parent cancel — Na čekanju */}
          {viewer_role === 'parent' && booking.status === 'Na čekanju' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline" className="rounded-xl text-destructive border-destructive/40 hover:bg-destructive/10">
                  Otkaži zahtjev
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Otkazati zahtjev?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Vaš zahtjev za rezervaciju bit će povučen. Možete pretražiti druge dadilje u bilo kojem trenutku.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Ne, ostavi</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    onClick={() => statusMutation.mutate('Otkazano')}
                  >
                    Da, otkaži
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* Parent cancel — Potvrđeno */}
          {viewer_role === 'parent' && booking.status === 'Potvrđeno' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline" className="rounded-xl text-destructive border-destructive/40 hover:bg-destructive/10">
                  Otkaži rezervaciju
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Otkazati potvrđenu rezervaciju?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Dadilja se već pripremila za ovaj termin. Otkazujte samo u opravdanim slučajevima. Dadilja će biti odmah obaviještena.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Ne, ostavi</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    onClick={() => statusMutation.mutate('Otkazano')}
                  >
                    Da, otkaži
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* Nanny accept/reject — Na čekanju */}
          {viewer_role === 'nanny' && booking.status === 'Na čekanju' && (
            <>
              <Button
                size="sm"
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => statusMutation.mutate('Potvrđeno')}
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Prihvati
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="outline" className="rounded-xl text-destructive border-destructive/40 hover:bg-destructive/10">
                    <X className="w-3.5 h-3.5 mr-1.5" /> Odbij
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
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
                      onClick={() => statusMutation.mutate('Odbijeno')}
                    >
                      Odbij rezervaciju
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}

          {/* Nanny complete/cancel — Potvrđeno */}
          {viewer_role === 'nanny' && booking.status === 'Potvrđeno' && (
            <>
              <Button
                size="sm"
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => statusMutation.mutate('Završeno')}
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Završi
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="outline" className="rounded-xl text-destructive border-destructive/40 hover:bg-destructive/10">
                    <X className="w-3.5 h-3.5 mr-1.5" /> Otkaži
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
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
                      onClick={() => statusMutation.mutate('Otkazano')}
                    >
                      Da, otkaži
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}

          {viewer_role !== 'admin' && (
            <Link to={conversation ? `/Messages?conversation_id=${conversation.id}` : '/Messages'}>
              <Button size="sm" variant="outline" className="rounded-xl">
                <MessageCircle className="w-3.5 h-3.5 mr-1.5" /> {otherPartyEmail ? `Poruka — ${otherPartyLabel}` : 'Poruke'}
              </Button>
            </Link>
          )}
          {viewer_role === 'admin' && (
            <Link to="/AdminBookings">
              <Button size="sm" variant="outline" className="rounded-xl">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Sve rezervacije
              </Button>
            </Link>
          )}
        </div>
      </Card>
    </div>
  );
}