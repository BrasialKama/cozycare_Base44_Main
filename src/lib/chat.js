export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function buildConversationKey(emailA, emailB) {
  return [normalizeEmail(emailA), normalizeEmail(emailB)].sort().join('__');
}