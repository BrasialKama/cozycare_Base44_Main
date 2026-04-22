import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// One-off admin fix: re-classify users who have role='nanny' but app_role='parent'.
// These were mis-backfilled by backfillAppRoles.js because their NannyProfile
// didn't exist at backfill time. Safe to re-run — idempotent.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const isAdmin = user.role === 'admin' || user.app_role === 'admin';
    if (!isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const allUsers = await base44.asServiceRole.entities.User.list();
    const fixed = [];

    for (const u of allUsers) {
      if (u.role === 'nanny' && u.app_role !== 'nanny') {
        await base44.asServiceRole.entities.User.update(u.id, { app_role: 'nanny' });
        fixed.push({ id: u.id, email: u.email, from: u.app_role, to: 'nanny' });
      }
    }

    return Response.json({ success: true, fixed_count: fixed.length, fixed });
  } catch (err) {
    console.error('fixStuckNannyAppRoles error:', err.message, err.stack);
    return Response.json({ error: err.message }, { status: 500 });
  }
});