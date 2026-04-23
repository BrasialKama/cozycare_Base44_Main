import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Gates NannyProfile creation. Caller must be a nanny (just-assigned role via setUserRole)
// or admin. The user_email on the profile must match the caller unless the caller is admin.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isNanny = user.role === 'nanny' || user.app_role === 'nanny';
    const isAdmin = user.role === 'admin' || user.app_role === 'admin';
    // Role 'user' accepted too — a user in transition from unset to nanny.
    const isTransitioning = user.role === 'user' || user.app_role === 'user';
    if (!isNanny && !isAdmin && !isTransitioning) {
      return Response.json(
        { error: 'Samo dadilje i administratori mogu kreirati profil dadilje.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const profileData = body?.profile;
    if (!profileData || typeof profileData !== 'object') {
      return Response.json({ error: 'profile required' }, { status: 400 });
    }

    // Pin user_email to caller unless admin is creating on behalf of another nanny
    if (!isAdmin) {
      profileData.user_email = user.email;
    } else if (!profileData.user_email) {
      profileData.user_email = user.email;
    }

    // Force safe defaults for admin-controlled fields
    profileData.status = 'pending';
    profileData.is_active = false;
    profileData.is_featured = false;
    profileData.badges = [];
    profileData.rating = 0;
    profileData.review_count = 0;
    profileData.total_bookings = 0;

    // Prevent duplicate profiles for the same user
    const existing = await base44.asServiceRole.entities.NannyProfile.filter(
      { user_email: profileData.user_email },
      '-created_date',
      1
    );
    if (existing && existing[0]) {
      return Response.json(
        { error: 'Profil dadilje za ovaj ra\u010dun ve\u0107 postoji.', existing_id: existing[0].id },
        { status: 409 }
      );
    }

    const created = await base44.asServiceRole.entities.NannyProfile.create(profileData);

    return Response.json({ success: true, profile: created });
  } catch (err) {
    console.error('createNannyProfile error:', err?.message, err?.stack);
    return Response.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
});