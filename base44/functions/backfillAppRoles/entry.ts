import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// One-time backfill: give every existing user an app_role based on what
// data they have. Admins stay admins. Users with a NannyProfile become 'nanny'.
// Everyone else (presumably parents who got stuck on role='user') become 'parent'.
// Idempotent — running it twice is safe; users who already have app_role are skipped.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const caller = await base44.auth.me();
    if (!caller) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const isAdmin = caller.role === 'admin' || caller.app_role === 'admin';
    if (!isAdmin) {
      return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });
    }

    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 1000);
    const allNannyProfiles = await base44.asServiceRole.entities.NannyProfile.list('-created_date', 1000);
    const nannyEmails = new Set(
      allNannyProfiles
        .map(p => String(p.user_email || '').toLowerCase())
        .filter(Boolean)
    );

    const summary = { total: allUsers.length, set_admin: 0, set_nanny: 0, set_parent: 0, skipped: 0 };

    for (const u of allUsers) {
      if (u.app_role) {
        summary.skipped += 1;
        continue;
      }
      let assigned;
      if (u.role === 'admin') {
        assigned = 'admin';
        summary.set_admin += 1;
      } else if (u.email && nannyEmails.has(String(u.email).toLowerCase())) {
        assigned = 'nanny';
        summary.set_nanny += 1;
      } else {
        assigned = 'parent';
        summary.set_parent += 1;
      }
      await base44.asServiceRole.entities.User.update(u.id, { app_role: assigned });
    }

    return Response.json({ success: true, summary });
  } catch (err) {
    console.error('backfillAppRoles error:', err?.message);
    return Response.json({ error: err?.message }, { status: 500 });
  }
});