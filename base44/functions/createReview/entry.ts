import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Review creation gated behind this function for the same reason as createBooking.
// Also does ownership + status validation so we don't need to trust the client.
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
        { error: 'Samo roditelji mogu ostaviti recenziju.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const reviewData = body?.review;
    if (!reviewData || typeof reviewData !== 'object') {
      return Response.json({ error: 'review required' }, { status: 400 });
    }
    if (!reviewData.booking_id) {
      return Response.json({ error: 'booking_id required' }, { status: 400 });
    }

    // Validate the booking exists, belongs to caller, and is completed
    let booking;
    try {
      booking = await base44.asServiceRole.entities.Booking.get(reviewData.booking_id);
    } catch (_) {
      return Response.json({ error: 'Rezervacija nije prona\u0111ena.' }, { status: 404 });
    }
    if (!booking) {
      return Response.json({ error: 'Rezervacija nije prona\u0111ena.' }, { status: 404 });
    }

    if (!isAdmin) {
      const callerEmail = String(user.email || '').toLowerCase();
      const bookingEmail = String(booking.family_user_email || '').toLowerCase();
      if (callerEmail !== bookingEmail) {
        return Response.json(
          { error: 'Ovu rezervaciju ne mo\u017eete recenzirati.' },
          { status: 403 }
        );
      }
    }

    if (booking.status !== 'Zavr\u0161eno') {
      return Response.json(
        { error: 'Recenzije su mogu\u0107e samo za zavr\u0161ene rezervacije.' },
        { status: 400 }
      );
    }

    // Check for existing review on this booking (one review per booking)
    const existing = await base44.asServiceRole.entities.Review.filter(
      { booking_id: reviewData.booking_id },
      '-created_date',
      1
    );
    if (existing && existing[0]) {
      return Response.json(
        { error: 'Recenzija za ovu rezervaciju ve\u0107 postoji.' },
        { status: 409 }
      );
    }

    // Pin parent_email and nanny_profile_id from the booking — don't trust client
    reviewData.parent_email = user.email;
    reviewData.nanny_profile_id = booking.nanny_id || reviewData.nanny_profile_id;
    reviewData.nanny_email = booking.nanny_user_email || reviewData.nanny_email;

    // Clamp rating to 1-5
    const clampRating = (v) => {
      const n = Number(v);
      if (!Number.isFinite(n)) return null;
      return Math.max(1, Math.min(5, Math.round(n)));
    };
    const rating = clampRating(reviewData.rating);
    if (rating === null) {
      return Response.json({ error: 'Neispravna ocjena.' }, { status: 400 });
    }
    reviewData.rating = rating;
    if (reviewData.warmth_rating != null) reviewData.warmth_rating = clampRating(reviewData.warmth_rating) || 0;
    if (reviewData.reliability_rating != null) reviewData.reliability_rating = clampRating(reviewData.reliability_rating) || 0;
    if (reviewData.communication_rating != null) reviewData.communication_rating = clampRating(reviewData.communication_rating) || 0;

    const created = await base44.asServiceRole.entities.Review.create(reviewData);

    return Response.json({ success: true, review: created });
  } catch (err) {
    console.error('createReview error:', err?.message, err?.stack);
    return Response.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
});