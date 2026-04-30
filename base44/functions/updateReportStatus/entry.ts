import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const BOT_EMAIL = 'bot@cozycare.hr';
const BOT_NAME = 'CozyCare Bot';

const VALID_STATUSES = new Set(['open', 'investigating', 'resolved', 'dismissed']);

const STATUS_LABELS = {
  open: 'otvorena',
  investigating: 'u obradi',
  resolved: 'riješena',
  dismissed: 'odbačena',
};

const REPORT_CATEGORY_LABELS = {
  safety_concern: 'sigurnosni problem',
  inappropriate_behavior: 'neprimjereno ponašanje',
  no_show: 'nedolazak',
  payment_dispute: 'spor oko plaćanja',
  early_completion: 'prerani završetak',
  parent_dispute: 'prijava obitelji',
  other: 'prijava',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const isAdmin = user.role === 'admin' || user.app_role === 'admin';
    if (!isAdmin) return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json();
    const reportId = body?.report_id;
    const status = body?.status;
    if (!reportId) return Response.json({ error: 'report_id required' }, { status: 400 });
    if (!status || !VALID_STATUSES.has(status)) {
      return Response.json({ error: 'Neispravan status.' }, { status: 400 });
    }

    let report;
    try {
      report = await base44.asServiceRole.entities.Report.get(reportId);
    } catch (_) {
      return Response.json({ error: 'Prijava nije pronađena.' }, { status: 404 });
    }
    if (!report) return Response.json({ error: 'Prijava nije pronađena.' }, { status: 404 });

    const oldStatus = report.status;
    if (oldStatus === status) {
      return Response.json({ success: true, no_change: true });
    }

    await base44.asServiceRole.entities.Report.update(reportId, { status });

    const reporterEmail = report.reporter_email;
    if (reporterEmail && reporterEmail !== BOT_EMAIL) {
      try {
        const categoryLabel = REPORT_CATEGORY_LABELS[report.category] || 'prijava';
        const statusLabel = STATUS_LABELS[status] || status;
        let message = 'Status vaše prijave (' + categoryLabel + ') promijenjen je: ' + statusLabel + '.';
        if (report.admin_notes) {
          // Include admin's note as the verdict context.
          message += '\n\nNapomena tima: ' + report.admin_notes;
        }
        if (report.booking_id) {
          // Deep link so user can see the full booking + report side-by-side.
          message += '\n\nPogledajte detalje: https://cozy-care-nest.base44.app/BookingDetail?id=' + report.booking_id;
        }
        message += '\n\nAko imate dodatna pitanja, javite nam.';
        const conversationKey = [BOT_EMAIL.toLowerCase(), String(reporterEmail).toLowerCase()].sort().join('__');
        const existing = await base44.asServiceRole.entities.Conversation.filter(
          { conversation_key: conversationKey },
          '-updated_date',
          1
        );
        let conv = existing?.[0];
        if (!conv) {
          conv = await base44.asServiceRole.entities.Conversation.create({
            conversation_key: conversationKey,
            participant_emails: [BOT_EMAIL, reporterEmail],
            participant_names: [BOT_NAME, reporterEmail.split('@')[0]],
            last_message: message,
            last_message_date: new Date().toISOString(),
            hidden_for: [],
          });
        } else {
          await base44.asServiceRole.entities.Conversation.update(conv.id, {
            last_message: message,
            last_message_date: new Date().toISOString(),
            hidden_for: (conv.hidden_for || []).filter(e => e !== reporterEmail),
          });
        }
        await base44.asServiceRole.entities.Message.create({
          conversation_id: String(conv.id),
          sender_email: BOT_EMAIL,
          sender_name: BOT_NAME,
          receiver_email: reporterEmail,
          content: message,
          read: false,
        });
      } catch (err) {
        console.error('updateReportStatus: reporter notification failed (non-fatal):', err?.message);
      }
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error('updateReportStatus error:', err?.message, err?.stack);
    return Response.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
});