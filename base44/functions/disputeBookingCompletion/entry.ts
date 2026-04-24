import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const DISPUTE_WINDOW_DAYS = 7;

// Valid dispute subcategories the parent may select from.
const VALID_SUBCATEGORIES = new Set([
  'left_early',
  'inappropriate_care',
  'no_show',
  'safety_concern',
  'other',
]);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const bookingId = body?.booking_id;
    const subcategory = body?.subcategory;
    const description = (body?.description || '').toString().trim();

    if (!bookingId) return Response.json({ error: 'booking_id required' }, { status: 400 });
    if (!subcategory || !VALID_SUBCATEGORIES.has(subcategory)) {
      return Response.json({ error: 'Neispravna kategorija prijave.' }, { status: 400 });
    }
    if (description.length < 10) {
      return Response.json({ error: 'Molimo opišite problem u najmanje 10 znakova.' }, { status: 400 });
    }
    if (description.length > 2000) {
      return Response.json({ error: 'Opis je predugačak (max 2000 znakova).' }, { status: 400 });
    }

    // Load booking via service role
    let booking;
    try {
      booking = await base44.asServiceRole.entities.Booking.get(bookingId);
    } catch (_) {
      return Response.json({ error: 'Rezervacija nije pronađena.' }, { status: 404 });
    }
    if (!booking) return Response.json({ error: 'Rezervacija nije pronađena.' }, { status: 404 });

    // Caller must be the family on this booking
    const callerEmail = String(user.email || '').toLowerCase();
    const familyEmail = String(booking.family_user_email || '').toLowerCase();
    if (callerEmail !== familyEmail) {
      return Response.json({ error: 'Ovu rezervaciju ne možete prijaviti.' }, { status: 403 });
    }

    // Must be a completed booking
    if (booking.status !== 'Završeno') {
      return Response.json({ error: 'Prijava je moguća samo za završene rezervacije.' }, { status: 400 });
    }

    // Must be within the dispute window (counted from booking date, not completion time)
    if (!booking.date) {
      return Response.json({ error: 'Rezervacija nema datum.' }, { status: 400 });
    }
    const bookingDateMs = Date.parse(booking.date);
    if (!Number.isFinite(bookingDateMs)) {
      return Response.json({ error: 'Neispravan datum rezervacije.' }, { status: 400 });
    }
    const ageDays = (Date.now() - bookingDateMs) / (1000 * 60 * 60 * 24);
    if (ageDays > DISPUTE_WINDOW_DAYS) {
      return Response.json({
        error: 'Prozor za prijavu je prošao. Prijave su moguće unutar ' + DISPUTE_WINDOW_DAYS + ' dana od završetka rezervacije. Obratite se podršci.',
      }, { status: 403 });
    }

    // No duplicate disputes
    if (booking.disputed === true) {
      return Response.json({ error: 'Prijava za ovu rezervaciju već postoji.' }, { status: 409 });
    }

    // Create the Report
    const subcategoryLabels = {
      left_early: 'Otišla prije dogovorenog vremena',
      inappropriate_care: 'Neprikladna skrb',
      no_show: 'Nije se pojavila',
      safety_concern: 'Sigurnosni problem',
      other: 'Ostalo',
    };
    const fullDescription =
      '[' + (subcategoryLabels[subcategory] || subcategory) + '] ' +
      description +
      '\n\nRezervacija: ' + booking.date + ' ' + (booking.start_time || '') + '–' + (booking.end_time || '') +
      '\nObitelj: ' + (booking.family_display_name || booking.family_name || booking.family_user_email || 'nepoznato') +
      '\nDadilja: ' + (booking.nanny_name || booking.nanny_user_email || 'nepoznato');

    await base44.asServiceRole.entities.Report.create({
      reporter_email: user.email,
      reported_email: booking.nanny_user_email,
      booking_id: booking.id,
      category: 'parent_dispute',
      description: fullDescription,
      status: 'open',
    });

    // Denormalize flag onto the booking
    await base44.asServiceRole.entities.Booking.update(booking.id, {
      disputed: true,
      dispute_reported_at: new Date().toISOString(),
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error('disputeBookingCompletion error:', err?.message, err?.stack);
    return Response.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
});