import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const BOT_EMAIL = 'bot@cozycare.hr';

// Returns a single booking plus all related data the caller is allowed to see.
// One round trip, server-side authorization (we don't trust RLS to scope reports
// or messages perfectly across the role matrix).
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const bookingId = body?.booking_id;
    if (!bookingId) return Response.json({ error: 'booking_id required' }, { status: 400 });

    let booking;
    try {
      booking = await base44.asServiceRole.entities.Booking.get(bookingId);
    } catch (_) {
      return Response.json({ error: 'Rezervacija nije pronađena.' }, { status: 404 });
    }
    if (!booking) return Response.json({ error: 'Rezervacija nije pronađena.' }, { status: 404 });

    const callerEmail = String(user.email || '').toLowerCase();
    const familyEmail = String(booking.family_user_email || '').toLowerCase();
    const nannyEmail = String(booking.nanny_user_email || '').toLowerCase();
    const isAdmin = user.role === 'admin' || user.app_role === 'admin';
    const isFamily = callerEmail === familyEmail;
    const isNanny = callerEmail === nannyEmail;

    if (!isAdmin && !isFamily && !isNanny) {
      return Response.json({ error: 'Nemate pristup ovoj rezervaciji.' }, { status: 403 });
    }

    // Determine viewer role for the frontend layout
    const viewerRole = isAdmin ? 'admin' : (isFamily ? 'parent' : 'nanny');

    // Conversation between parent and nanny on this booking — keyed by emails
    let conversation = null;
    let messagesPreview = [];
    try {
      const convKey = [familyEmail, nannyEmail].sort().join('__');
      const convs = await base44.asServiceRole.entities.Conversation.filter({ conversation_key: convKey }, '-updated_date', 1);
      conversation = convs?.[0] || null;
      if (conversation) {
        // Last 5 messages as a preview
        const msgs = await base44.asServiceRole.entities.Message.filter({ conversation_id: String(conversation.id) }, '-created_date', 5);
        messagesPreview = (msgs || []).slice().reverse(); // chronological for display
      }
    } catch (e) {
      console.error('getBookingDetail: conversation fetch failed (non-fatal):', e?.message);
    }

    // Related reports — what the caller may see depends on role
    let reports = [];
    try {
      const all = await base44.asServiceRole.entities.Report.filter({ booking_id: bookingId }, '-created_date', 50);
      if (isAdmin) {
        reports = all || [];
      } else if (isFamily) {
        // Parents see reports they filed on this booking, plus auto early-completion reports about it
        reports = (all || []).filter(r =>
          r.reporter_email === user.email
          || r.category === 'early_completion'
        );
      } else {
        // Nannies do not see report content directly (admin handles it, may forward)
        reports = [];
      }
    } catch (e) {
      console.error('getBookingDetail: reports fetch failed (non-fatal):', e?.message);
    }

    // Review for this booking, if any
    let review = null;
    try {
      const reviews = await base44.asServiceRole.entities.Review.filter({ booking_id: bookingId }, '-created_date', 1);
      review = reviews?.[0] || null;
    } catch (e) {
      console.error('getBookingDetail: review fetch failed (non-fatal):', e?.message);
    }

    return Response.json({
      success: true,
      viewer_role: viewerRole,
      booking,
      conversation,
      messages_preview: messagesPreview,
      reports,
      review,
    });
  } catch (err) {
    console.error('getBookingDetail error:', err?.message, err?.stack);
    return Response.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
});