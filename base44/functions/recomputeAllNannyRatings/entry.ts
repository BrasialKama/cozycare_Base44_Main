import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// ONE-SHOT admin-only backfill. Iterates every NannyProfile, recomputes
// rating + review_count from authoritative Review records, and mirrors
// the result to PublicNannyProfile. Delete this function after a single run.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const isAdmin = user.role === 'admin' || user.app_role === 'admin';
    if (!isAdmin) return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const profiles = await base44.asServiceRole.entities.NannyProfile.list('-created_date', 500);
    const results = [];

    for (const profile of profiles || []) {
      try {
        const reviews = await base44.asServiceRole.entities.Review.filter(
          { nanny_profile_id: profile.id },
          '-created_date',
          500
        );
        const ratings = (reviews || [])
          .map(r => Number(r.rating))
          .filter(n => Number.isFinite(n) && n > 0);
        const reviewCount = ratings.length;
        const avgRating = reviewCount > 0
          ? +(ratings.reduce((a, b) => a + b, 0) / reviewCount).toFixed(2)
          : 0;

        const before = { rating: profile.rating || 0, review_count: profile.review_count || 0 };
        const after = { rating: avgRating, review_count: reviewCount };
        const changed = before.rating !== after.rating || before.review_count !== after.review_count;

        await base44.asServiceRole.entities.NannyProfile.update(profile.id, after);

        const publicProfiles = await base44.asServiceRole.entities.PublicNannyProfile.filter(
          { nanny_profile_id: profile.id },
          '-created_date',
          1
        );
        let publicUpdated = false;
        if (publicProfiles && publicProfiles[0]) {
          await base44.asServiceRole.entities.PublicNannyProfile.update(publicProfiles[0].id, after);
          publicUpdated = true;
        }

        results.push({
          id: profile.id,
          display_name: profile.display_name,
          before,
          after,
          changed,
          public_updated: publicUpdated,
        });
      } catch (err) {
        results.push({ id: profile.id, error: err?.message });
      }
    }

    const changedCount = results.filter(r => r.changed).length;
    return Response.json({
      success: true,
      total_profiles: results.length,
      changed_count: changedCount,
      results,
    });
  } catch (err) {
    console.error('recomputeAllNannyRatings error:', err?.message, err?.stack);
    return Response.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
});