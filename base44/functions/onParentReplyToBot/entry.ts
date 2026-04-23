import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const BOT_EMAIL = 'bot@cozycare.hr';

// Entity automation handler: Message create.
//
// If a parent replies INTO the bot conversation (receiver = bot), and there's
// an open/investigating early-completion Report for that parent, append the
// reply to the report's admin_notes so admins see it inline on AdminReports.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const data = payload?.data;

    if (!data || data.sender_email === BOT_EMAIL) {
      return Response.json({ skipped: 'not-a-parent-message' });
    }
    if (String(data.receiver_email || '').toLowerCase() !== BOT_EMAIL) {
      return Response.json({ skipped: 'not-addressed-to-bot' });
    }

    const parentEmail = data.sender_email;
    const content = String(data.content || '').trim();
    if (!content) return Response.json({ skipped: 'empty' });

    // Find the most recent open/investigating report whose associated booking
    // belongs to this parent. Scan a small window of recent reports.
    const recent = await base44.asServiceRole.entities.Report.filter(
      { reporter_email: BOT_EMAIL },
      '-created_date',
      50
    );

    let target = null;
    for (const r of recent) {
      if (!r.booking_id) continue;
      if (r.status !== 'open' && r.status !== 'investigating') continue;
      const b = await base44.asServiceRole.entities.Booking.get(r.booking_id).catch(() => null);
      if (b && String(b.family_user_email || '').toLowerCase() === String(parentEmail).toLowerCase()) {
        target = r;
        break;
      }
    }

    if (!target) return Response.json({ skipped: 'no-matching-report' });

    const stamp = new Date().toISOString();
    const prev = target.admin_notes ? target.admin_notes + '\n' : '';
    const note = '[' + stamp + '] Odgovor obitelji (' + parentEmail + '): ' + content;

    await base44.asServiceRole.entities.Report.update(target.id, {
      admin_notes: prev + note,
      status: 'investigating',
    });

    return Response.json({ success: true, report_id: target.id });
  } catch (err) {
    console.error('onParentReplyToBot error:', err?.message, err?.stack);
    return Response.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
});