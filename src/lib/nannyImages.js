/**
 * Curated fallback images for the CozyCare nanny platform.
 * All images are warm, trustworthy, feminine-leaning, family-safe.
 *
 * Usage:
 *   import { getNannyImage, getNannyBackgroundImage } from '@/lib/nannyImages';
 *   const src = getNannyImage(nanny);           // profile photo or curated fallback
 *   const bg  = getNannyBackgroundImage(nanny);  // lifestyle background for cards
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

// ── Background / lifestyle fallbacks (2 curated images) ──
const BACKGROUND_FALLBACKS = [
  'https://media.base44.com/images/public/69b94f7a37d2e3ed888df054/7d09d0182_generated_image.png',
  'https://media.base44.com/images/public/69b94f7a37d2e3ed888df054/6f7e754dd_generated_image.png',
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
 * Derive a stable key from a nanny-like object. Works with both
 * PublicNannyProfile and NannyProfile shapes.
 */
function stableKey(nanny) {
  return nanny?.id || nanny?.nanny_profile_id || nanny?.user_email || nanny?.display_name || 'default';
}

/**
 * Returns the nanny's real profile photo if one exists,
 * otherwise a deterministic curated fallback portrait.
 */
export function getNannyImage(nanny) {
  const realPhoto = nanny?.profile_photo_url || nanny?.photo_url;
  if (realPhoto) return realPhoto;
  const idx = hashString(stableKey(nanny)) % PORTRAIT_FALLBACKS.length;
  return PORTRAIT_FALLBACKS[idx];
}

/**
 * Returns true when the nanny has a real uploaded photo.
 */
export function hasRealPhoto(nanny) {
  return !!(nanny?.profile_photo_url || nanny?.photo_url);
}

/**
 * Returns a deterministic curated lifestyle background image for cards / hero areas.
 */
export function getNannyBackgroundImage(nanny) {
  const idx = hashString(stableKey(nanny)) % BACKGROUND_FALLBACKS.length;
  return BACKGROUND_FALLBACKS[idx];
}