import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const role = body.role;

    if (!role || !['parent', 'nanny'].includes(role)) {
      return Response.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Write to the custom app_role field — NOT the built-in `role` field.
    // Base44's built-in `role` only accepts "admin" or "user" and silently
    // ignores other values. Our domain roles (parent/nanny) live on app_role.
    console.log('Setting app_role for user', user.id, 'to', role);
    await base44.asServiceRole.entities.User.update(user.id, {
      app_role: role,
    });
    console.log('app_role updated successfully');

    return Response.json({ success: true, app_role: role });
  } catch (err) {
    console.error('setUserRole error:', err.message, err.stack);
    return Response.json({ error: err.message }, { status: 500 });
  }
});