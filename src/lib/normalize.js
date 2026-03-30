const DIACRITIC_MAP = {
  'č': 'c', 'ć': 'c', 'š': 's', 'ž': 'z', 'đ': 'd',
  'Č': 'c', 'Ć': 'c', 'Š': 's', 'Ž': 'z', 'Đ': 'd',
};

/**
 * Normalize a string for diacritic-insensitive, case-insensitive comparison.
 * Strips Croatian diacritics and lowercases.
 */
export function normalize(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[čćšžđČĆŠŽĐ]/g, ch => DIACRITIC_MAP[ch] || ch);
}