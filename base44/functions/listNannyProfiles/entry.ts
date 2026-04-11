import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const profiles = await base44.asServiceRole.entities.NannyProfile.filter({}, '-created_date', 10);
  return Response.json({ profiles: profiles.map(p => ({ id: p.id, display_name: p.display_name, user_email: p.user_email })) });
});