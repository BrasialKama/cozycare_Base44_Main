import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const role = body.role;
    if (!role || !['parent', 'nanny'].includes(role)) {
      return Response.json({ error: 'Invalid role' }, { status: 400 });
    }

    const isAdmin = user.role === 'admin' || user.app_role === 'admin';
    const currentAppRole = user.app_role;

    if (!isAdmin) {
      const isUnset = !currentAppRole || currentAppRole === 'user';
      const isIdempotent = currentAppRole === role;
      if (!isUnset && !isIdempotent) {
        return Response.json({
          error: 'Uloga je već postavljena i ne može se promijeniti. Obratite se podršci ako je potrebno.',
          current_role: currentAppRole,
        }, { status: 403 });
      }
    }

    await base44.asServiceRole.entities.User.update(user.id, { app_role: role });
    return Response.json({ success: true, app_role: role });
  } catch (err) {
    console.error('setUserRole error:', err?.message, err?.stack);
    return Response.json({ error: err?.message }, { status: 500 });
  }
});