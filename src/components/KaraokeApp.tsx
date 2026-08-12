import React, { useState, useEffect, useMemo } from "react";

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

export type SearchField = "all" | "song" | "anime" | "artist";
export type SortOption = "anime" | "song" | "artist";

export const HNTA_GOOGLE_SHEET_TSV_URL =
  "https://docs.google.com/spreadsheets/u/0/d/e/2PACX-1vTFHxMlqkQW-aVmnz8IcB1w6glfoY0WNsu-EtIlCPBNzEK38UfJAwWJGHAmQErX9zcQdwL8XLyrr7FI/pub?output=tsv&range=B1:D";

const FAVS_STORAGE_KEY = "hnta_karaoke_favs";
const SUNG_STORAGE_KEY = "hnta_karaoke_sung";

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



/* LocalStorage Helpers */
function loadStorageSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(key);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveStorageSet(key: string, set: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.error(`Failed to save ${key}`, e);
  }
}

/* ==========================================================================
   REACT COMPONENTS
   ========================================================================== */

/* Search Toolbar Component */
interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchField: SearchField;
  onSearchFieldChange: (field: SearchField) => void;
  showFavsOnly: boolean;
  onToggleFavsOnly: () => void;
  sungFilter: "all" | "unsung" | "sung";
  onSungFilterChange: (filter: "all" | "unsung" | "sung") => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  searchField,
  onSearchFieldChange,
  showFavsOnly,
  onToggleFavsOnly,
  sungFilter,
  onSungFilterChange,
}) => {
  return (
    <div className="karaoke-toolbar">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="karaoke-search-input-wrapper">
          <span className="karaoke-search-icon">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={`Search by ${
              searchField === "all" ? "artist, song, or anime..." : searchField + "..."
            }`}
            className="karaoke-search-input"
          />
          {searchQuery && (
            <button onClick={() => onSearchChange("")} className="karaoke-search-clear">
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="karaoke-toolbar-options">
        <div className="flex items-center gap-1">
          <span className="mr-1 font-medium text-gray-500 dark:text-slate-400">
            Search field:
          </span>
          {(["all", "song", "anime", "artist"] as SearchField[]).map((field) => (
            <button
              key={field}
              onClick={() => onSearchFieldChange(field)}
              className={`karaoke-btn ${searchField === field ? "karaoke-btn-active" : ""}`}
            >
              {field}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleFavsOnly}
            className={`karaoke-btn ${showFavsOnly ? "karaoke-btn-fav-active" : ""}`}
          >
            ♥ Favorites
          </button>

          <button
            onClick={() => {
              if (sungFilter === "all") onSungFilterChange("unsung");
              else if (sungFilter === "unsung") onSungFilterChange("sung");
              else onSungFilterChange("all");
            }}
            className={`karaoke-btn ${sungFilter !== "all" ? "karaoke-btn-sung-active" : ""}`}
          >
            {sungFilter === "sung"
              ? "✓ Only Sung"
              : sungFilter === "unsung"
              ? "⌛ Hide Sung"
              : "✓ All Status"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* Horizontal Song Table Component */
interface SongTableProps {
  songs: KaraokeSong[];
  sortOption: SortOption;
  onSortOptionChange: (sort: SortOption) => void;
  favorites: Set<string>;
  sung: Set<string>;
  onToggleFav: (id: string) => void;
  onToggleSung: (id: string) => void;
  searchQuery?: string;
}

const SongTable: React.FC<SongTableProps> = ({
  songs,
  sortOption,
  onSortOptionChange,
  favorites,
  sung,
  onToggleFav,
  onToggleSung,
  searchQuery = "",
}) => {
  const highlightMatch = (text: string) => {
    if (!searchQuery.trim() || !text) return text || "";
    const regex = new RegExp(`(${searchQuery.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="karaoke-mark-match">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="karaoke-table-wrapper">
      <table className="karaoke-table">
        <thead>
          <tr>
            <th scope="col" onClick={() => onSortOptionChange("artist")}>
              <div className="flex items-center gap-1">
                <span>Artist</span>
                {sortOption === "artist" && <span>↓</span>}
              </div>
            </th>
            <th scope="col" onClick={() => onSortOptionChange("song")}>
              <div className="flex items-center gap-1">
                <span>Song Title</span>
                {sortOption === "song" && <span>↓</span>}
              </div>
            </th>
            <th scope="col" onClick={() => onSortOptionChange("anime")}>
              <div className="flex items-center gap-1">
                <span>Anime / Source</span>
                {sortOption === "anime" && <span>↓</span>}
              </div>
            </th>
            <th scope="col" className="text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {songs.map((song) => {
            const isFav = favorites.has(song.id);
            const isSung = sung.has(song.id);

            return (
              <tr key={song.id} className={`karaoke-row ${isSung ? "karaoke-row-sung" : ""}`}>
                <td className="karaoke-cell-artist">{highlightMatch(song.artist)}</td>
                <td className="karaoke-cell-song">{highlightMatch(song.song)}</td>
                <td className="karaoke-cell-anime">{highlightMatch(song.anime || "—")}</td>
                <td className="text-right">
                  <div className="karaoke-action-group">
                    <button
                      onClick={() => onToggleSung(song.id)}
                      className={`karaoke-btn ${isSung ? "karaoke-btn-sung-active" : ""}`}
                      title={isSung ? "Mark as unsung" : "Mark as sung"}
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => onToggleFav(song.id)}
                      className={`karaoke-btn ${isFav ? "karaoke-btn-fav-active" : ""}`}
                      title={isFav ? "Remove from favorites" : "Add to favorites"}
                    >
                      ♥
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export const KaraokeApp: React.FC = () => {
  const [allSongs, setAllSongs] = useState<KaraokeSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [sung, setSung] = useState<Set<string>>(new Set());

  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState<SearchField>("all");
  const [sortOption, setSortOption] = useState<SortOption>("anime");
  const [showFavsOnly, setShowFavsOnly] = useState(false);
  const [sungFilter, setSungFilter] = useState<"all" | "unsung" | "sung">("all");

  useEffect(() => {
    setFavorites(loadStorageSet(FAVS_STORAGE_KEY));
    setSung(loadStorageSet(SUNG_STORAGE_KEY));

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

  const handleToggleFav = (id: string) => {
    const updated = new Set(favorites);
    if (updated.has(id)) updated.delete(id);
    else updated.add(id);
    setFavorites(updated);
    saveStorageSet(FAVS_STORAGE_KEY, updated);
  };

  const handleToggleSung = (id: string) => {
    const updated = new Set(sung);
    if (updated.has(id)) updated.delete(id);
    else updated.add(id);
    setSung(updated);
    saveStorageSet(SUNG_STORAGE_KEY, updated);
  };

  const filteredSongs = useMemo(() => {
    let list = allSongs;

    const queryFold = foldText(searchQuery);
    if (queryFold) {
      list = list.filter((s) => {
        if (searchField === "song") return s.songFold.includes(queryFold);
        if (searchField === "anime") return s.animeFold.includes(queryFold);
        if (searchField === "artist") return s.artistFold.includes(queryFold);
        return (
          s.songFold.includes(queryFold) ||
          s.animeFold.includes(queryFold) ||
          s.artistFold.includes(queryFold)
        );
      });
    }

    if (showFavsOnly) {
      list = list.filter((s) => favorites.has(s.id));
    }

    if (sungFilter === "sung") {
      list = list.filter((s) => sung.has(s.id));
    } else if (sungFilter === "unsung") {
      list = list.filter((s) => !sung.has(s.id));
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
  }, [allSongs, searchQuery, searchField, showFavsOnly, sungFilter, sortOption, favorites, sung]);

  return (
    <div className="w-full font-sans">
      <div className="karaoke-stats-bar">
        <span>
          Showing <strong>{filteredSongs.length}</strong> of <strong>{allSongs.length}</strong> songs
        </span>
      </div>

      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchField={searchField}
        onSearchFieldChange={setSearchField}
        showFavsOnly={showFavsOnly}
        onToggleFavsOnly={() => setShowFavsOnly(!showFavsOnly)}
        sungFilter={sungFilter}
        onSungFilterChange={setSungFilter}
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
            {(searchQuery || showFavsOnly || sungFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowFavsOnly(false);
                  setSungFilter("all");
                }}
                className="mt-2 text-xs font-semibold text-pink-600 underline"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <SongTable
            songs={filteredSongs}
            sortOption={sortOption}
            onSortOptionChange={setSortOption}
            favorites={favorites}
            sung={sung}
            onToggleFav={handleToggleFav}
            onToggleSung={handleToggleSung}
            searchQuery={searchQuery}
          />
        )}
      </main>
    </div>
  );
};

export default KaraokeApp;
