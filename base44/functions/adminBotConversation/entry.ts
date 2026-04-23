import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const BOT_EMAIL = 'bot@cozycare.hr';
const BOT_NAME = 'CozyCare Bot';

// Admin-only helper for the "Prijave problema" page.
//
// Two actions:
//   - "get":  returns the bot<->parent conversation + recent messages for a given
//             report (resolved via the report's booking_id → parent email).
//   - "send": posts a message from the admin into that same bot<->parent thread,
//             authored as the bot, so the parent keeps a single continuous thread.
//
// Admin privilege is required on every call.
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
    if (!action || !reportId) {
      return Response.json({ error: 'action and report_id required' }, { status: 400 });
    }

    // Resolve report → booking → parent email
    const report = await base44.asServiceRole.entities.Report.get(reportId);
    if (!report) return Response.json({ error: 'Report not found' }, { status: 404 });
    if (!report.booking_id) {
      return Response.json({ error: 'Report has no associated booking.' }, { status: 400 });
    }
    const booking = await base44.asServiceRole.entities.Booking.get(report.booking_id);
    if (!booking?.family_user_email) {
      return Response.json({ error: 'Booking/parent not found.' }, { status: 404 });
    }

    const parentEmail = booking.family_user_email;
    const conversationKey = [BOT_EMAIL.toLowerCase(), String(parentEmail).toLowerCase()].sort().join('__');

    // Find (or create) the bot<->parent conversation.
    const existing = await base44.asServiceRole.entities.Conversation.filter(
      { conversation_key: conversationKey },
      '-updated_date',
      1
    );
    let conv = existing?.[0] || null;

    if (action === 'get') {
      if (!conv) {
        return Response.json({ success: true, conversation: null, messages: [], parent_email: parentEmail });
      }
      const messages = await base44.asServiceRole.entities.Message.filter(
        { conversation_id: String(conv.id) },
        'created_date',
        100
      );
      return Response.json({ success: true, conversation: conv, messages, parent_email: parentEmail });
    }

    if (action === 'send') {
      const content = String(body?.content || '').trim();
      if (!content) return Response.json({ error: 'Poruka ne smije biti prazna.' }, { status: 400 });

      if (!conv) {
        conv = await base44.asServiceRole.entities.Conversation.create({
          conversation_key: conversationKey,
          participant_emails: [BOT_EMAIL, parentEmail],
          participant_names: [BOT_NAME, booking.family_display_name || booking.family_name || 'Roditelj'],
          last_message: content,
          last_message_date: new Date().toISOString(),
          hidden_for: [],
        });
      } else {
        await base44.asServiceRole.entities.Conversation.update(conv.id, {
          last_message: content,
          last_message_date: new Date().toISOString(),
          hidden_for: (conv.hidden_for || []).filter(e => e !== parentEmail),
        });
      }

      const msg = await base44.asServiceRole.entities.Message.create({
        conversation_id: String(conv.id),
        sender_email: BOT_EMAIL,
        sender_name: BOT_NAME,
        receiver_email: parentEmail,
        content,
        read: false,
      });

      // Track admin activity on the report so there's an audit trail.
      try {
        const stamp = new Date().toISOString();
        const prev = report.admin_notes ? report.admin_notes + '\n' : '';
        const note = '[' + stamp + '] ' + (user.email || 'admin') + ' odgovorio obitelji: ' + content;
        await base44.asServiceRole.entities.Report.update(reportId, {
          admin_notes: prev + note,
          status: report.status === 'open' ? 'investigating' : report.status,
        });
      } catch (e) {
        console.error('adminBotConversation: admin_notes update failed (non-fatal):', e?.message);
      }

      return Response.json({ success: true, message: msg });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    console.error('adminBotConversation error:', err?.message, err?.stack);
    return Response.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
});