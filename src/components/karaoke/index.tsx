import { useState, useEffect, useDeferredValue } from "react";
import { ChevronUp } from "lucide-react";
import type { KaraokeSong } from "./data";
import { fetchTakaiKaraokeSongs, normalizeText } from "./data";
import { SearchBar } from "./SearchBar";
import { SongTable } from "./SongTable";

// Field available for sorting the song list
export type SortOption = "anime" | "song" | "artist";

// Direction of list sorting
export type SortOrder = "asc" | "desc";

// Priority chain mapping based on active sort option: primary -> secondary -> tertiary
const SORT_FIELD_MAP: Record<SortOption, (keyof KaraokeSong)[]> = {
  anime: ["anime", "artist", "song"],
  artist: ["artist", "anime", "song"],
  song: ["song", "anime", "artist"],
};

// Hoisted collator instance for fast string comparison in sorting loops (js-cache-function-results)
const SONG_COLLATOR = new Intl.Collator(undefined, {
  sensitivity: "base",
  numeric: true,
});

/**
 * Main Karaoke Application Component.
 * Consolidates search/sort state and renders interactive 
 * search controls and responsive song table.
 */
export function KaraokeApp() {
  // ==========================================
  // 1. STATE
  // ==========================================

  // Data State
  const [allSongs, setAllSongs] = useState<KaraokeSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Sort State
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [sortOption, setSortOption] = useState<SortOption>("anime");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // UI State
  const [showScrollTop, setShowScrollTop] = useState(false);


  // ==========================================
  // 2. EFFECTS (Side effects & Data fetching)
  // ==========================================

  // Fetch song database on component mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const songs = await fetchTakaiKaraokeSongs();
        setAllSongs(songs);
        setError(null);
      } catch (err: unknown) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(`Failed to load karaoke database: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Monitor window scroll position to toggle scroll-to-top button on mobile
  useEffect(() => {
    const handleScroll = () => {
      const isPastThreshold = window.scrollY > 300;
      setShowScrollTop((prev) => (prev !== isPastThreshold ? isPastThreshold : prev));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  // ==========================================
  // 3. HANDLERS (User interactions)
  // ==========================================

  // Toggles sort direction if clicking the same field, or sets field and defaults to asc
  const handleSelectSort = (option: SortOption) => {
    if (sortOption === option) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortOption(option);
      setSortOrder("asc");
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  // ==========================================
  // 4. DERIVED DATA (Filtering & Sorting)
  // ==========================================

  // Apply Search Filter
  const tokens = deferredSearchQuery
    .trim()
    .split(/\s+/)
    .map(normalizeText)
    .filter(Boolean);

  const filteredSongs = tokens.length > 0
    ? allSongs.filter((s) => tokens.every((token) => s.normalized.includes(token)))
    : allSongs;

  // Apply Multi-Tier Sorting (js-tosorted-immutable & js-cache-function-results)
  const sortedSongs = filteredSongs.toSorted((a, b) => {
    const fields = SORT_FIELD_MAP[sortOption];

    for (const field of fields) {
      const valA = (a[field] as string) || "ZZZ";
      const valB = (b[field] as string) || "ZZZ";

      const cmp = SONG_COLLATOR.compare(valA, valB);

      if (cmp !== 0) {
        return sortOrder === "desc" ? -cmp : cmp;
      }
    }

    return 0;
  });


  // ==========================================
  // 5. MAIN RENDER
  // ==========================================
  return (
    <div className="w-full font-sans">
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortOption={sortOption}
        sortOrder={sortOrder}
        onSelectSort={handleSelectSort}
        filteredCount={sortedSongs.length}
        totalSongs={allSongs.length}
      />

      <main className="w-full">
        {loading && (
          <div className="py-16 text-center text-site-text-muted">
            <p className="text-sm font-semibold">Loading song database...</p>
          </div>
        )}
        
        {!loading && !!error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && sortedSongs.length === 0 && (
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
        )}

        {!loading && !error && sortedSongs.length > 0 && (
          <SongTable
            songs={sortedSongs}
            sortOption={sortOption}
            sortOrder={sortOrder}
            onSelectSort={handleSelectSort}
            searchQuery={deferredSearchQuery}
          />
        )}
      </main>

      {/* Floating Scroll-to-Top Button (Mobile Only) */}
      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className={`fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-brand-pink text-white shadow-lg transition-all duration-300 hover:bg-brand-pink/90 active:scale-95 md:hidden ${showScrollTop
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
          }`}
      >
        <ChevronUp className="h-6 w-6 stroke-[2.5]" />
      </button>
    </div>
  );
}
