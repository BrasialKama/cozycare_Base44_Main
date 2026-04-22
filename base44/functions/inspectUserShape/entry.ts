import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Temporary admin-only diagnostic — returns RAW, UNFILTERED JSON for 3 users.
// Per Part A of the diagnostic prompt: we need character-for-character output
// of both entities.User.get() AND auth.me() to resolve the data.* vs top-level
// contradiction.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const caller = await base44.auth.me();

    if (!caller) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const isAdmin = caller.role === 'admin' || caller.app_role === 'admin';
    if (!isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 });

    // Raw list of all users via service role
    const all = await base44.asServiceRole.entities.User.list();
    const byEmail = (email) => all.find((u) => u.email === email) || null;

    const adminRec  = byEmail('marko.prsa84@gmail.com');
    const parentRec = byEmail('masos37399@soppat.com');
    const nannyRec  = byEmail('tojik75422@4heats.com');

    // Also fetch via .get() by id to see if shape differs from .list()
    let adminGet = null, parentGet = null, nannyGet = null;
    try { if (adminRec)  adminGet  = await base44.asServiceRole.entities.User.get(adminRec.id); } catch (e) { adminGet  = { error: e.message }; }
    try { if (parentRec) parentGet = await base44.asServiceRole.entities.User.get(parentRec.id); } catch (e) { parentGet = { error: e.message }; }
    try { if (nannyRec)  nannyGet  = await base44.asServiceRole.entities.User.get(nannyRec.id); } catch (e) { nannyGet  = { error: e.message }; }

    return Response.json({
      // auth.me() for the CALLER (admin) — this is the exact shape the frontend sees
      auth_me_raw: caller,
      auth_me_keys: Object.keys(caller).sort(),

      // Raw entities.User.list() entries
      list_admin_raw:  adminRec,
      list_parent_raw: parentRec,
      list_nanny_raw:  nannyRec,

      // Raw entities.User.get(id) entries
      get_admin_raw:  adminGet,
      get_parent_raw: parentGet,
      get_nanny_raw:  nannyGet,
    });
  } catch (err) {
    console.error('inspectUserShape error:', err.message, err.stack);
    return Response.json({ error: err.message }, { status: 500 });
  }
});