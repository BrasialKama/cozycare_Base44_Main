import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Booking creation is gated behind this function because Base44 RLS user_condition
// does not reliably match custom role values (parent/nanny). Caller must be a
// parent or admin. Minimum validation here — richer validation (server-computed
// price, nanny status, status transitions) lives in resolveNannyForBooking and
// future hardening prompts.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isParent = user.role === 'parent' || user.app_role === 'parent';
    const isAdmin = user.role === 'admin' || user.app_role === 'admin';
    if (!isParent && !isAdmin) {
      return Response.json(
        { error: 'Samo roditelji i administratori mogu kreirati rezervacije.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const bookingData = body?.booking;
    if (!bookingData || typeof bookingData !== 'object') {
      return Response.json({ error: 'booking required' }, { status: 400 });
    }

    // Pin family_user_email to the caller unless caller is admin explicitly passing a different email
    if (!isAdmin) {
      bookingData.family_user_email = user.email;
    } else if (!bookingData.family_user_email) {
      bookingData.family_user_email = user.email;
    }

    // Initial status must always be 'Na čekanju' — prevents bookings being created pre-completed
    bookingData.status = 'Na \u010dekanju';

    const created = await base44.asServiceRole.entities.Booking.create(bookingData);

    return Response.json({ success: true, booking: created });
  } catch (err) {
    console.error('createBooking error:', err?.message, err?.stack);
    return Response.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
});