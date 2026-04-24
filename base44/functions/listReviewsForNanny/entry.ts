import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Public endpoint — returns PII-scrubbed reviews for a nanny.
// Callable unauthenticated so nanny profile pages render to browsing visitors.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const nannyProfileId = body?.nanny_profile_id;
    if (!nannyProfileId) {
      return Response.json({ error: 'nanny_profile_id required' }, { status: 400 });
    }

    const reviews = await base44.asServiceRole.entities.Review.filter(
      { nanny_profile_id: nannyProfileId },
      '-created_date',
      50
    );

    const scrubbed = (reviews || []).map(r => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      warmth_rating: r.warmth_rating,
      reliability_rating: r.reliability_rating,
      communication_rating: r.communication_rating,
      parent_name: r.parent_name || 'Obitelj',
      created_date: r.created_date,
    }));

    return Response.json({ reviews: scrubbed });
  } catch (err) {
    console.error('listReviewsForNanny error:', err?.message);
    return Response.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
});