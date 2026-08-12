import React, { useState, useEffect, useMemo, useDeferredValue } from "react";
import { Search, X, ChevronDown, ChevronUp } from "lucide-react";

/* ==========================================================================
   TYPES & CONSTANTS
   ========================================================================== */

export interface KaraokeSong {
  id: string;
  artist: string;
  song: string;
  anime: string;
  artistFold: string;
  songFold: string;
  animeFold: string;
}

export type SortOption = "anime" | "song" | "artist";
export type SortOrder = "asc" | "desc";

export const HNTA_GOOGLE_SHEET_TSV_URL =
  "https://docs.google.com/spreadsheets/u/0/d/e/2PACX-1vTFHxMlqkQW-aVmnz8IcB1w6glfoY0WNsu-EtIlCPBNzEK38UfJAwWJGHAmQErX9zcQdwL8XLyrr7FI/pub?output=tsv&range=B1:D";

/* ==========================================================================
   UTILITIES & PARSERS
   ========================================================================== */

export function normalizeText(str: string): string {
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

interface SortableHeaderProps {
  label: string;
  field: SortOption;
  currentSortOption: SortOption;
  currentSortOrder: SortOrder;
  onSelectSort: (sort: SortOption) => void;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({
  label,
  field,
  currentSortOption,
  currentSortOrder,
  onSelectSort,
}) => (
  <div
    onClick={() => onSelectSort(field)}
    className="cursor-pointer px-4 py-3 font-semibold hover:bg-site-hover transition-colors flex items-center bg-site-toolbar-bg border-b border-site-border"
    title={`Click to sort by ${label.toLowerCase()}`}
    role="button"
    aria-label={`Sort by ${label.toLowerCase()}`}
  >
    <div className="flex items-center gap-1">
      <span>{label}</span>
      {currentSortOption === field &&
        (currentSortOrder === "asc" ? (
          <ChevronDown className="h-3.5 w-3.5 text-brand-pink" />
        ) : (
          <ChevronUp className="h-3.5 w-3.5 text-brand-pink" />
        ))}
    </div>
  </div>
);

/* Search Toolbar Component */
interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortOption: SortOption;
  sortOrder: SortOrder;
  onSelectSort: (sort: SortOption) => void;
  filteredCount: number;
  totalSongs: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  sortOption,
  sortOrder,
  onSelectSort,
  filteredCount,
  totalSongs,
}) => {
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-xl border border-site-border bg-site-toolbar-bg p-4 shadow-xs">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Search input field */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-site-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by artist, song, or anime..."
            className="w-full rounded-lg border border-site-border bg-site-card-bg py-2 pl-9 pr-8 text-sm text-site-text outline-none focus:border-brand-pink focus:ring-1 focus:ring-brand-pink"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-site-text-muted hover:text-site-text transition-colors"
              title="Clear search"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Toolbar info & mobile sort controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:justify-end">
          {/* Song stats text inside toolbar */}
          <span className="text-site-text-muted">
            Showing <strong>{filteredCount}</strong> of <strong>{totalSongs}</strong> songs
          </span>

          {/* Sort Option Selector (visible ONLY on mobile < 640px) */}
          <div className="flex items-center gap-1.5 sm:hidden">
            <span className="font-medium text-site-text-muted">
              Sort by:
            </span>
            {(["anime", "song", "artist"] as SortOption[]).map((option) => (
              <button
                key={option}
                onClick={() => onSelectSort(option)}
                className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${sortOption === option
                    ? "border-brand-pink bg-brand-pink font-semibold text-white shadow-xs"
                    : "border-site-border bg-site-card-bg text-site-text hover:bg-site-hover"
                  }`}
                aria-label={`Sort by ${option}`}
              >
                {option === "anime" ? "Anime" : option === "song" ? "Song" : "Artist"}
                {sortOption === option && (sortOrder === "asc" ? " ↓" : " ↑")}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* Horizontal Song Table / Mobile Cards Component */
interface SongTableProps {
  songs: KaraokeSong[];
  sortOption: SortOption;
  sortOrder: SortOrder;
  onSelectSort: (sort: SortOption) => void;
  searchQuery?: string;
}

const SongTable: React.FC<SongTableProps> = ({
  songs,
  sortOption,
  sortOrder,
  onSelectSort,
  searchQuery = "",
}) => {
  const highlightMatch = React.useCallback(
    (text: string) => {
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
        part.match(regex) ? (
          <mark
            key={i}
            className="rounded bg-search-highlight-bg px-0.5 font-semibold text-search-highlight-text"
          >
            {part}
          </mark>
        ) : (
          part
        )
      );
    },
    [searchQuery]
  );

  return (
    <div className="w-full rounded-xl border border-site-border bg-site-card-bg shadow-xs overflow-hidden text-sm sm:grid sm:grid-cols-3">
      {/* Desktop Header */}
      <div className="hidden sm:contents text-xs uppercase tracking-wider text-site-text-muted">
        <SortableHeader
          label="Artist"
          field="artist"
          currentSortOption={sortOption}
          currentSortOrder={sortOrder}
          onSelectSort={onSelectSort}
        />
        <SortableHeader
          label="Song Title"
          field="song"
          currentSortOption={sortOption}
          currentSortOrder={sortOrder}
          onSelectSort={onSelectSort}
        />
        <SortableHeader
          label="Anime / Source"
          field="anime"
          currentSortOption={sortOption}
          currentSortOrder={sortOrder}
          onSelectSort={onSelectSort}
        />
      </div>

      {/* Song Grid / Cards */}
      {songs.map((song) => (
        <div
          key={song.id}
          className="sm:contents flex flex-col p-3.5 border-b border-site-border-subtle last:border-b-0 hover:bg-site-hover transition-colors sm:hover:bg-transparent"
        >
          {/* Artist */}
          <div className="order-3 sm:order-none mt-0.5 sm:mt-0 text-xs sm:text-sm text-site-text-muted sm:text-site-text sm:font-medium sm:px-4 sm:py-2.5 sm:flex sm:items-center sm:border-b sm:border-site-border-subtle sm:group-hover:bg-site-hover transition-colors">
            {highlightMatch(song.artist)}
          </div>

          {/* Song Title */}
          <div className="order-2 sm:order-none text-sm font-bold sm:font-semibold text-brand-pink sm:px-4 sm:py-2.5 sm:flex sm:items-center sm:border-b sm:border-site-border-subtle sm:group-hover:bg-site-hover transition-colors">
            {highlightMatch(song.song)}
          </div>

          {/* Anime / Source */}
          <div className="order-1 sm:order-none mb-1 sm:mb-0 sm:px-4 sm:py-2.5 sm:flex sm:items-center sm:text-site-text-muted sm:border-b sm:border-site-border-subtle sm:group-hover:bg-site-hover transition-colors">
            <span className="sm:hidden inline-block rounded-md border border-brand-purple-border bg-brand-purple-bg px-2 py-0.5 text-[11px] font-semibold text-brand-purple-text">
              {highlightMatch(song.anime || "Original / Special")}
            </span>
            <span className="hidden sm:inline">
              {highlightMatch(song.anime || "—")}
            </span>
          </div>
        </div>
      ))}
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
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [sortOption, setSortOption] = useState<SortOption>("anime");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const handleSelectSort = React.useCallback((option: SortOption) => {
    if (sortOption === option) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortOption(option);
      setSortOrder("asc");
    }
  }, [sortOption]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const songs = await fetchHNTAKaraokeSongs();
        setAllSongs(songs);
        setError(null);
      } catch (err: unknown) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(`Failed to load karaoke database from Google Sheets: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredSongs = useMemo(() => {
    let list = allSongs;

    const tokens = deferredSearchQuery
      .trim()
      .split(/\s+/)
      .map((t) => normalizeText(t))
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

      const cmp = valA.localeCompare(valB, undefined, { sensitivity: "base" });
      return sortOrder === "desc" ? -cmp : cmp;
    });

    return sorted;
  }, [allSongs, deferredSearchQuery, sortOption, sortOrder]);

  return (
    <div className="w-full font-sans">
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortOption={sortOption}
        sortOrder={sortOrder}
        onSelectSort={handleSelectSort}
        filteredCount={filteredSongs.length}
        totalSongs={allSongs.length}
      />

      <main className="w-full">
        {loading ? (
          <div className="py-16 text-center text-site-text-muted">
            <p className="text-sm font-semibold">Loading song database...</p>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
            <p>{error}</p>
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="py-16 text-center text-site-text-muted">
            <p className="text-sm font-semibold">No matching songs found</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-2 text-xs font-semibold text-brand-pink underline"
              >
                Reset Search
              </button>
            )}
          </div>
        ) : (
          <SongTable
            songs={filteredSongs}
            sortOption={sortOption}
            sortOrder={sortOrder}
            onSelectSort={handleSelectSort}
            searchQuery={deferredSearchQuery}
          />
        )}
      </main>
    </div>
  );
};

export default KaraokeApp;
