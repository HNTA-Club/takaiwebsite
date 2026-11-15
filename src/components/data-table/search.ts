const RE_DIACRITICS = /[̀-ͯ]/g;
const RE_WHITESPACE = /\s+/g;
const RE_REGEX_SPECIAL = /[.*+?^${}()|[\]\\]/g;

/** Lowercases and strips accents (é -> e). */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(RE_DIACRITICS, "")
    .replace(RE_WHITESPACE, " ")
    .trim();
}

/** Normalized search words. A row matches when it contains every one. */
export function toSearchTokens(query: string): string[] {
  return normalizeText(query).split(" ").filter(Boolean);
}

/**
 * Regex matching any word of the query, with a capture group so that
 * `text.split(regex)` puts the matches at odd indices.
 */
export function buildHighlightRegex(query: string): RegExp | null {
  const words = query
    .trim()
    .split(RE_WHITESPACE)
    .filter(Boolean)
    // Longest first, so "one piece" highlights "piece" rather than a shorter overlap.
    .sort((a, b) => b.length - a.length)
    .map((word) => word.replace(RE_REGEX_SPECIAL, "\\$&"));

  return words.length > 0 ? new RegExp(`(${words.join("|")})`, "gi") : null;
}
