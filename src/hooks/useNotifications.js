import { useEffect, useMemo, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { format, parseISO } from 'date-fns';
import { hr } from 'date-fns/locale';
import { AlertTriangle, Star, Search } from 'lucide-react';
import {
  readDismissals,
  gcDismissals,
  dismissNotification,
  dismissNotifications,
} from '@/lib/notificationDismissals';

/**
 * Normalize a Base44 ISO timestamp/date so parseISO treats it as UTC.
 */
function normalizeIso(iso) {
  if (!iso) return iso;
  return iso.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(iso) ? iso : iso + 'Z';
}

function formatHrDate(value) {
  if (!value) return '';
  try {
    return format(parseISO(normalizeIso(value)), 'd. MMM yyyy.', { locale: hr });
  } catch {
    return '';
  }
}

/**
 * Aggregates "Treba vaša pažnja" actionable items for the current parent user.
 *
 * Returns:
 *   { items, count, previousItems, isLoading, dismiss, dismissAll, refetch }
 *
 * `items` are the active (undismissed) notifications. `count` mirrors the
 * length of `items`. `previousItems` are items that have been dismissed
 * within the last 7 days, kept so the user can see history in the Inbox
 * "Prethodne" tab.
 *
 * For non-parent roles (nanny / admin), returns empty everything.
 */
export default function useNotifications() {
  const { user, effectiveRole } = useAuth();
  const isParent = effectiveRole === 'parent';
  const enabled = isParent && !!user?.email;

  // ── Local dismissal state, mirrored from localStorage ──
  const [dismissals, setDismissals] = useState(() =>
    enabled ? gcDismissals(readDismissals(user.email)) : {}
  );

  // Re-read when the user changes or queries become enabled.
  useEffect(() => {
    if (!enabled) {
      setDismissals({});
      return;
    }
    setDismissals(gcDismissals(readDismissals(user.email)));
  }, [enabled, user?.email]);

  // Listen for in-tab and cross-tab changes so multiple components stay in sync.
  useEffect(() => {
    if (!enabled) return undefined;
    const refresh = () => setDismissals(gcDismissals(readDismissals(user.email)));
    window.addEventListener('cozycare:notifications-changed', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('cozycare:notifications-changed', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [enabled, user?.email]);

  // ── Data queries (parent only) ──
  const reportsQ = useQuery({
    queryKey: ['notifications', 'myActiveReports', user?.email],
    queryFn: () =>
      base44.entities.Report.filter(
        { reporter_email: user?.email },
        '-created_date',
        20
      ),
    enabled,
    refetchInterval: 30_000,
    staleTime: 30_000,
  });

  const completedQ = useQuery({
    queryKey: ['notifications', 'myCompletedForReview', user?.email],
    queryFn: () =>
      base44.entities.Booking.filter(
        { family_user_email: user?.email, status: 'Završeno' },
        '-date',
        20
      ),
    enabled,
    refetchInterval: 30_000,
    staleTime: 60_000,
  });

  const reviewsQ = useQuery({
    queryKey: ['notifications', 'myReviews', user?.email],
    queryFn: () =>
      base44.entities.Review.filter(
        { parent_email: user?.email },
        '-created_date',
        50
      ),
    enabled,
    refetchInterval: 30_000,
    staleTime: 60_000,
  });

  const declinedQ = useQuery({
    queryKey: ['notifications', 'myDeclinedBookings', user?.email],
    queryFn: () =>
      base44.entities.Booking.filter(
        { family_user_email: user?.email, status: 'Odbijeno' },
        '-date',
        10
      ),
    enabled,
    refetchInterval: 30_000,
    staleTime: 60_000,
  });

  const refetch = useCallback(() => {
    if (!enabled) return;
    reportsQ.refetch();
    completedQ.refetch();
    reviewsQ.refetch();
    declinedQ.refetch();
  }, [enabled, reportsQ, completedQ, reviewsQ, declinedQ]);

  useEffect(() => {
    if (!enabled) return undefined;
    const onFocus = () => refetch();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [enabled, refetch]);

  // Build the full list of currently-eligible notifications (before dismissal filtering).
  const allItems = useMemo(() => {
    if (!isParent) return [];

    const myReports = reportsQ.data || [];
    const myCompletedBookings = completedQ.data || [];
    const myReviews = reviewsQ.data || [];
    const myDeclinedBookings = declinedQ.data || [];

    const out = [];

    // 1. Open reports
    for (const r of myReports) {
      if (r.status === 'open' || r.status === 'investigating') {
        out.push({
          id: `report-${r.id}`,
          icon: AlertTriangle,
          iconBg: 'bg-amber-100',
          iconFg: 'text-amber-700',
          label: 'Vaša prijava se obrađuje',
          sublabel: formatHrDate(r.created_date),
          to: r.booking_id ? `/BookingDetail?id=${r.booking_id}` : '/Messages',
        });
      }
    }

    // 2. Unreviewed Završeno bookings within 7 days
    const reviewedBookingIds = new Set(myReviews.map(rv => rv.booking_id).filter(Boolean));
    const now = Date.now();
    for (const b of myCompletedBookings) {
      if (reviewedBookingIds.has(b.id)) continue;
      if (!b.date) continue;
      const ageDays = (now - Date.parse(b.date)) / (1000 * 60 * 60 * 24);
      if (ageDays < 0 || ageDays > 7) continue;
      out.push({
        id: `review-${b.id}`,
        icon: Star,
        iconBg: 'bg-amber-50',
        iconFg: 'text-amber-600',
        label: `Ostavite recenziju za ${b.nanny_name || 'dadilju'}`,
        sublabel: formatHrDate(b.date),
        to: `/LeaveReview?booking_id=${b.id}`,
      });
    }

    // 3. Recently declined bookings (within 14 days)
    for (const b of myDeclinedBookings) {
      if (!b.date) continue;
      const ageDays = (now - Date.parse(b.date)) / (1000 * 60 * 60 * 24);
      if (ageDays < 0 || ageDays > 14) continue;
      out.push({
        id: `declined-${b.id}`,
        icon: Search,
        iconBg: 'bg-rose-light',
        iconFg: 'text-primary',
        label: `${b.nanny_name || 'Dadilja'} nije mogla — pronađite drugu`,
        sublabel: formatHrDate(b.date),
        to: '/FindNannies',
      });
    }

    return out;
  }, [isParent, reportsQ.data, completedQ.data, reviewsQ.data, declinedQ.data]);

  // Active = currently eligible AND not dismissed.
  const items = useMemo(
    () => allItems.filter(item => !dismissals[item.id]),
    [allItems, dismissals]
  );

  // Previous = anything in localStorage, joined back to its render shape if
  // we still have an "eligible" entry; otherwise we render a minimal stub.
  const previousItems = useMemo(() => {
    if (!isParent) return [];
    const eligibleById = new Map(allItems.map(i => [i.id, i]));
    const out = [];
    for (const [id, entry] of Object.entries(dismissals)) {
      const base = eligibleById.get(id);
      if (base) {
        out.push({ ...base, dismissedAt: entry.dismissedAt });
      } else {
        // Not in current eligible list — keep a minimal historical row.
        out.push({
          id,
          icon: AlertTriangle,
          iconBg: 'bg-muted',
          iconFg: 'text-muted-foreground',
          label: 'Obavijest',
          sublabel: '',
          to: '/Inbox',
          dismissedAt: entry.dismissedAt,
        });
      }
    }
    out.sort((a, b) => Date.parse(b.dismissedAt || 0) - Date.parse(a.dismissedAt || 0));
    return out;
  }, [isParent, allItems, dismissals]);

  const dismiss = useCallback(
    (id) => {
      if (!enabled || !id) return;
      dismissNotification(user.email, id);
      setDismissals(prev => ({ ...prev, [id]: { dismissedAt: new Date().toISOString() } }));
    },
    [enabled, user?.email]
  );

  const dismissAll = useCallback(() => {
    if (!enabled) return;
    const ids = items.map(i => i.id);
    if (ids.length === 0) return;
    dismissNotifications(user.email, ids);
    const now = new Date().toISOString();
    setDismissals(prev => {
      const next = { ...prev };
      for (const id of ids) next[id] = { dismissedAt: now };
      return next;
    });
  }, [enabled, items, user?.email]);

  const isLoading = enabled && (reportsQ.isLoading || completedQ.isLoading || reviewsQ.isLoading || declinedQ.isLoading);

  return {
    items,
    count: items.length,
    previousItems,
    isLoading,
    dismiss,
    dismissAll,
    refetch,
  };
}