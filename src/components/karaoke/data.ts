import { type KaraokeSong, TAKAI_GOOGLE_SHEET_TSV_URL } from "./types";

/**
 * Normalizes input text for fuzzy searching.
 * Converts to lowercase, strips accents/diacritics (e.g. 'é' -> 'e'), replaces punctuation with spaces, and normalizes whitespace.
 */
export function normalizeText(str: string): string {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[?!:.\-—_,'"()\[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Parses raw TSV (Tab-Separated Values) string from Google Sheets into structured KaraokeSong objects.
 * Skips empty rows and pre-computes normalized search strings for fast filtering.
 */
export function parseTSVData(tsvText: string): KaraokeSong[] {
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

    const id = `${normalizeText(artist)}_${normalizeText(song)}_${normalizeText(anime)}_${i}`;

    songs.push({
      id,
      artist,
      song,
      anime,
      artistFold: normalizeText(artist),
      songFold: normalizeText(song),
      animeFold: normalizeText(anime),
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
