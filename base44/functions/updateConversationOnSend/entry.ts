import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const conversationId = body?.conversation_id;
    const lastMessage = (body?.last_message || '').toString();

    if (!conversationId) return Response.json({ error: 'conversation_id required' }, { status: 400 });

    let conv;
    try {
      conv = await base44.asServiceRole.entities.Conversation.get(conversationId);
    } catch (_) {
      return Response.json({ error: 'Conversation not found' }, { status: 404 });
    }
    if (!conv) return Response.json({ error: 'Conversation not found' }, { status: 404 });

    // Caller must be a participant
    const callerEmail = String(user.email || '').toLowerCase();
    const participants = (conv.participant_emails || []).map(e => String(e).toLowerCase());
    if (!participants.includes(callerEmail)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update last_message + last_message_date, unhide for any participants who had hidden it
    const previewLength = 200;
    await base44.asServiceRole.entities.Conversation.update(conversationId, {
      last_message: lastMessage.slice(0, previewLength),
      last_message_date: new Date().toISOString(),
      hidden_for: [],
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error('updateConversationOnSend error:', err?.message, err?.stack);
    return Response.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
});