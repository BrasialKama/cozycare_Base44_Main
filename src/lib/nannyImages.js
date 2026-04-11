/**
 * Curated fallback images for the CozyCare nanny platform.
 * All images are warm, trustworthy, feminine-leaning, family-safe.
 *
 * Usage:
 *   import { getNannyImage, getNannyOwnImage, getNannyBackgroundImage } from '@/lib/nannyImages';
 *   getNannyImage(nanny)        — always returns a curated fallback (for public-facing views)
 *   getNannyOwnImage(nanny)     — returns real uploaded photo if available, else fallback (for own-profile editing)
 *   getNannyBackgroundImage()   — single consistent lifestyle background for cards
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

// ── Single consistent background for all cards ──
const CARD_BACKGROUND = 'https://media.base44.com/images/public/69b94f7a37d2e3ed888df054/7d09d0182_generated_image.png';

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
 * Public-facing image — always returns a deterministic curated fallback.
 * Use this on browse cards, detail pages, booking pages, etc.
 */
export function getNannyImage(nanny) {
  const idx = hashString(stableKey(nanny)) % PORTRAIT_FALLBACKS.length;
  return PORTRAIT_FALLBACKS[idx];
}

/**
 * Own-profile image — returns the real uploaded photo if available,
 * otherwise falls back to the curated portrait.
 * Use this only on the nanny's own profile editing page.
 */
export function getNannyOwnImage(nanny) {
  const realPhoto = nanny?.profile_photo_url || nanny?.photo_url;
  if (realPhoto) return realPhoto;
  return getNannyImage(nanny);
}

/**
 * Returns true when the nanny has a real uploaded photo.
 */
export function hasRealPhoto(nanny) {
  return !!(nanny?.profile_photo_url || nanny?.photo_url);
}

/**
 * Returns one consistent lifestyle background image for all cards.
 */
export function getNannyBackgroundImage() {
  return CARD_BACKGROUND;
}