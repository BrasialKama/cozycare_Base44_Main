import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only parents should be creating bookings
    if (user.role !== 'parent' && user.role !== 'admin') {
      return Response.json({ error: 'Samo roditelji mogu kreirati rezervacije.' }, { status: 403 });
    }

    const { nanny_profile_id, public_nanny_profile_id } = await req.json();
    if (!nanny_profile_id) {
      return Response.json({ error: 'nanny_profile_id required' }, { status: 400 });
    }

    // Use service role to read private NannyProfile (RLS restricted)
    const profile = await base44.asServiceRole.entities.NannyProfile.get(nanny_profile_id);
    if (!profile) {
      return Response.json({ error: 'Dadilja nije pronađena.' }, { status: 404 });
    }

    // Validate nanny is approved and active
    if (profile.status !== 'approved') {
      return Response.json({ error: 'Ova dadilja još nije odobrena za rezervacije.' }, { status: 403 });
    }
    if (!profile.is_active) {
      return Response.json({ error: 'Ova dadilja trenutno nije dostupna za rezervacije.' }, { status: 403 });
    }

    // Cross-validate against public profile if provided
    if (public_nanny_profile_id) {
      try {
        const publicProfile = await base44.asServiceRole.entities.PublicNannyProfile.get(public_nanny_profile_id);
        if (!publicProfile || publicProfile.nanny_profile_id !== nanny_profile_id) {
          return Response.json({ error: 'Nepodudaranje profila dadilje. Pokušajte ponovo.' }, { status: 400 });
        }
        if (publicProfile.status !== 'approved' || !publicProfile.is_active) {
          return Response.json({ error: 'Profil dadilje više nije aktivan.' }, { status: 403 });
        }
      } catch (_) {
        return Response.json({ error: 'Javni profil dadilje nije pronađen.' }, { status: 404 });
      }
    }

    // Return ONLY the minimum data needed for booking creation
    return Response.json({
      nanny_id: profile.id,
      nanny_user_email: profile.user_email,
      nanny_name: profile.display_name || (profile.first_name + ' ' + (profile.last_name || '').charAt(0) + '.'),
      first_name: profile.first_name,
      hourly_rate: profile.hourly_rate,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});