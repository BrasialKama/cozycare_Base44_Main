import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function parseTimeToMinutes(t) {
  if (!t) return null;
  const s = String(t).replace(/\s/g, '');
  const m12 = s.match(/^(\d{1,2}):(\d{2})(AM|PM)$/i);
  if (m12) {
    let h = parseInt(m12[1], 10);
    const mi = parseInt(m12[2], 10);
    if (/pm/i.test(m12[3]) && h !== 12) h += 12;
    if (/am/i.test(m12[3]) && h === 12) h = 0;
    return h * 60 + mi;
  }
  const m24 = s.match(/^(\d{1,2}):(\d{2})$/);
  if (m24) {
    const h = parseInt(m24[1], 10);
    const mi = parseInt(m24[2], 10);
    if (h < 0 || h > 23 || mi < 0 || mi > 59) return null;
    return h * 60 + mi;
  }
  return null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const isParent = user.role === 'parent' || user.app_role === 'parent';
    const isAdmin = user.role === 'admin' || user.app_role === 'admin';
    if (!isParent && !isAdmin) {
      return Response.json({ error: 'Samo roditelji i administratori mogu kreirati rezervacije.' }, { status: 403 });
    }

    const body = await req.json();
    const bookingData = body?.booking;
    if (!bookingData || typeof bookingData !== 'object') {
      return Response.json({ error: 'booking required' }, { status: 400 });
    }
    if (!bookingData.nanny_id) {
      return Response.json({ error: 'nanny_id required' }, { status: 400 });
    }

    let nannyProfile;
    try {
      nannyProfile = await base44.asServiceRole.entities.NannyProfile.get(bookingData.nanny_id);
    } catch (_) {
      return Response.json({ error: 'Dadilja nije pronađena.' }, { status: 404 });
    }
    if (!nannyProfile) return Response.json({ error: 'Dadilja nije pronađena.' }, { status: 404 });
    if (nannyProfile.status !== 'approved' || !nannyProfile.is_active) {
      return Response.json({ error: 'Ova dadilja trenutno nije dostupna za rezervacije.' }, { status: 403 });
    }

    const startMin = parseTimeToMinutes(bookingData.start_time);
    const endMin = parseTimeToMinutes(bookingData.end_time);
    if (startMin === null || endMin === null || endMin <= startMin) {
      return Response.json({ error: 'Neispravno vrijeme početka ili završetka.' }, { status: 400 });
    }
    const durationHours = +((endMin - startMin) / 60).toFixed(2);
    if (durationHours <= 0 || durationHours > 24) {
      return Response.json({ error: 'Trajanje mora biti između 0 i 24 sata.' }, { status: 400 });
    }

    const hourlyRate = Number(nannyProfile.hourly_rate) || 0;
    if (hourlyRate <= 0) {
      return Response.json({ error: 'Dadilja nema postavljenu satnicu.' }, { status: 400 });
    }

    // Server-authoritative overwrites — whatever the client sent is discarded
    bookingData.nanny_id = nannyProfile.id;
    bookingData.nanny_user_email = nannyProfile.user_email;
    bookingData.nanny_name = nannyProfile.display_name
      || ((nannyProfile.first_name || '') + ' ' + ((nannyProfile.last_name || '').charAt(0) || '')).trim() + '.';
    bookingData.duration_hours = durationHours;
    bookingData.total_price = +(durationHours * hourlyRate).toFixed(2);

    if (!isAdmin) {
      bookingData.family_user_email = user.email;
    } else if (!bookingData.family_user_email) {
      bookingData.family_user_email = user.email;
    }

    bookingData.status = 'Na \u010dekanju';

    const childrenCount = Number(bookingData.children_count);
    bookingData.children_count = Number.isFinite(childrenCount)
      ? Math.max(1, Math.min(10, Math.round(childrenCount)))
      : 1;

    const created = await base44.asServiceRole.entities.Booking.create(bookingData);
    return Response.json({ success: true, booking: created });
  } catch (err) {
    console.error('createBooking error:', err?.message, err?.stack);
    return Response.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
});