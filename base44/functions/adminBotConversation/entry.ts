import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const BOT_EMAIL = 'bot@cozycare.hr';
const BOT_NAME = 'CozyCare Bot';

// Admin helper for the "Prijave problema" page.
// action=get: returns the bot<->recipient conversation + messages for a report.
// action=send: posts a message from the admin into that thread, authored as the bot.
// recipient: 'parent' (default) or 'nanny' — determines which side of the booking to address.
// For 'send', the outgoing message is wrapped with an "issue context" block so the
// recipient sees the report summary and the admin's message together.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const isAdmin = user.role === 'admin' || user.app_role === 'admin';
    if (!isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const action = body?.action;
    const reportId = body?.report_id;
    const recipient = body?.recipient === 'nanny' ? 'nanny' : 'parent';
    if (!action || !reportId) {
      return Response.json({ error: 'action and report_id required' }, { status: 400 });
    }

    const report = await base44.asServiceRole.entities.Report.get(reportId);
    if (!report) return Response.json({ error: 'Report not found' }, { status: 404 });
    if (!report.booking_id) {
      return Response.json({ error: 'Report has no associated booking.' }, { status: 400 });
    }
    const booking = await base44.asServiceRole.entities.Booking.get(report.booking_id);
    if (!booking) {
      return Response.json({ error: 'Booking not found.' }, { status: 404 });
    }

    const otherEmail = recipient === 'nanny'
      ? booking.nanny_user_email
      : booking.family_user_email;
    const otherName = recipient === 'nanny'
      ? (booking.nanny_name || 'Dadilja')
      : (booking.family_display_name || booking.family_name || 'Obitelj');

    if (!otherEmail) {
      return Response.json({
        error: recipient === 'nanny'
          ? 'Dadilja nije dostupna za ovu rezervaciju.'
          : 'Obitelj nije dostupna za ovu rezervaciju.',
      }, { status: 404 });
    }

    const conversationKey = [BOT_EMAIL.toLowerCase(), String(otherEmail).toLowerCase()].sort().join('__');

    const existing = await base44.asServiceRole.entities.Conversation.filter(
      { conversation_key: conversationKey },
      '-updated_date',
      1
    );
    let conv = existing?.[0] || null;

    if (action === 'get') {
      if (!conv) {
        return Response.json({
          success: true,
          conversation: null,
          messages: [],
          recipient_email: otherEmail,
          recipient_name: otherName,
          recipient: recipient,
          issue_context: buildIssueContext(report, booking),
        });
      }
      const messages = await base44.asServiceRole.entities.Message.filter(
        { conversation_id: String(conv.id) },
        'created_date',
        100
      );
      return Response.json({
        success: true,
        conversation: conv,
        messages,
        recipient_email: otherEmail,
        recipient_name: otherName,
        recipient: recipient,
        issue_context: buildIssueContext(report, booking),
      });
    }

    if (action === 'send') {
      const content = (body?.content || '').toString().trim();
      if (!content) return Response.json({ error: 'Poruka je prazna.' }, { status: 400 });

      // Wrap admin message with issue context so recipient sees full picture
      const wrappedContent =
        '— Kontekst slučaja —\n' +
        buildIssueContext(report, booking) +
        '\n\n— Poruka administratora —\n' +
        content;

      if (!conv) {
        conv = await base44.asServiceRole.entities.Conversation.create({
          conversation_key: conversationKey,
          participant_emails: [BOT_EMAIL, otherEmail],
          participant_names: [BOT_NAME, otherName],
          last_message: content,
          last_message_date: new Date().toISOString(),
          hidden_for: [],
        });
      } else {
        await base44.asServiceRole.entities.Conversation.update(conv.id, {
          last_message: content,
          last_message_date: new Date().toISOString(),
          hidden_for: (conv.hidden_for || []).filter(e => e !== otherEmail),
        });
      }

      await base44.asServiceRole.entities.Message.create({
        conversation_id: String(conv.id),
        sender_email: BOT_EMAIL,
        sender_name: BOT_NAME,
        receiver_email: otherEmail,
        content: wrappedContent,
        read: false,
      });

      // Audit trail on the report itself
      const stamp = new Date().toISOString();
      const previousNotes = report.admin_notes || '';
      const auditLine = '[' + stamp + '] Odgovor administratora (' + recipient + ' — ' + otherEmail + '): ' + content;
      const newNotes = previousNotes ? previousNotes + '\n' + auditLine : auditLine;
      const updates = { admin_notes: newNotes };
      if (report.status === 'open') updates.status = 'investigating';
      await base44.asServiceRole.entities.Report.update(reportId, updates);

      return Response.json({ success: true });
    }

    return Response.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (err) {
    console.error('adminBotConversation error:', err?.message, err?.stack);
    return Response.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
});

// Builds a standardized summary block from a report + booking for recipient context.
function buildIssueContext(report, booking) {
  const categoryLabels = {
    safety_concern: 'Sigurnosni problem',
    inappropriate_behavior: 'Neprimjereno ponašanje',
    no_show: 'Nedolazak',
    payment_dispute: 'Spor oko plaćanja',
    early_completion: 'Prerani završetak',
    parent_dispute: 'Prijava obitelji',
    other: 'Ostalo',
  };
  const lines = [];
  lines.push('Tip prijave: ' + (categoryLabels[report.category] || report.category || 'nepoznato'));
  if (booking?.date) {
    lines.push('Rezervacija: ' + booking.date + ' ' + (booking.start_time || '') + '–' + (booking.end_time || ''));
  }
  if (report.description) {
    lines.push('Opis: ' + String(report.description).slice(0, 500));
  }
  return lines.join('\n');
}