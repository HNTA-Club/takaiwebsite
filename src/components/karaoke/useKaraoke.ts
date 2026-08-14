import { useState, useEffect, useMemo, useDeferredValue, useCallback } from "react";
import type { KaraokeSong, SortOption, SortOrder } from "./types";
import { fetchTakaiKaraokeSongs, normalizeText } from "./data";

/**
 * Custom hook which consolidates Karaoke app's logic:
 *   - Data fetching (Google Sheets TSV)
 *   - Search normalization & filtering (multi-keyword)
 *   - Multi-tier sorting memoization (primary → secondary → tertiary)
 *   - Scroll management (back-to-top button on mobile)
 */
export function useKaraoke() {
  const [allSongs, setAllSongs] = useState<KaraokeSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  // Deferred query keeps input typing 100% instant while filtering runs in background
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [sortOption, setSortOption] = useState<SortOption>("anime");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Monitor window scroll position to toggle scroll-to-top button on mobile
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  // Toggles sort direction if clicking the same field, or sets field and defaults to asc
  const handleSelectSort = useCallback((option: SortOption) => {
    if (sortOption === option) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortOption(option);
      setSortOrder("asc");
    }
  }, [sortOption]);

  // Fetches song database on component mount
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
        setError(`Failed to load karaoke database from Google Sheets: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Filters and sorts songs based on current search terms and sort selection
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
      // Priority chain based on active sort option: primary -> secondary -> tertiary
      const fields: (keyof KaraokeSong)[] =
        sortOption === "anime"
          ? ["anime", "artist", "song"]
          : sortOption === "artist"
            ? ["artist", "anime", "song"]
            : ["song", "anime", "artist"];

      for (const field of fields) {
        const valA = (a[field] as string) || "ZZZ";
        const valB = (b[field] as string) || "ZZZ";

        const cmp = valA.localeCompare(valB, undefined, {
          sensitivity: "base",
          numeric: true,
        });

        if (cmp !== 0) {
          return sortOrder === "desc" ? -cmp : cmp;
        }
      }

      return 0;
    });

    return sorted;
  }, [allSongs, deferredSearchQuery, sortOption, sortOrder]);

  return {
    allSongs,
    filteredSongs,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    deferredSearchQuery,
    sortOption,
    sortOrder,
    handleSelectSort,
    showScrollTop,
    scrollToTop,
  };
}
