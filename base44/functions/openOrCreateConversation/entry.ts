import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function buildConversationKey(emailA, emailB) {
  return [normalizeEmail(emailA), normalizeEmail(emailB)].sort().join('__');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { nanny_profile_id } = await req.json();
    if (!nanny_profile_id) {
      return Response.json({ error: 'Missing nanny_profile_id' }, { status: 400 });
    }

    // Load the private NannyProfile via service role — caller never sees the email
    let nannyProfile;
    try {
      nannyProfile = await base44.asServiceRole.entities.NannyProfile.get(nanny_profile_id);
    } catch (_) {
      return Response.json({ error: 'Nanny not found' }, { status: 404 });
    }
    if (!nannyProfile) {
      return Response.json({ error: 'Nanny not found' }, { status: 404 });
    }

    const nannyEmail = nannyProfile.user_email;
    if (!nannyEmail) {
      return Response.json({ error: 'Nanny has no email configured' }, { status: 400 });
    }

    // Prevent messaging yourself
    if (normalizeEmail(user.email) === normalizeEmail(nannyEmail)) {
      return Response.json({ error: 'Cannot message yourself' }, { status: 400 });
    }

    const conversationKey = buildConversationKey(user.email, nannyEmail);

    // Check for existing conversation using service role
    const existing = await base44.asServiceRole.entities.Conversation.filter(
      { conversation_key: conversationKey },
      '-updated_date',
      1
    );

    if (existing && existing[0]) {
      return Response.json({ conversation_id: existing[0].id });
    }

    // Build display name for the nanny
    const nannyDisplayName = nannyProfile.display_name
      || `${nannyProfile.first_name || ''} ${(nannyProfile.last_name || '')[0] || ''}.`.trim();

    // Create new conversation via service role
    const conv = await base44.asServiceRole.entities.Conversation.create({
      conversation_key: conversationKey,
      participant_emails: [user.email, nannyEmail],
      participant_names: [user.full_name || user.email, nannyDisplayName],
      last_message: '',
      last_message_date: new Date().toISOString(),
      hidden_for: [],
    });

    return Response.json({ conversation_id: conv.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});