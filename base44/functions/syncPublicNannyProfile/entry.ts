import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { nanny_profile_id } = await req.json();
  if (!nanny_profile_id) {
    return Response.json({ error: 'Missing nanny_profile_id' }, { status: 400 });
  }

  // Read the private profile using service role (caller may be nanny or admin)
  const privateProfile = await base44.asServiceRole.entities.NannyProfile.get(nanny_profile_id);
  if (!privateProfile) {
    return Response.json({ error: 'NannyProfile not found' }, { status: 404 });
  }

  // Authorization: only the nanny themselves or an admin may trigger sync
  const isOwner = privateProfile.user_email === user.email;
  const isAdmin = user.role === 'admin' || user.app_role === 'admin';
  if (!isOwner && !isAdmin) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Build public-safe payload — never copy user_email, id_document_url, phone, address, admin notes
  const publicData = {
    nanny_profile_id: privateProfile.id,
    display_name: privateProfile.display_name || `${privateProfile.first_name} ${(privateProfile.last_name || '')[0] || ''}.`,
    first_name: privateProfile.first_name || '',
    last_name_initial: privateProfile.last_name ? `${privateProfile.last_name[0]}.` : '',
    headline: '',
    bio: privateProfile.bio || '',
    city: '',
    neighborhood: privateProfile.location || privateProfile.service_area || '',
    profile_photo_url: privateProfile.photo_url || '',
    intro_video_url: privateProfile.intro_video_url || '',
    hourly_rate: privateProfile.hourly_rate || 0,
    languages: privateProfile.languages || [],
    badges: privateProfile.badges || [],
    experience_years: privateProfile.years_experience || 0,
    qualifications_summary: (privateProfile.specialties || []).join(', '),
    availability_summary: (privateProfile.availability || []).join(', '),
    rating: privateProfile.rating || 0,
    review_count: privateProfile.review_count || 0,
    total_bookings: privateProfile.total_bookings || 0,
    status: privateProfile.status || 'pending',
    is_active: privateProfile.is_active === true,
    featured: privateProfile.is_featured === true,
  };

  // Upsert via service role (frontend users have no write access to PublicNannyProfile)
  const existing = await base44.asServiceRole.entities.PublicNannyProfile.filter(
    { nanny_profile_id: privateProfile.id },
    '-created_date',
    1
  );

  if (existing && existing[0]) {
    await base44.asServiceRole.entities.PublicNannyProfile.update(existing[0].id, publicData);
  } else {
    await base44.asServiceRole.entities.PublicNannyProfile.create(publicData);
  }

  return Response.json({ success: true });
});