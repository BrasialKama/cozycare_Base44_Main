import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// One-off admin function. Sets welcome_seen=true for every existing User whose
// field is missing or false. Prevents the welcome card from appearing to users
// who predate the feature. Safe to re-run; idempotent.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin' && user.app_role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const users = await base44.asServiceRole.entities.User.list('-created_date', 5000);
    let updated = 0;
    let skipped = 0;
    const errors = [];

    for (const u of users) {
      if (u.welcome_seen === true) {
        skipped++;
        continue;
      }
      try {
        await base44.asServiceRole.entities.User.update(u.id, { welcome_seen: true });
        updated++;
      } catch (e) {
        errors.push({ id: u.id, email: u.email, error: e?.message });
      }
    }

    return Response.json({
      success: true,
      total: users.length,
      updated,
      skipped,
      errors,
    });
  } catch (err) {
    console.error('backfillWelcomeSeen error:', err?.message, err?.stack);
    return Response.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
});