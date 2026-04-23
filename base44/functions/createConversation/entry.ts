import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Gates Conversation creation. Caller must be a participant in the conversation
// (their email must be in participant_emails).
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const convData = body?.conversation;
    if (!convData || typeof convData !== 'object') {
      return Response.json({ error: 'conversation required' }, { status: 400 });
    }
    if (!Array.isArray(convData.participant_emails) || convData.participant_emails.length < 2) {
      return Response.json({ error: 'participant_emails must contain at least 2 emails' }, { status: 400 });
    }

    const isAdmin = user.role === 'admin' || user.app_role === 'admin';
    const callerEmail = String(user.email || '').toLowerCase();
    const participantEmails = convData.participant_emails.map(e => String(e || '').toLowerCase());
    const callerIsParticipant = participantEmails.includes(callerEmail);

    if (!isAdmin && !callerIsParticipant) {
      return Response.json(
        { error: 'Mo\u017eete kreirati samo razgovore u kojima sudjelujete.' },
        { status: 403 }
      );
    }

    const created = await base44.asServiceRole.entities.Conversation.create(convData);

    return Response.json({ success: true, conversation: created });
  } catch (err) {
    console.error('createConversation error:', err?.message, err?.stack);
    return Response.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
});