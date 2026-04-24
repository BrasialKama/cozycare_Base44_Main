import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

/**
 * TEMPORARY diagnostic page — runs the six security regression tests
 * (from the security-hardening batch) as the logged-in user and displays
 * the raw response of each. Delete this file and its route after verification.
 *
 * Access: navigate to /SecurityTests while logged in as a parent account
 * (e.g. masos37399@soppat.com). Click the "Run all tests" button.
 */
export default function SecurityTests() {
  const { user } = useAuth();
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);
  const [bookingId, setBookingId] = useState('');

  const runAll = async () => {
    setRunning(true);
    const out = {};

    // Find an approved nanny to use for test 8
    let testNannyId = null;
    let testNannyRate = null;
    try {
      const nannies = await base44.entities.PublicNannyProfile.filter(
        { status: 'approved', is_active: true },
        '-created_date',
        1
      );
      if (nannies && nannies[0]) {
        testNannyId = nannies[0].nanny_profile_id;
        testNannyRate = nannies[0].hourly_rate;
      }
    } catch (err) {
      out.setup_error = 'Could not fetch a test nanny: ' + (err?.message || err);
    }

    // ─ TEST 8 — createBooking price tampering ─
    try {
      const resp = await base44.functions.invoke('createBooking', {
        booking: {
          nanny_id: testNannyId,
          date: '2026-08-15',
          start_time: '10:00',
          end_time: '14:00',
          total_price: 0.01,  // CLIENT TRIES TO PAY 1 CENT
          family_name: 'SecurityTest',
          family_display_name: 'SecurityTest',
          address: 'Test adresa 1',
          children_count: 1,
        },
      });
      const data = resp?.data || resp;
      const expectedPrice = testNannyRate ? (4 * testNannyRate) : null;
      out.test8_price_tampering = {
        test: 'createBooking with total_price: 0.01',
        expected: 'booking.total_price equals ' + (expectedPrice ? '€' + expectedPrice : '4 × hourly_rate'),
        actual_total_price: data?.booking?.total_price,
        pass: data?.booking?.total_price === expectedPrice,
        full_response: data,
      };
      // Clean up: cancel the test booking if it was created
      if (data?.booking?.id) {
        try {
          await base44.functions.invoke('updateBooking', {
            booking_id: data.booking.id,
            updates: { status: 'Otkazano' },
          });
        } catch (_) { /* cleanup best-effort */ }
      }
    } catch (err) {
      out.test8_price_tampering = { test: 'createBooking price tampering', error: err?.message || String(err), full_error: err };
    }

    // ─ TEST 9 — setUserRole role-flip ─
    try {
      const resp = await base44.functions.invoke('setUserRole', { role: 'nanny' });
      const data = resp?.data || resp;
      out.test9_role_flip = {
        test: 'setUserRole({role: "nanny"}) as existing parent',
        expected: 'error containing "Uloga je već postavljena", status ~403',
        actual: data,
        pass: (data?.error || '').includes('postavljena'),
      };
    } catch (err) {
      // err.response?.data might hold the 403 body
      const body = err?.response?.data || err?.data || { error: err?.message };
      out.test9_role_flip = {
        test: 'setUserRole({role: "nanny"}) as existing parent',
        expected: 'error containing "Uloga je već postavljena"',
        actual: body,
        pass: (body?.error || '').includes('postavljena'),
        status: err?.status || err?.response?.status,
      };
    }

    // ─ TEST 10 — listNannyProfiles blocks non-admin ─
    try {
      const resp = await base44.functions.invoke('listNannyProfiles', {});
      const data = resp?.data || resp;
      out.test10_list_nanny_profiles = {
        test: 'listNannyProfiles as non-admin',
        expected: '403 Forbidden',
        actual: data,
        pass: (data?.error || '').includes('Forbidden'),
      };
    } catch (err) {
      const body = err?.response?.data || err?.data || { error: err?.message };
      out.test10_list_nanny_profiles = {
        test: 'listNannyProfiles as non-admin',
        expected: '403 Forbidden',
        actual: body,
        pass: (body?.error || '').includes('Forbidden') || err?.status === 403 || err?.response?.status === 403,
        status: err?.status || err?.response?.status,
      };
    }

    // ─ TEST 11 — seedPublicNannies blocks non-admin ─
    try {
      const resp = await base44.functions.invoke('seedPublicNannies', {});
      const data = resp?.data || resp;
      out.test11_seed_nannies = {
        test: 'seedPublicNannies as non-admin',
        expected: '403 Forbidden',
        actual: data,
        pass: (data?.error || '').includes('Forbidden'),
      };
    } catch (err) {
      const body = err?.response?.data || err?.data || { error: err?.message };
      out.test11_seed_nannies = {
        test: 'seedPublicNannies as non-admin',
        expected: '403 Forbidden',
        actual: body,
        pass: (body?.error || '').includes('Forbidden') || err?.status === 403 || err?.response?.status === 403,
        status: err?.status || err?.response?.status,
      };
    }

    // ─ TEST 12 — updateBooking silently drops parent-forbidden fields ─
    // Use the booking_id the user entered in the text field.
    if (bookingId) {
      try {
        const before = await base44.entities.Booking.get(bookingId);
        const priceBefore = before?.total_price;

        const resp = await base44.functions.invoke('updateBooking', {
          booking_id: bookingId,
          updates: { total_price: 0.01, special_notes: 'should also be dropped' },
        });
        const data = resp?.data || resp;

        const after = await base44.entities.Booking.get(bookingId);
        const priceAfter = after?.total_price;

        out.test12_field_allowlist = {
          test: 'updateBooking with total_price + special_notes (both parent-forbidden, no status)',
          expected: '400 "Nema dopuštenih polja za promjenu." AND total_price unchanged',
          actual_response: data,
          price_before: priceBefore,
          price_after: priceAfter,
          price_unchanged: priceBefore === priceAfter,
          pass: priceBefore === priceAfter && (data?.error || '').includes('Nema dopu'),
        };
      } catch (err) {
        const body = err?.response?.data || err?.data || { error: err?.message };
        try {
          const after = await base44.entities.Booking.get(bookingId);
          out.test12_field_allowlist = {
            test: 'updateBooking forbidden-fields',
            expected: '400 error, total_price unchanged',
            actual_error: body,
            price_after: after?.total_price,
            pass: (body?.error || '').includes('Nema dopu'),
            status: err?.status || err?.response?.status,
          };
        } catch (_) {
          out.test12_field_allowlist = { test: 'updateBooking forbidden-fields', actual_error: body, status: err?.status };
        }
      }

      // ─ TEST 13 — updateBooking illegal status transition ─
      try {
        const resp = await base44.functions.invoke('updateBooking', {
          booking_id: bookingId,
          updates: { status: 'Završeno' },
        });
        const data = resp?.data || resp;
        out.test13_illegal_transition = {
          test: 'updateBooking status: Završeno as parent',
          expected: 'error containing "Nedozvoljena promjena statusa"',
          actual: data,
          pass: (data?.error || '').includes('Nedozvoljena'),
        };
      } catch (err) {
        const body = err?.response?.data || err?.data || { error: err?.message };
        out.test13_illegal_transition = {
          test: 'updateBooking status: Završeno as parent',
          expected: 'error containing "Nedozvoljena promjena statusa"',
          actual: body,
          pass: (body?.error || '').includes('Nedozvoljena'),
          status: err?.status || err?.response?.status,
        };
      }
    } else {
      out.test12_field_allowlist = { skipped: 'no booking_id provided' };
      out.test13_illegal_transition = { skipped: 'no booking_id provided' };
    }

    setResults(out);
    setRunning(false);
  };

  const allPassed = results && Object.values(results).every(r => r?.pass === true || r?.skipped);
  const anyFailed = results && Object.values(results).some(r => r?.pass === false);

  return (
    <div style={{ padding: 24, fontFamily: 'monospace', fontSize: 13, lineHeight: 1.5 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Security Tests (temporary)</h1>
      <p style={{ marginBottom: 16 }}>
        Logged in as: <strong>{user?.email}</strong> ({user?.app_role || user?.role || 'no role'})
      </p>

      <div style={{ background: '#fffbe6', padding: 12, border: '1px solid #e6c200', borderRadius: 8, marginBottom: 16 }}>
        <strong>Important:</strong> Run this page logged in as a parent account (e.g. masos37399@soppat.com), NOT as admin. Admin users will bypass all the role checks and every test will "pass" but tell us nothing about non-admin behavior.
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>
          Booking ID (needed for tests 12 & 13 — must be a booking you own):
        </label>
        <input
          type="text"
          value={bookingId}
          onChange={(e) => setBookingId(e.target.value)}
          placeholder="e.g. 680a1b2c..."
          style={{ width: 400, padding: 8, fontFamily: 'monospace', fontSize: 13, border: '1px solid #ccc', borderRadius: 4 }}
        />
        <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
          Tip: open /MyBookings in another tab, pick any booking, copy its id from the URL or inspect element. Leave blank to skip tests 12 &amp; 13.
        </div>
      </div>

      <button
        onClick={runAll}
        disabled={running}
        style={{ padding: '10px 20px', fontSize: 14, fontWeight: 600, background: running ? '#999' : '#c77777', color: 'white', border: 'none', borderRadius: 6, cursor: running ? 'default' : 'pointer' }}
      >
        {running ? 'Running…' : 'Run all tests'}
      </button>

      {results && (
        <div style={{ marginTop: 24 }}>
          {allPassed && (
            <div style={{ background: '#e6ffe6', padding: 12, border: '1px solid #2a2', borderRadius: 6, marginBottom: 16 }}>
              <strong>✓ All tests passed</strong>
            </div>
          )}
          {anyFailed && (
            <div style={{ background: '#ffe6e6', padding: 12, border: '1px solid #c22', borderRadius: 6, marginBottom: 16 }}>
              <strong>✗ One or more tests failed — review below</strong>
            </div>
          )}

          {Object.entries(results).map(([key, result]) => (
            <section key={key} style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
                {result?.pass === true && '✓ '}
                {result?.pass === false && '✗ '}
                {result?.skipped && '— '}
                {key}
              </h2>
              <pre style={{ background: '#f6f6f6', padding: 12, border: '1px solid #ddd', borderRadius: 4, overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
{JSON.stringify(result, null, 2)}
              </pre>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}