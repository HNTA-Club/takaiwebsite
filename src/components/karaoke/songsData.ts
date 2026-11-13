import { fetchSheetRows } from "../../lib/sheets";

// Published TSV of the TaKAi karaoke sheet, columns B–D: artist, song, source.
const KARAOKE_SHEET_URL =
  "https://docs.google.com/spreadsheets/u/0/d/e/2PACX-1vTFHxMlqkQW-aVmnz8IcB1w6glfoY0WNsu-EtIlCPBNzEK38UfJAwWJGHAmQErX9zcQdwL8XLyrr7FI/pub?output=tsv&range=B1:D";

const KARAOKE_COLUMNS = ["artist", "song", "source"] as const;

export type KaraokeSong = Record<(typeof KARAOKE_COLUMNS)[number], string>;

export function fetchKaraokeSongs(): Promise<KaraokeSong[]> {
  return fetchSheetRows(KARAOKE_SHEET_URL, KARAOKE_COLUMNS);
}
