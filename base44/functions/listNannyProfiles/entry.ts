import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const isAdmin = user.role === 'admin' || user.app_role === 'admin';
    if (!isAdmin) return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const profiles = await base44.asServiceRole.entities.NannyProfile.list('-created_date', 200);
    return Response.json({ profiles });
  } catch (err) {
    console.error('listNannyProfiles error:', err?.message);
    return Response.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
});