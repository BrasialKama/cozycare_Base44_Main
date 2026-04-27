import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const VALID_CATEGORIES = new Set([
  'safety_concern',
  'inappropriate_behavior',
  'no_show',
  'payment_dispute',
  'other',
]);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const category = body?.category;
    const description = (body?.description || '').toString().trim();

    if (!category || !VALID_CATEGORIES.has(category)) {
      return Response.json({ error: 'Neispravna kategorija prijave.' }, { status: 400 });
    }
    if (description.length < 10) {
      return Response.json({ error: 'Molimo opišite problem u najmanje 10 znakova.' }, { status: 400 });
    }
    if (description.length > 4000) {
      return Response.json({ error: 'Opis je predugačak (max 4000 znakova).' }, { status: 400 });
    }

    const created = await base44.asServiceRole.entities.Report.create({
      reporter_email: user.email,
      category,
      description,
      status: 'open',
    });

    return Response.json({ success: true, report_id: created.id });
  } catch (err) {
    console.error('createSafetyReport error:', err?.message, err?.stack);
    return Response.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
});