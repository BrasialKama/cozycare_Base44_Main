/**
 * LocalStorage-backed dismissal layer for the parent Obavijesti inbox.
 *
 * Each user gets their own bucket. Dismissed entries store the dismissal
 * timestamp so the Inbox "Prethodne" tab can show items dismissed in the
 * last 7 days, and old entries can be GC'd lazily.
 *
 * Shape: { [notificationId]: { dismissedAt: ISO string } }
 */

const KEY_PREFIX = 'cozycare:dismissedNotifications:';
const RETENTION_DAYS = 7;

function storageKey(email) {
  return `${KEY_PREFIX}${email || 'anonymous'}`;
}

function isBrowser() {
  return typeof window !== 'undefined' && !!window.localStorage;
}

export function readDismissals(email) {
  if (!isBrowser()) return {};
  try {
    const raw = window.localStorage.getItem(storageKey(email));
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeDismissals(email, map) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(storageKey(email), JSON.stringify(map));
    // Notify any other hook instances in the same tab.
    window.dispatchEvent(new CustomEvent('cozycare:notifications-changed'));
  } catch {
    /* quota or serialization — ignore */
  }
}

/** Drop entries older than RETENTION_DAYS. Returns the cleaned map. */
export function gcDismissals(map) {
  const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const out = {};
  for (const [id, entry] of Object.entries(map || {})) {
    const ts = entry?.dismissedAt ? Date.parse(entry.dismissedAt) : NaN;
    if (Number.isFinite(ts) && ts >= cutoff) out[id] = entry;
  }
  return out;
}

export function dismissNotification(email, id) {
  if (!id) return;
  const cleaned = gcDismissals(readDismissals(email));
  cleaned[id] = { dismissedAt: new Date().toISOString() };
  writeDismissals(email, cleaned);
}

export function dismissNotifications(email, ids) {
  if (!ids || ids.length === 0) return;
  const cleaned = gcDismissals(readDismissals(email));
  const now = new Date().toISOString();
  for (const id of ids) cleaned[id] = { dismissedAt: now };
  writeDismissals(email, cleaned);
}

export function restoreNotification(email, id) {
  if (!id) return;
  const cleaned = gcDismissals(readDismissals(email));
  delete cleaned[id];
  writeDismissals(email, cleaned);
}