import React, { useState, useEffect, useMemo } from "react";
import { Search, X, ChevronDown } from "lucide-react";

/* ==========================================================================
   TYPES & CONSTANTS
   ========================================================================== */

export interface KaraokeSong {
  id: string;
  artist: string;
  song: string;
  anime: string;
  category?: string;
  isNew?: boolean;
  artistFold: string;
  songFold: string;
  animeFold: string;
}

export type SortOption = "anime" | "song" | "artist";

export const HNTA_GOOGLE_SHEET_TSV_URL =
  "https://docs.google.com/spreadsheets/u/0/d/e/2PACX-1vTFHxMlqkQW-aVmnz8IcB1w6glfoY0WNsu-EtIlCPBNzEK38UfJAwWJGHAmQErX9zcQdwL8XLyrr7FI/pub?output=tsv&range=B1:D";

/* ==========================================================================
   UTILITIES & PARSERS
   ========================================================================== */

export function foldText(str: string): string {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[?!:.\-—_,'"()\[\]\s]/g, "");
}

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

    const id = `${foldText(artist)}_${foldText(song)}_${foldText(anime)}_${i}`;

    songs.push({
      id,
      artist,
      song,
      anime,
      artistFold: foldText(artist),
      songFold: foldText(song),
      animeFold: foldText(anime),
    });
  }

  return songs;
}

export async function fetchHNTAKaraokeSongs(
  url = HNTA_GOOGLE_SHEET_TSV_URL
): Promise<KaraokeSong[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch song list: ${response.statusText}`);
  }
  const text = await response.text();
  return parseTSVData(text);
}

/* ==========================================================================
   REACT COMPONENTS
   ========================================================================== */

/* Search Toolbar Component */
interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortOption: SortOption;
  onSortOptionChange: (sort: SortOption) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  sortOption,
  onSortOptionChange,
}) => {
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Search input field */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by artist, song, or anime..."
            className="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-8 text-sm outline-none focus:border-brand-pink dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Sort Option Selector */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-medium text-gray-500 dark:text-slate-400">
            Sort by:
          </span>
          {(["anime", "song", "artist"] as SortOption[]).map((option) => (
            <button
              key={option}
              onClick={() => onSortOptionChange(option)}
              className={`rounded border px-2.5 py-1 text-xs font-medium transition-colors ${
                sortOption === option
                  ? "border-brand-pink bg-brand-pink font-semibold text-white shadow-sm dark:border-brand-pink dark:bg-brand-pink"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              {option === "anime" ? "Anime" : option === "song" ? "Song" : "Artist"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* Horizontal Song Table / Mobile Cards Component */
interface SongTableProps {
  songs: KaraokeSong[];
  sortOption: SortOption;
  onSortOptionChange: (sort: SortOption) => void;
  searchQuery?: string;
}

const SongTable: React.FC<SongTableProps> = ({
  songs,
  sortOption,
  onSortOptionChange,
  searchQuery = "",
}) => {
  const highlightMatch = (text: string) => {
    if (!searchQuery.trim() || !text) return text || "";
    const rawTokens = searchQuery
      .trim()
      .split(/\s+/)
      .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .filter(Boolean);

    if (rawTokens.length === 0) return text;

    const regex = new RegExp(`(${rawTokens.join("|")})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark
          key={i}
          className="rounded bg-search-highlight-bg px-0.5 font-semibold text-search-highlight-text dark:bg-search-highlight-dark-bg dark:text-search-highlight-dark-text"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div>
      {/* Desktop & Tablet Table View (hidden on mobile < 640px) */}
      <div className="hidden w-full overflow-x-auto rounded-lg border border-gray-200 shadow-sm dark:border-slate-800 sm:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wider text-gray-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th
                scope="col"
                onClick={() => onSortOptionChange("artist")}
                className="cursor-pointer px-4 py-3 font-semibold hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                <div className="flex items-center gap-1">
                  <span>Artist</span>
                  {sortOption === "artist" && <ChevronDown className="h-3.5 w-3.5 text-brand-pink dark:text-brand-pink-dark" />}
                </div>
              </th>
              <th
                scope="col"
                onClick={() => onSortOptionChange("song")}
                className="cursor-pointer px-4 py-3 font-semibold hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                <div className="flex items-center gap-1">
                  <span>Song Title</span>
                  {sortOption === "song" && <ChevronDown className="h-3.5 w-3.5 text-brand-pink dark:text-brand-pink-dark" />}
                </div>
              </th>
              <th
                scope="col"
                onClick={() => onSortOptionChange("anime")}
                className="cursor-pointer px-4 py-3 font-semibold hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                <div className="flex items-center gap-1">
                  <span>Anime / Source</span>
                  {sortOption === "anime" && <ChevronDown className="h-3.5 w-3.5 text-brand-pink dark:text-brand-pink-dark" />}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white dark:divide-slate-800/60 dark:bg-slate-950">
            {songs.map((song) => (
              <tr
                key={song.id}
                className="transition-colors hover:bg-gray-50 dark:hover:bg-slate-900/60"
              >
                <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-slate-200">
                  {highlightMatch(song.artist)}
                </td>
                <td className="px-4 py-2.5 font-semibold text-brand-pink dark:text-brand-pink-dark">
                  {highlightMatch(song.song)}
                </td>
                <td className="px-4 py-2.5 text-gray-600 dark:text-slate-400">
                  {highlightMatch(song.anime || "—")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Card View (visible only on mobile < 640px) */}
      <div className="block space-y-2.5 sm:hidden">
        {songs.map((song) => (
          <div
            key={song.id}
            className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-colors hover:bg-gray-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/80"
          >
            <div className="mb-1">
              <span className="inline-block rounded border border-brand-purple-bg bg-brand-purple-bg px-1.5 py-0.5 text-[11px] font-semibold text-brand-purple-text dark:border-brand-purple-dark-border dark:bg-brand-purple-dark-bg dark:text-brand-purple-dark-text">
                {highlightMatch(song.anime || "Original / Special")}
              </span>
            </div>
            <h4 className="text-sm font-bold text-brand-pink dark:text-brand-pink-dark">
              {highlightMatch(song.song)}
            </h4>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
              {highlightMatch(song.artist)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ==========================================================================
   MAIN EXPORT COMPONENT
   ========================================================================== */

export const KaraokeApp: React.FC = () => {
  const [allSongs, setAllSongs] = useState<KaraokeSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("anime");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const songs = await fetchHNTAKaraokeSongs();
        setAllSongs(songs);
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load karaoke database from Google Sheets.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredSongs = useMemo(() => {
    let list = allSongs;

    const tokens = searchQuery
      .trim()
      .split(/\s+/)
      .map((t) => foldText(t))
      .filter(Boolean);

    if (tokens.length > 0) {
      list = list.filter((s) =>
        tokens.every(
          (token) =>
            s.songFold.includes(token) ||
            s.animeFold.includes(token) ||
            s.artistFold.includes(token)
        )
      );
    }

    const sorted = [...list].sort((a, b) => {
      let valA = "";
      let valB = "";
      if (sortOption === "anime") {
        valA = a.anime || "ZZZ";
        valB = b.anime || "ZZZ";
      } else if (sortOption === "song") {
        valA = a.song || "ZZZ";
        valB = b.song || "ZZZ";
      } else if (sortOption === "artist") {
        valA = a.artist || "ZZZ";
        valB = b.artist || "ZZZ";
      }
      return valA.localeCompare(valB, undefined, { sensitivity: "base" });
    });

    return sorted;
  }, [allSongs, searchQuery, sortOption]);

  return (
    <div className="w-full font-sans">
      <div className="mb-3 flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
        <span>
          Showing <strong>{filteredSongs.length}</strong> of <strong>{allSongs.length}</strong> songs
        </span>
      </div>

      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortOption={sortOption}
        onSortOptionChange={setSortOption}
      />

      <main className="w-full">
        {loading ? (
          <div className="py-16 text-center text-gray-500 dark:text-slate-400">
            <p className="text-sm font-semibold">Loading song database...</p>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            <p>{error}</p>
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="py-16 text-center text-gray-500 dark:text-slate-400">
            <p className="text-sm font-semibold">No matching songs found</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-2 text-xs font-semibold text-brand-pink underline dark:text-brand-pink-dark"
              >
                Reset Search
              </button>
            )}
          </div>
        ) : (
          <SongTable
            songs={filteredSongs}
            sortOption={sortOption}
            onSortOptionChange={setSortOption}
            searchQuery={searchQuery}
          />
        )}
      </main>
    </div>
  );
};

export default KaraokeApp;
