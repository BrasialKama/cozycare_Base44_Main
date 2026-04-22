import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const ids = Array.isArray(body?.message_ids) ? body.message_ids : (body?.message_id ? [body.message_id] : []);
    if (ids.length === 0) {
      return Response.json({ error: 'message_ids required' }, { status: 400 });
    }
    if (ids.length > 100) {
      return Response.json({ error: 'Too many messages — max 100 per call.' }, { status: 400 });
    }

    const callerEmail = String(user.email || '').toLowerCase();
    const updated = [];
    const skipped = [];

    for (const id of ids) {
      if (typeof id !== 'string' || !id) { skipped.push({ id, reason: 'invalid_id' }); continue; }
      let msg;
      try {
        msg = await base44.asServiceRole.entities.Message.get(id);
      } catch (_) {
        skipped.push({ id, reason: 'not_found' });
        continue;
      }
      if (!msg) { skipped.push({ id, reason: 'not_found' }); continue; }

      const receiver = String(msg.receiver_email || '').toLowerCase();
      const isReceiver = receiver === callerEmail;
      const isAdmin = user.role === 'admin' || user.app_role === 'admin';
      if (!isReceiver && !isAdmin) {
        skipped.push({ id, reason: 'forbidden' });
        continue;
      }
      if (msg.read === true) {
        updated.push(id);
        continue;
      }
      await base44.asServiceRole.entities.Message.update(id, { read: true });
      updated.push(id);
    }

    return Response.json({ success: true, updated, skipped });
  } catch (error) {
    console.error('markMessageAsRead error:', error?.message);
    return Response.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
});