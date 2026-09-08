export interface KaraokeSong {
  // Unique ID generated from normalized artist, song, anime, and row index
  id: string;
  // Display name of the artist or band
  artist: string;
  // Display title of the song
  song: string;
  // Name of the anime, series, or source material
  anime: string;
  // Normalized lowercase string combining artist, song, and anime for fast searching
  normalized: string;
}

// Public Google Sheets published TSV URL containing the TaKAi karaoke database
const TAKAI_GOOGLE_SHEET_TSV_URL =
  "https://docs.google.com/spreadsheets/u/0/d/e/2PACX-1vTFHxMlqkQW-aVmnz8IcB1w6glfoY0WNsu-EtIlCPBNzEK38UfJAwWJGHAmQErX9zcQdwL8XLyrr7FI/pub?output=tsv&range=B1:D";

// Hoisted regular expressions to avoid object allocations in hot loops (js-hoist-regexp)
const RE_DIACRITICS = /[\u0300-\u036f]/g;
const RE_PUNCTUATION = /[?!:.\-—_,'"()\[\]]/g;
const RE_WHITESPACE = /\s+/g;

/**
 * Normalizes input text for fuzzy searching.
 * Converts to lowercase, strips accents/diacritics (e.g. 'é' -> 'e'), replaces punctuation with spaces, and normalizes whitespace.
 */
export function normalizeText(str: string): string {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(RE_DIACRITICS, "")
    .replace(RE_PUNCTUATION, " ")
    .replace(RE_WHITESPACE, " ")
    .trim();
}

// Character mapping for diacritics expansion in search regex
const ACCENT_MAP: Record<string, string> = {
  a: "[aàáâãäåā]",
  e: "[eèéêëē]",
  i: "[iìíîïī]",
  o: "[oòóôõöōø]",
  u: "[uùúûüū]",
  c: "[cç]",
  n: "[nñ]",
};

/**
 * Escapes regex special characters and expands vowels into accent-insensitive character classes.
 * E.g. "pokemon" matches "Pokémon".
 */
export function escapeAndAccentPattern(str: string): string {
  return str
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/[aeioucn]/gi, (m) => ACCENT_MAP[m.toLowerCase()] || m);
}

/**
 * Parses raw TSV (Tab-Separated Values) string from Google Sheets into structured KaraokeSong objects.
 * Skips empty rows and pre-computes normalized search strings for fast filtering.
 */
function parseTSVData(tsvText: string): KaraokeSong[] {
  const lines = tsvText.replace(/\r/g, "").split("\n");
  const songs: KaraokeSong[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = line.split("\t");
    const artist = (cols[0] || "").trim();
    const song = (cols[1] || "").trim();
    const anime = (cols[2] || "").trim();

    if (!artist && !song && !anime) continue;

    const normArtist = normalizeText(artist);
    const normSong = normalizeText(song);
    const normAnime = normalizeText(anime);

    const id = `${normArtist}_${normSong}_${normAnime}_${i}`;

    songs.push({
      id,
      artist,
      song,
      anime,
      normalized: `${normArtist} ${normSong} ${normAnime}`,
    });
  }

  return songs;
}

/**
 * Fetches the karaoke song list from the club's published Google Sheet.
 */
export async function fetchTakaiKaraokeSongs(
  url = TAKAI_GOOGLE_SHEET_TSV_URL
): Promise<KaraokeSong[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch song list: ${response.statusText}`);
  }
  const text = await response.text();
  return parseTSVData(text);
}
