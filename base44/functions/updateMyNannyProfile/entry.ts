import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Fields that nannies are allowed to edit on their own profile.
// Anything not in this list (status, is_active, is_featured, badges, rating,
// review_count, total_bookings, user_email, id_document_url) is admin-only.
const NANNY_EDITABLE_FIELDS = new Set([
  'first_name',
  'last_name',
  'display_name',
  'photo_url',
  'bio',
  'location',
  'service_area',
  'hourly_rate',
  'years_experience',
  'education',
  'specialties',
  'languages',
  'availability',
  'age_groups',
  'certifications',
  'video_url',
  'intro_video_url',
  'emergency_contact',
]);

function clampNumber(n, min, max) {
  const v = Number(n);
  if (!Number.isFinite(v)) return null;
  return Math.max(min, Math.min(max, v));
}

function sanitizeString(s, maxLen) {
  if (s == null) return '';
  return String(s).slice(0, maxLen);
}

function sanitizeStringArray(arr, maxItems, maxItemLen) {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter(x => typeof x === 'string')
    .map(x => x.trim().slice(0, maxItemLen))
    .filter(Boolean)
    .slice(0, maxItems);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { nanny_profile_id, updates } = body || {};

    if (!nanny_profile_id || typeof nanny_profile_id !== 'string') {
      return Response.json({ error: 'nanny_profile_id required' }, { status: 400 });
    }
    if (!updates || typeof updates !== 'object') {
      return Response.json({ error: 'updates required' }, { status: 400 });
    }

    // Load profile via service role (RLS now blocks non-admin reads of other nannies)
    let profile;
    try {
      profile = await base44.asServiceRole.entities.NannyProfile.get(nanny_profile_id);
    } catch (_) {
      return Response.json({ error: 'Profil nije pronađen.' }, { status: 404 });
    }
    if (!profile) {
      return Response.json({ error: 'Profil nije pronađen.' }, { status: 404 });
    }

    // Authorization: caller must be the owner OR an admin
    const isOwner = profile.user_email && profile.user_email.toLowerCase() === String(user.email || '').toLowerCase();
    const isAdmin = user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return Response.json({ error: 'Nemate dopuštenje za uređivanje ovog profila.' }, { status: 403 });
    }

    // Build the safe update payload — strip everything not in the allow-list
    const safeUpdates = {};
    for (const [key, value] of Object.entries(updates)) {
      if (!NANNY_EDITABLE_FIELDS.has(key)) continue;

      if (key === 'hourly_rate') {
        const v = clampNumber(value, 1, 200);
        if (v !== null) safeUpdates[key] = v;
      } else if (key === 'years_experience') {
        const v = clampNumber(value, 0, 80);
        if (v !== null) safeUpdates[key] = v;
      } else if (key === 'bio') {
        safeUpdates[key] = sanitizeString(value, 2000);
      } else if (
        key === 'first_name' || key === 'last_name' || key === 'display_name' ||
        key === 'location' || key === 'service_area' || key === 'education' ||
        key === 'emergency_contact'
      ) {
        safeUpdates[key] = sanitizeString(value, 200);
      } else if (key === 'photo_url' || key === 'video_url' || key === 'intro_video_url') {
        const s = sanitizeString(value, 1000);
        // Basic URL hygiene — accept only http(s) URLs
        if (!s || /^https?:\/\//i.test(s)) {
          safeUpdates[key] = s;
        }
      } else if (
        key === 'specialties' || key === 'languages' ||
        key === 'availability' || key === 'age_groups' || key === 'certifications'
      ) {
        safeUpdates[key] = sanitizeStringArray(value, 30, 100);
      }
    }

    if (Object.keys(safeUpdates).length === 0) {
      return Response.json({ error: 'Nema dopuštenih polja za ažuriranje.' }, { status: 400 });
    }

    await base44.asServiceRole.entities.NannyProfile.update(profile.id, safeUpdates);

    return Response.json({ success: true, updated_fields: Object.keys(safeUpdates) });
  } catch (error) {
    console.error('updateMyNannyProfile error:', error?.message);
    return Response.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
});