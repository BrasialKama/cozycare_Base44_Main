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

// Best-effort side effect: notify parent via bot chat that the booking was marked
// completed early. Admins are NOT auto-notified — a Report is only created when the
// parent disputes via the dispute flow. Never throws.
async function flagEarlyCompletion(base44, booking) {

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

async function notifyOtherPartyOfStatusChange(base44, booking, oldStatus, newStatus, role) {
  let recipientEmail = null;
  let recipientName = null;
  let message = null;

  const otherPartyName = booking.nanny_name || 'dadilja';
  const familyName = booking.family_display_name || booking.family_name || 'obitelj';
  const dateLabel = booking.date + (booking.start_time ? ' ' + booking.start_time : '');

  if (newStatus === 'Odbijeno' && role === 'nanny') {
    recipientEmail = booking.family_user_email;
    recipientName = familyName;
    message = 'Vaš zahtjev za rezervaciju (' + dateLabel + ') s dadiljom ' + otherPartyName +
      ' nije prihvaćen. Možete pretražiti druge dostupne dadilje u aplikaciji.';
  } else if (newStatus === 'Otkazano' && role === 'parent') {
    recipientEmail = booking.nanny_user_email;
    recipientName = otherPartyName;
    message = 'Obitelj ' + familyName + ' je otkazala rezervaciju za ' + dateLabel + '.' +
      (oldStatus === 'Potvr\u0111eno' ? ' (Rezervacija je bila potvrđena.)' : '');
  } else if (newStatus === 'Otkazano' && role === 'nanny') {
    recipientEmail = booking.family_user_email;
    recipientName = familyName;
    message = 'Dadilja ' + otherPartyName + ' je otkazala potvrđenu rezervaciju za ' + dateLabel + '. ' +
      'Pretražite druge dostupne dadilje u aplikaciji.';
  } else {
    return;
  }

  if (!recipientEmail) return;

  try {
    const conversationKey = [BOT_EMAIL.toLowerCase(), String(recipientEmail).toLowerCase()].sort().join('__');
    const existing = await base44.asServiceRole.entities.Conversation.filter(
      { conversation_key: conversationKey },
      '-updated_date',
      1
    );
    let conv = existing?.[0];
    if (!conv) {
      conv = await base44.asServiceRole.entities.Conversation.create({
        conversation_key: conversationKey,
        participant_emails: [BOT_EMAIL, recipientEmail],
        participant_names: [BOT_NAME, recipientName],
        last_message: message,
        last_message_date: new Date().toISOString(),
        hidden_for: [],
      });
    } else {
      await base44.asServiceRole.entities.Conversation.update(conv.id, {
        last_message: message,
        last_message_date: new Date().toISOString(),
        hidden_for: (conv.hidden_for || []).filter(e => e !== recipientEmail),
      });
    }
    await base44.asServiceRole.entities.Message.create({
      conversation_id: String(conv.id),
      sender_email: BOT_EMAIL,
      sender_name: BOT_NAME,
      receiver_email: recipientEmail,
      content: message,
      read: false,
    });
  } catch (err) {
    console.error('notifyOtherPartyOfStatusChange failed (non-fatal):', err?.message);
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

    // Append to status_history if status is actually changing.
    // Done server-side so client-supplied status_history values can never be trusted.
    if (filtered.status && filtered.status !== booking.status) {
      const existingHistory = Array.isArray(booking.status_history) ? booking.status_history : [];
      filtered.status_history = [
        ...existingHistory,
        {
          status: filtered.status,
          at: new Date().toISOString(),
          by_email: user.email,
          by_role: role,
        },
      ];
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

    // Best-effort: bot notification for cancel/decline transitions.
    if (filtered.status && filtered.status !== booking.status) {
      await notifyOtherPartyOfStatusChange(base44, updated, booking.status, filtered.status, role);
    }

    // Best-effort email on meaningful status transitions.
    // Only fire when status actually changed. Recipient is the OTHER party.
    if (filtered.status && filtered.status !== booking.status) {
      try {
        const newStatus = filtered.status;
        const parentEmail = updated.family_user_email;
        const nannyEmail = updated.nanny_user_email;
        const parentName = updated.family_display_name || updated.family_name || 'obitelj';
        const nannyName = updated.nanny_name || 'dadilja';
        const summary = buildBookingSummary(updated);

        let to = null, subject = null, mailBody = null;

        if (newStatus === 'Potvr\u0111eno' && role === 'nanny') {
          to = parentEmail;
          subject = 'Rezervacija potvrđena — ' + nannyName;
          mailBody = 'Dobra vijest! Vaša rezervacija je potvrđena.\n\n' +
            summary + '\n\n' +
            nannyName + ' vas očekuje. Ako imate dodatna pitanja, možete joj poslati poruku izravno u aplikaciji.' +
            emailFooter();
        } else if (newStatus === 'Odbijeno' && role === 'nanny') {
          to = parentEmail;
          subject = 'Rezervacija nije prihvaćena — ' + nannyName;
          mailBody = 'Nažalost, ' + nannyName + ' ne može prihvatiti ovu rezervaciju.\n\n' +
            summary + '\n\n' +
            'Potražite drugu dadilju u aplikaciji — mnoge su dostupne.' +
            emailFooter();
        } else if (newStatus === 'Otkazano' && role === 'parent') {
          to = nannyEmail;
          subject = 'Rezervacija otkazana — ' + parentName;
          mailBody = parentName + ' je otkazala rezervaciju:\n\n' + summary + emailFooter();
        } else if (newStatus === 'Otkazano' && role === 'nanny') {
          to = parentEmail;
          subject = 'Rezervacija otkazana — ' + nannyName;
          mailBody = nannyName + ' je otkazala rezervaciju:\n\n' + summary + '\n\n' +
            'Možete odabrati drugu dadilju u aplikaciji.' +
            emailFooter();
        }
        // Intentionally NOT emailing on Potvrđeno → Završeno (completion) —
        // covered by in-app review prompt + bot flow.

        if (to && subject && mailBody) {
          await safeSendEmail(base44, { to, subject, body: mailBody });
        }
      } catch (mailErr) {
        console.error('updateBooking: notification email failed (non-fatal):', mailErr?.message);
      }
    }

    return Response.json({ success: true, booking: updated });
  } catch (err) {
    console.error('updateBooking error:', err?.message, err?.stack);
    return Response.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
});