import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { format, parseISO } from 'date-fns';
import { hr } from 'date-fns/locale';
import { AlertTriangle, Star, Search } from 'lucide-react';

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
 * Returns { items, count, refetch }.
 * For non-parent roles (nanny / admin), returns empty items + count 0.
 * Mirrors the shape of useUnreadMessages — same focus/refetch lifecycle.
 */
export default function useNotifications() {
  const { user, effectiveRole } = useAuth();
  const isParent = effectiveRole === 'parent';
  const enabled = isParent && !!user?.email;

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

  const refetch = () => {
    if (!enabled) return;
    reportsQ.refetch();
    completedQ.refetch();
    reviewsQ.refetch();
    declinedQ.refetch();
  };

  useEffect(() => {
    if (!enabled) return undefined;
    const onFocus = () => refetch();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const items = useMemo(() => {
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

  const isLoading = enabled && (reportsQ.isLoading || completedQ.isLoading || reviewsQ.isLoading || declinedQ.isLoading);

  return {
    items,
    count: items.length,
    isLoading,
    refetch,
  };
}