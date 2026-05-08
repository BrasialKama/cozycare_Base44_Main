import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Returns aggregated, non-PII booking activity counts for a nanny.
 *
 * Privacy: parents cannot read other nannies' bookings via RLS. We use service
 * role to count only — never return any booking detail / PII.
 *
 * Input:  { nanny_profile_id: string }
 * Output: { success: true, confirmed_this_week, requests_last_7d }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const nannyProfileId = body?.nanny_profile_id;
    if (!nannyProfileId) {
      return Response.json({ error: 'nanny_profile_id required' }, { status: 400 });
    }

    // PublicNannyProfile doesn't expose user_email (PII).
    // Service-role lookup of the private NannyProfile to resolve the nanny's email.
    const nannyProfile = await base44.asServiceRole.entities.NannyProfile.get(nannyProfileId).catch(() => null);
    const nannyEmail = nannyProfile?.user_email;
    if (!nannyEmail) {
      // Don't leak whether the profile exists — just return zeros.
      return Response.json({ success: true, confirmed_this_week: 0, requests_last_7d: 0 });
    }

    // Rolling 7-day window
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sevenDaysAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Service role: parents don't have read access to other nannies' bookings.
    // We return ONLY aggregated counts.
    const recentBookings = await base44.asServiceRole.entities.Booking.filter(
      { nanny_user_email: nannyEmail },
      '-created_date',
      100
    );

    let confirmedThisWeek = 0;
    let requestsLast7d = 0;

    for (const b of recentBookings || []) {
      const createdAt = b.created_date ? new Date(b.created_date) : null;

      // Booking REQUESTS in last 7d (regardless of current status — measures inbound demand)
      if (createdAt && createdAt >= sevenDaysAgo) {
        requestsLast7d++;
      }

      // CONFIRMED bookings whose appointment date is within the next 7 days
      if (b.status === 'Potvrđeno' && b.date) {
        const bookingDate = new Date(b.date);
        if (bookingDate >= now && bookingDate <= sevenDaysAhead) {
          confirmedThisWeek++;
        }
      }
    }

    return Response.json({
      success: true,
      confirmed_this_week: confirmedThisWeek,
      requests_last_7d: requestsLast7d,
    });
  } catch (err) {
    console.error('getNannyActivitySignal error:', err?.message, err?.stack);
    return Response.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
});