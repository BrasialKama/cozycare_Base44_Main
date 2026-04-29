import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━ EMAIL HELPERS (MIRRORED) ━━━━━━━━━━━━━━━━━━━━━━━━━━
// Base44 functions are deployed as isolated units and cannot import shared modules.
// This block is duplicated VERBATIM in:
//   - functions/createBooking/entry.ts
//   - functions/updateBooking/entry.ts
// If you change this block in one file, you MUST apply the same change to the other.
// Keep these copies byte-for-byte identical to prevent silent behavioural drift.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const BRAND_NAME = 'CozyCare';
const SUPPORT_EMAIL = 'podrska@cozycare.hr';

function buildBookingSummary(booking) {
  const lines = [];
  if (booking?.date) {
    lines.push('Datum: ' + booking.date + (booking.start_time ? ' ' + booking.start_time + '–' + (booking.end_time || '') : ''));
  }
  if (booking?.nanny_name) lines.push('Dadilja: ' + booking.nanny_name);
  if (booking?.family_display_name || booking?.family_name) {
    lines.push('Obitelj: ' + (booking.family_display_name || booking.family_name));
  }
  if (booking?.address) lines.push('Adresa: ' + booking.address);
  if (booking?.total_price) lines.push('Iznos: €' + booking.total_price.toFixed(2));
  return lines.join('\n');
}

function emailFooter() {
  return '\n\n—\n' + BRAND_NAME + ' — pouzdana obiteljska skrb\n' +
    'Pitanja? Pišite nam na ' + SUPPORT_EMAIL + '.\n' +
    'Ovu poruku primate jer koristite CozyCare. Upravljanje obavijestima dostupno je u postavkama računa.';
}

async function safeSendEmail(base44, { to, subject, body }) {
  if (!to || !subject || !body) {
    console.error('safeSendEmail: missing required field', { hasTo: !!to, hasSubject: !!subject, hasBody: !!body });
    return { sent: false, reason: 'missing_field' };
  }
  try {
    await base44.integrations.Core.SendEmail({ to, subject, body, from_name: BRAND_NAME });
    return { sent: true };
  } catch (err) {
    console.error('safeSendEmail: send failed (non-fatal):', err?.message);
    return { sent: false, reason: err?.message || 'send_error' };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━ END MIRRORED HELPERS ━━━━━━━━━━━━━━━━━━━━━━

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
    bookingData.status_history = [{
      status: 'Na \u010dekanju',
      at: new Date().toISOString(),
      by_email: user.email,
      by_role: 'parent',
    }];

    const childrenCount = Number(bookingData.children_count);
    bookingData.children_count = Number.isFinite(childrenCount)
      ? Math.max(1, Math.min(10, Math.round(childrenCount)))
      : 1;

    const created = await base44.asServiceRole.entities.Booking.create(bookingData);

    // Best-effort email to nanny about the new request.
    // Non-blocking — a mail failure must not fail the booking.
    try {
      const nannySubject = 'Nova rezervacija — ' + (bookingData.family_display_name || bookingData.family_name || 'obitelj');
      const nannyBody =
        'Pozdrav' + (nannyProfile.first_name ? ' ' + nannyProfile.first_name : '') + ',\n\n' +
        'Imate novu rezervaciju koja čeka vaš odgovor:\n\n' +
        buildBookingSummary(created) + '\n\n' +
        (created.message ? 'Poruka obitelji:\n"' + created.message + '"\n\n' : '') +
        'Prijavite se u CozyCare kako biste potvrdili ili odbili rezervaciju.' +
        emailFooter();
      await safeSendEmail(base44, {
        to: nannyProfile.user_email,
        subject: nannySubject,
        body: nannyBody,
      });
    } catch (mailErr) {
      console.error('createBooking: nanny notification email failed (non-fatal):', mailErr?.message);
    }

    return Response.json({ success: true, booking: created });
  } catch (err) {
    console.error('createBooking error:', err?.message, err?.stack);
    return Response.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
});