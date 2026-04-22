import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Temporary admin-only diagnostic — mirror of /AuthDebug page but server-side.
// Returns the shape of auth.me() for the calling admin, plus the shape of
// entities.User.get(id) for three specific test users (parent / nanny / admin).
// Delete after diagnosis.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const isAdmin = user.role === 'admin' || user.app_role === 'admin';
    if (!isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const inspect = (label, obj) => ({
      label,
      top_level_keys: obj ? Object.keys(obj).sort() : null,
      identity: {
        id: obj?.id,
        email: obj?.email,
        full_name: obj?.full_name,
        role: obj?.role,
        app_role: obj?.app_role,
        has_top_level_app_role: obj ? 'app_role' in obj : null,
        data_exists: obj ? 'data' in obj : null,
        data_app_role: obj?.data?.app_role,
        data_role: obj?.data?.role,
        data_keys: obj?.data ? Object.keys(obj.data).sort() : null,
      },
      full: obj,
    });

    // 1. Shape of auth.me() (for the calling admin — this is what the frontend
    //    SDK's base44.auth.me() call returns).
    const authMeShape = inspect('auth.me() for calling admin', user);

    // 2. Shape of entities.User.list()/get() for the three test users.
    //    NOTE: entities.User.* returns stored records directly, which includes
    //    custom fields at the top level per entity schema. This matches what
    //    auth.me() should return for those users if they called it themselves.
    const all = await base44.asServiceRole.entities.User.list();
    const byEmail = (email) => all.find((u) => u.email === email) || null;

    const parent = inspect('User record: masos37399@soppat.com (parent)',  byEmail('masos37399@soppat.com'));
    const nanny  = inspect('User record: tojik75422@4heats.com (nanny)',    byEmail('tojik75422@4heats.com'));
    const admin  = inspect('User record: marko.prsa84@gmail.com (admin)',   byEmail('marko.prsa84@gmail.com'));

    return Response.json({
      caller: user.email,
      auth_me_shape: authMeShape,
      user_records: { parent, nanny, admin },
    });
  } catch (err) {
    console.error('inspectUserShape error:', err.message, err.stack);
    return Response.json({ error: err.message }, { status: 500 });
  }
});