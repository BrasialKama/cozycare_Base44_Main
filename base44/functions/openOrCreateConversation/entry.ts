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

    const body = await req.json();
    const { nanny_profile_id, other_email, other_name } = body || {};

    // Two modes:
    //  1. nanny_profile_id → resolve nanny email from NannyProfile (parent → nanny flow)
    //  2. other_email      → use supplied email directly (nanny → parent flow, or anyone → anyone)
    let targetEmail;
    let targetDisplayName;

    if (nanny_profile_id) {
      let nannyProfile;
      try {
        nannyProfile = await base44.asServiceRole.entities.NannyProfile.get(nanny_profile_id);
      } catch (_) {
        return Response.json({ error: 'Nanny not found' }, { status: 404 });
      }
      if (!nannyProfile) {
        return Response.json({ error: 'Nanny not found' }, { status: 404 });
      }
      targetEmail = nannyProfile.user_email;
      if (!targetEmail) {
        return Response.json({ error: 'Nanny has no email configured' }, { status: 400 });
      }
      targetDisplayName = nannyProfile.display_name
        || `${nannyProfile.first_name || ''} ${(nannyProfile.last_name || '')[0] || ''}.`.trim();
    } else if (other_email) {
      targetEmail = other_email;
      targetDisplayName = other_name || String(other_email).split('@')[0];
    } else {
      return Response.json({ error: 'Missing nanny_profile_id or other_email' }, { status: 400 });
    }

    // Prevent messaging yourself
    if (normalizeEmail(user.email) === normalizeEmail(targetEmail)) {
      return Response.json({ error: 'Cannot message yourself' }, { status: 400 });
    }

    const conversationKey = buildConversationKey(user.email, targetEmail);

    // Check for existing conversation using service role
    const existing = await base44.asServiceRole.entities.Conversation.filter(
      { conversation_key: conversationKey },
      '-updated_date',
      1
    );

    if (existing && existing[0]) {
      return Response.json({ conversation_id: existing[0].id, conversation: existing[0] });
    }

    const callerDisplayName = user.display_name || user.full_name || (user.email ? String(user.email).split('@')[0] : 'Korisnik');

    // Create new conversation via service role
    const conv = await base44.asServiceRole.entities.Conversation.create({
      conversation_key: conversationKey,
      participant_emails: [user.email, targetEmail],
      participant_names: [callerDisplayName, targetDisplayName],
      last_message: '',
      last_message_date: new Date().toISOString(),
      hidden_for: [],
    });

    return Response.json({ conversation_id: conv.id, conversation: conv });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});