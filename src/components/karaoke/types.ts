export interface KaraokeSong {
  // Unique ID generated from normalized artist, song, anime, and row index
  id: string;
  // Display name of the artist or band
  artist: string;
  // Display title of the song
  song: string;
  // Name of the anime, series, or source material
  anime: string;
  // Normalized lowercase string of artist (diacritics removed; punctuation/whitespace normalized) for fast searching
  artistFold: string;
  // Normalized lowercase string of song title (diacritics removed; punctuation/whitespace normalized) for fast searching
  songFold: string;
  // Normalized lowercase string of anime source (diacritics removed; punctuation/whitespace normalized) for fast searching
  animeFold: string;
}

// Field available for sorting the song list
export type SortOption = "anime" | "song" | "artist";

// Direction of list sorting
export type SortOrder = "asc" | "desc";

// Public Google Sheets published TSV URL containing the TaKAi karaoke database
export const TAKAI_GOOGLE_SHEET_TSV_URL =
  "https://docs.google.com/spreadsheets/u/0/d/e/2PACX-1vTFHxMlqkQW-aVmnz8IcB1w6glfoY0WNsu-EtIlCPBNzEK38UfJAwWJGHAmQErX9zcQdwL8XLyrr7FI/pub?output=tsv&range=B1:D";
