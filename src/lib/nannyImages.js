/**
 * Curated fallback images for the CozyCare nanny platform.
 * All images are warm, trustworthy, feminine-leaning, family-safe.
 *
 * Usage:
 *   import { getNannyImage, getNannyOwnImage, getNannyBackgroundImage } from '@/lib/nannyImages';
 *   getNannyImage(nanny)             — always returns a curated fallback portrait (for public-facing views)
 *   getNannyOwnImage(nanny)          — returns real uploaded photo if available, else fallback (for own-profile editing)
 *   getNannyBackgroundImage(nanny)   — cycles through 10 curated lifestyle backgrounds, deterministic per nanny
 */

// ── Portrait fallbacks (6 curated images) ──
const PORTRAIT_FALLBACKS = [
  'https://media.base44.com/images/public/69b94f7a37d2e3ed888df054/37692affc_generated_image.png',
  'https://media.base44.com/images/public/69b94f7a37d2e3ed888df054/1e1e84a3b_generated_image.png',
  'https://media.base44.com/images/public/69b94f7a37d2e3ed888df054/d9bbd1353_generated_image.png',
  'https://media.base44.com/images/public/69b94f7a37d2e3ed888df054/032c14337_generated_image.png',
  'https://media.base44.com/images/public/69b94f7a37d2e3ed888df054/196e79491_generated_image.png',
  'https://media.base44.com/images/public/69b94f7a37d2e3ed888df054/ab377bb97_generated_image.png',
];

// ── Card background fallbacks (10 curated lifestyle scenes, no people) ──
// These render under an 84% white overlay on cards, so each scene is soft,
// airy, and low-contrast. Cycled deterministically per nanny via stableKey.
const CARD_BACKGROUND_FALLBACKS = [
  'https://media.base44.com/images/public/69b94f7a37d2e3ed888df054/8199557f0_generated_image.png',
  'https://media.base44.com/images/public/69b94f7a37d2e3ed888df054/e694c8fb9_generated_image.png',
  'https://media.base44.com/images/public/69b94f7a37d2e3ed888df054/c9cf2de70_generated_image.png',
  'https://media.base44.com/images/public/69b94f7a37d2e3ed888df054/4039352c4_generated_image.png',
  'https://media.base44.com/images/public/69b94f7a37d2e3ed888df054/1e99edb02_generated_image.png',
  'https://media.base44.com/images/public/69b94f7a37d2e3ed888df054/8d1bedb94_generated_image.png',
  'https://media.base44.com/images/public/69b94f7a37d2e3ed888df054/0bd3707b8_generated_image.png',
  'https://media.base44.com/images/public/69b94f7a37d2e3ed888df054/24ae07863_generated_image.png',
  'https://media.base44.com/images/public/69b94f7a37d2e3ed888df054/7e4848c91_generated_image.png',
  'https://media.base44.com/images/public/69b94f7a37d2e3ed888df054/6bb0515b9_generated_image.png',
];

/**
 * Simple deterministic hash from a string → positive integer.
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Canonical stable key: always prefer nanny_profile_id so the same nanny
 * gets the same fallback whether viewed through PublicNannyProfile or NannyProfile.
 */
function stableKey(nanny) {
  return nanny?.nanny_profile_id || nanny?.user_email || nanny?.display_name || nanny?.id || 'default';
}

/**
 * Public-facing image — returns the real uploaded photo if available,
 * otherwise falls back to a deterministic curated stock portrait so the UI
 * never shows a broken/blank avatar.
 *
 * Used on browse cards, detail pages, booking pages, and home featured.
 * It is critical for a child-safety platform that parents see the actual
 * nanny — stock photos are only acceptable as a temporary placeholder
 * before a real photo is uploaded.
 */
export function getNannyImage(nanny) {
  const realPhoto = nanny?.profile_photo_url || nanny?.photo_url;
  if (realPhoto) return realPhoto;
  const idx = hashString(stableKey(nanny)) % PORTRAIT_FALLBACKS.length;
  return PORTRAIT_FALLBACKS[idx];
}

/**
 * Own-profile image — same logic as getNannyImage. Kept as a separate
 * export so the editing page's intent is clear at the call site.
 */
export function getNannyOwnImage(nanny) {
  return getNannyImage(nanny);
}

/**
 * Returns true when the nanny has a real uploaded photo.
 */
export function hasRealPhoto(nanny) {
  return !!(nanny?.profile_photo_url || nanny?.photo_url);
}

/**
 * Returns a curated lifestyle background image for the nanny card.
 * Cycles deterministically through CARD_BACKGROUND_FALLBACKS based on the
 * nanny's stable key, so the same nanny always gets the same background but
 * the gallery view feels visually varied.
 */
export function getNannyBackgroundImage(nanny) {
  const idx = hashString(stableKey(nanny)) % CARD_BACKGROUND_FALLBACKS.length;
  return CARD_BACKGROUND_FALLBACKS[idx];
}