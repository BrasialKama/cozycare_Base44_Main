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
    const display_name = body.display_name;

    console.log('Setting role for user', user.id, 'to', role);

    if (!role || !['parent', 'nanny'].includes(role)) {
      return Response.json({ error: 'Invalid role' }, { status: 400 });
    }

    await base44.asServiceRole.entities.User.update(user.id, {
      role: role,
    });

    console.log('Role updated successfully');

    return Response.json({ success: true, role });
  } catch (err) {
    console.error('setUserRole error:', err.message, err.stack);
    return Response.json({ error: err.message }, { status: 500 });
  }
});