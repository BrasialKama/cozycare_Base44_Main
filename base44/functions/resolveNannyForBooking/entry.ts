import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { nanny_profile_id } = await req.json();
    if (!nanny_profile_id) {
      return Response.json({ error: 'nanny_profile_id required' }, { status: 400 });
    }

    // Use service role to read private NannyProfile (RLS restricted)
    const profile = await base44.asServiceRole.entities.NannyProfile.get(nanny_profile_id);
    if (!profile) {
      return Response.json({ error: 'Nanny not found' }, { status: 404 });
    }

    return Response.json({
      nanny_id: profile.id,
      nanny_user_email: profile.user_email,
      nanny_name: profile.display_name || (profile.first_name + ' ' + profile.last_name),
      first_name: profile.first_name,
      last_name: profile.last_name,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});