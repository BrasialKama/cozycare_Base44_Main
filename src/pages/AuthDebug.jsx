import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

/**
 * TEMPORARY diagnostic page — do not link from nav.
 * Shows the raw shape of auth.me() so we can see whether custom user fields
 * (specifically app_role) come back at the top level, under data.*, or not at all.
 * Delete this file after diagnosis.
 */
export default function AuthDebug() {
  const { user: contextUser } = useAuth();
  const [rawUser, setRawUser] = useState(null);
  const [error, setError] = useState(null);
  const [keys, setKeys] = useState([]);
  const [probeResult, setProbeResult] = useState(null);
  const [probeLoading, setProbeLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        setRawUser(u);
        setKeys(Object.keys(u || {}).sort());
      } catch (err) {
        setError(err?.message || String(err));
      }
    })();
  }, []);

  const runRlsProbe = async () => {
    setProbeLoading(true);
    setProbeResult(null);
    try {
      const res = await base44.functions.invoke('rlsProbe', {});
      setProbeResult(res.data);
    } catch (err) {
      setProbeResult({ invoke_error: err?.message || String(err), response: err?.response?.data });
    } finally {
      setProbeLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: 'monospace', fontSize: 13, lineHeight: 1.5 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Auth Debug (temporary)</h1>

      {error && (
        <div style={{ background: '#fee', padding: 12, border: '1px solid #c00', marginBottom: 16 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Top-level keys returned by auth.me():</h2>
        <pre style={{ background: '#f6f6f6', padding: 12, border: '1px solid #ddd', overflowX: 'auto' }}>
{JSON.stringify(keys, null, 2)}
        </pre>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Key identity fields:</h2>
        <pre style={{ background: '#f6f6f6', padding: 12, border: '1px solid #ddd', overflowX: 'auto' }}>
{JSON.stringify({
  id: rawUser?.id,
  email: rawUser?.email,
  full_name: rawUser?.full_name,
  role: rawUser?.role,
  app_role: rawUser?.app_role,
  has_top_level_app_role: rawUser ? 'app_role' in rawUser : null,
  data_exists: rawUser ? 'data' in rawUser : null,
  data_app_role: rawUser?.data?.app_role,
  data_role: rawUser?.data?.role,
  data_keys: rawUser?.data ? Object.keys(rawUser.data).sort() : null,
}, null, 2)}
        </pre>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>AuthContext.user shape (what the app reads):</h2>
        <pre style={{ background: '#f6f6f6', padding: 12, border: '1px solid #ddd', overflowX: 'auto' }}>
{JSON.stringify({
  id: contextUser?.id,
  email: contextUser?.email,
  role: contextUser?.role,
  app_role: contextUser?.app_role,
  data_app_role: contextUser?.data?.app_role,
}, null, 2)}
        </pre>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>RLS probe (create RlsTest as caller):</h2>
        <button
          onClick={runRlsProbe}
          disabled={probeLoading}
          style={{ padding: '8px 14px', background: '#222', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', marginBottom: 8 }}
        >
          {probeLoading ? 'Running…' : 'Run rlsProbe'}
        </button>
        {probeResult && (
          <pre style={{ background: '#f6f6f6', padding: 12, border: '1px solid #ddd', overflowX: 'auto' }}>
{JSON.stringify(probeResult, null, 2)}
          </pre>
        )}
      </section>

      <section>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Full auth.me() response:</h2>
        <pre style={{ background: '#f6f6f6', padding: 12, border: '1px solid #ddd', overflowX: 'auto', maxHeight: 400 }}>
{JSON.stringify(rawUser, null, 2)}
        </pre>
      </section>
    </div>
  );
}