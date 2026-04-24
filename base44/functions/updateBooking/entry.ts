import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Tolerance for early-completion flagging. A nanny marking a booking "Završeno"
// more than this many minutes before the scheduled end time is considered
// suspicious and gets flagged (but not blocked).
const EARLY_COMPLETION_TOLERANCE_MIN = 15;

const BOT_EMAIL = 'bot@cozycare.hr';
const BOT_NAME = 'CozyCare Bot';

// Returns true if current UTC time is more than EARLY_COMPLETION_TOLERANCE_MIN minutes
// before the booking's scheduled end time, treating booking.date + booking.end_time
// as Europe/Zagreb local wall-clock time.
function isEarlyCompletion(booking) {
  try {
    if (!booking?.date || !booking?.end_time) return false;
    const m = String(booking.end_time).match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return false;
    const hh = parseInt(m[1], 10);
    const mm = parseInt(m[2], 10);
    const [y, mo, d] = String(booking.date).split('-').map(n => parseInt(n, 10));
    if (!y || !mo || !d) return false;

    // Determine Europe/Zagreb UTC offset for this specific date (handles DST).
    // Zagreb is UTC+1 in winter, UTC+2 in summer.
    const probe = new Date(Date.UTC(y, mo - 1, d, 12, 0, 0));
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Zagreb',
      hour: '2-digit',
      hour12: false,
    }).formatToParts(probe);
    const zagrebHour = parseInt(parts.find(p => p.type === 'hour')?.value || '12', 10);
    const offsetHours = zagrebHour - 12; // 1 in winter, 2 in summer

    // Convert booking end time (Zagreb local) to a UTC epoch ms.
    const endUtcMs = Date.UTC(y, mo - 1, d, hh - offsetHours, mm, 0);
    const nowMs = Date.now();
    const minutesBeforeEnd = (endUtcMs - nowMs) / 60000;
    return minutesBeforeEnd > EARLY_COMPLETION_TOLERANCE_MIN;
  } catch (_) {
    return false;
  }
}

// Best-effort side effect: create a Report and notify parent via bot chat.
// Never throws — a failure here must not undo the booking completion.
async function flagEarlyCompletion(base44, booking) {
  try {
    const description =
      'Dadilja je ozna\u010dila rezervaciju kao zavr\u0161enu prije dogovorenog vremena. ' +
      'Rezervacija: ' + booking.date + ' ' + booking.start_time + '\u2013' + booking.end_time + '. ' +
      'Obitelj: ' + (booking.family_display_name || booking.family_name || booking.family_user_email || 'nepoznato') + '. ' +
      'Dadilja: ' + (booking.nanny_name || booking.nanny_user_email || 'nepoznato') + '.';

    await base44.asServiceRole.entities.Report.create({
      reporter_email: BOT_EMAIL,
      reported_email: booking.nanny_user_email,
      booking_id: booking.id,
      category: 'early_completion',
      description,
      status: 'open',
    });
  } catch (err) {
    console.error('flagEarlyCompletion: Report.create failed (non-fatal):', err?.message);
  }

  // Notify parent via bot conversation — best-effort.
  try {
    const parentEmail = booking.family_user_email;
    if (!parentEmail) return;
    const conversationKey = [BOT_EMAIL.toLowerCase(), String(parentEmail).toLowerCase()].sort().join('__');
    const parentMessage =
      'Dadilja je ozna\u010dila va\u0161u rezervaciju od ' + booking.date +
      ' kao zavr\u0161enu prije dogovorenog vremena (' + booking.end_time + '). ' +
      'Ako ovo nije to\u010dno, javite nam \u2014 CozyCare tim \u0107e provjeriti.';

    const existing = await base44.asServiceRole.entities.Conversation.filter(
      { conversation_key: conversationKey },
      '-updated_date',
      1
    );

    let conv = existing?.[0];
    if (!conv) {
      conv = await base44.asServiceRole.entities.Conversation.create({
        conversation_key: conversationKey,
        participant_emails: [BOT_EMAIL, parentEmail],
        participant_names: [BOT_NAME, booking.family_display_name || booking.family_name || 'Roditelj'],
        last_message: parentMessage,
        last_message_date: new Date().toISOString(),
        hidden_for: [],
      });
    } else {
      await base44.asServiceRole.entities.Conversation.update(conv.id, {
        last_message: parentMessage,
        last_message_date: new Date().toISOString(),
        hidden_for: (conv.hidden_for || []).filter(e => e !== parentEmail),
      });
    }

    await base44.asServiceRole.entities.Message.create({
      conversation_id: String(conv.id),
      sender_email: BOT_EMAIL,
      sender_name: BOT_NAME,
      receiver_email: parentEmail,
      content: parentMessage,
      read: false,
    });
  } catch (err) {
    console.error('flagEarlyCompletion: parent notification failed (non-fatal):', err?.message);
  }
}

// Legal state transitions. key = current status, value = what each role may transition it TO.
const TRANSITIONS = {
  'Na \u010dekanju': { parent: ['Otkazano'],            nanny: ['Potvr\u0111eno', 'Odbijeno'] },
  'Potvr\u0111eno':  { parent: ['Otkazano'],            nanny: ['Zavr\u0161eno', 'Otkazano'] },
  'Otkazano':        { parent: [],                      nanny: [] },
  'Odbijeno':        { parent: [],                      nanny: [] },
  'Zavr\u0161eno':   { parent: [],                      nanny: [] },
};

// Non-status fields each role may modify. Status is handled separately via TRANSITIONS.
const FIELD_ALLOWLIST = {
  parent: [],
  nanny:  [],
  admin:  ['status', 'total_price', 'duration_hours', 'date', 'start_time', 'end_time',
           'address', 'special_notes', 'children_count', 'message', 'nanny_user_email',
           'family_user_email', 'family_display_name', 'family_name', 'nanny_name'],
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const bookingId = body?.booking_id;
    const updates = body?.updates;
    if (!bookingId || !updates || typeof updates !== 'object') {
      return Response.json({ error: 'booking_id and updates required' }, { status: 400 });
    }

    let booking;
    try {
      booking = await base44.asServiceRole.entities.Booking.get(bookingId);
    } catch (_) {
      return Response.json({ error: 'Rezervacija nije prona\u0111ena.' }, { status: 404 });
    }
    if (!booking) return Response.json({ error: 'Rezervacija nije prona\u0111ena.' }, { status: 404 });

    const isAdmin = user.role === 'admin' || user.app_role === 'admin';
    const callerEmail = String(user.email || '').toLowerCase();
    const isParent = !isAdmin && callerEmail === String(booking.family_user_email || '').toLowerCase();
    const isNanny  = !isAdmin && callerEmail === String(booking.nanny_user_email  || '').toLowerCase();

    if (!isAdmin && !isParent && !isNanny) {
      return Response.json({ error: 'Nemate pristup ovoj rezervaciji.' }, { status: 403 });
    }

    const role = isAdmin ? 'admin' : isParent ? 'parent' : 'nanny';
    const allowedFields = FIELD_ALLOWLIST[role];

    // Build filtered update: only allow-listed fields pass through. Unknown keys are silently dropped.
    const filtered = {};
    for (const k of Object.keys(updates)) {
      if (k === 'status') { filtered.status = updates.status; continue; }
      if (allowedFields.includes(k)) { filtered[k] = updates[k]; }
    }

    // Enforce legal transitions for parent/nanny. Admin is unrestricted.
    if (!isAdmin && 'status' in filtered) {
      const current = booking.status;
      const next = filtered.status;
      if (next !== current) {
        const allowed = (TRANSITIONS[current] || {})[role] || [];
        if (!allowed.includes(next)) {
          return Response.json({
            error: 'Nedozvoljena promjena statusa: ' + current + ' \u2192 ' + next,
          }, { status: 403 });
        }
      }
    }

    if (Object.keys(filtered).length === 0) {
      return Response.json({ error: 'Nema dopu\u0161tenih polja za promjenu.' }, { status: 400 });
    }

    const updated = await base44.asServiceRole.entities.Booking.update(bookingId, filtered);

    // Early-completion flagging: nanny marked Potvrđeno → Završeno before scheduled end.
    // Best-effort — never throws, never undoes the successful update.
    if (isNanny
      && booking.status === 'Potvr\u0111eno'
      && filtered.status === 'Zavr\u0161eno'
      && isEarlyCompletion(booking)) {
      await flagEarlyCompletion(base44, updated);
    }

    return Response.json({ success: true, booking: updated });
  } catch (err) {
    console.error('updateBooking error:', err?.message, err?.stack);
    return Response.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
});