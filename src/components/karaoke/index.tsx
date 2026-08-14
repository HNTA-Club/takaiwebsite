import { ChevronUp } from "lucide-react";
import { useKaraoke } from "./useKaraoke";
import { SearchBar } from "./SearchBar";
import { SongTable } from "./SongTable";

/**
 * Main Karaoke Application Component.
 * Orchestrates search/sort state via `useKaraoke` custom hook
 * and renders interactive search controls and responsive song table.
 */
export function KaraokeApp() {
  const {
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
  } = useKaraoke();

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

      {/* Floating Scroll-to-Top Button (Mobile Only) */}
      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className={`fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-brand-pink text-white shadow-lg transition-all duration-300 hover:bg-brand-pink/90 active:scale-95 sm:hidden ${
          showScrollTop
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <ChevronUp className="h-6 w-6 stroke-[2.5]" />
      </button>
    </div>
  );
}

export default KaraokeApp;
