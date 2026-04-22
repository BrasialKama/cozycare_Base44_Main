import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Temporary RLS probe — attempts RlsTest.create as the authenticated caller
// (NOT service role) so the RLS create rule is actually evaluated.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const attempts = [];

    try {
      const rec = await base44.entities.RlsTest.create({ note: 'probe-' + Date.now() });
      attempts.push({ variant: 'caller_create', success: true, record_id: rec.id });
    } catch (err) {
      attempts.push({
        variant: 'caller_create',
        success: false,
        error: err?.message || String(err),
        status: err?.status,
        response_data: err?.response?.data,
      });
    }

    return Response.json({
      caller: {
        id: user.id,
        email: user.email,
        role: user.role,
        app_role: user.app_role,
        data_app_role: user.data?.app_role,
      },
      attempts,
    });
  } catch (err) {
    return Response.json({ error: err?.message, stack: err?.stack }, { status: 500 });
  }
});