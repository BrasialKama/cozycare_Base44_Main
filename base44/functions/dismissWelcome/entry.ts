import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Marks the caller's welcome_seen flag to true. Idempotent.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await base44.asServiceRole.entities.User.update(user.id, { welcome_seen: true });
    return Response.json({ success: true });
  } catch (err) {
    console.error('dismissWelcome error:', err?.message, err?.stack);
    return Response.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
});