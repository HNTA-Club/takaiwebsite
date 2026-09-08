import { memo, useRef, useEffect } from "react";
import type { KaraokeSong } from "./data";
import { escapeAndAccentPattern } from "./data";
import type { SortOption, SortOrder } from "./index";
import { SortableHeader } from "./SortableHeader";
import { HighlightedText } from "./HighlightedText";

export const SongTable = memo(function SongTable({
  songs,
  totalFilteredCount,
  sortOption,
  sortOrder,
  onSelectSort,
  searchQuery = "",
  hasMore = false,
  onLoadMore,
}: {
  songs: KaraokeSong[];
  totalFilteredCount: number;
  sortOption: SortOption;
  sortOrder: SortOrder;
  onSelectSort: (sort: SortOption) => void;
  searchQuery?: string;
  hasMore?: boolean;
  onLoadMore?: () => void;
}) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Setup IntersectionObserver for smooth progressive loading
  useEffect(() => {
    if (!hasMore || !onLoadMore) return;

    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  // Precompile search regex once at the component root rather than inside render loops
  const rawTokens = searchQuery
    .trim()
    .split(/\s+/)
    .map(escapeAndAccentPattern)
    .filter(Boolean);

  const searchRegex =
    rawTokens.length > 0 ? new RegExp(`(${rawTokens.join("|")})`, "gi") : null;

  return (
    <div className="w-full rounded-xl border border-site-border bg-site-card-bg shadow-xs overflow-hidden text-sm md:grid md:grid-cols-3">
      {/* Desktop Header */}
      <div className="hidden md:contents text-xs uppercase tracking-wider text-site-text-muted">
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
          className="group md:contents flex flex-col p-3.5 border-b border-site-border-subtle last:border-b-0 hover:bg-site-hover transition-colors md:hover:bg-transparent"
        >
          {/* Artist */}
          <div className="order-3 md:order-0 mt-0.5 md:mt-0 text-xs md:text-sm text-site-text-muted md:text-site-text md:font-medium md:px-4 md:py-2.5 md:flex md:items-center md:border-b md:border-site-border-subtle md:group-hover:bg-site-hover transition-colors">
            <span>
              <HighlightedText text={song.artist} searchRegex={searchRegex} />
            </span>
          </div>

          {/* Song Title */}
          <div className="order-2 md:order-0 text-sm font-bold md:font-semibold text-brand-pink md:px-4 md:py-2.5 md:flex md:items-center md:border-b md:border-site-border-subtle md:group-hover:bg-site-hover transition-colors">
            <span>
              <HighlightedText text={song.song} searchRegex={searchRegex} />
            </span>
          </div>

          {/* Anime / Source */}
          <div className="order-1 md:order-0 mb-1 md:mb-0 md:px-4 md:py-2.5 md:flex md:items-center md:text-site-text-muted md:border-b md:border-site-border-subtle md:group-hover:bg-site-hover transition-colors">
            <span className="md:hidden inline-block rounded-md border border-brand-purple-border bg-brand-purple-bg px-2 py-0.5 text-[11px] font-semibold text-brand-purple-text">
              <HighlightedText
                text={song.anime || "Original / Special"}
                searchRegex={searchRegex}
              />
            </span>
            <span className="hidden md:inline">
              <HighlightedText
                text={song.anime || "—"}
                searchRegex={searchRegex}
              />
            </span>
          </div>
        </div>
      ))}

      {/* Progressive Loading Sentinel */}
      {hasMore && (
        <div
          ref={sentinelRef}
          className="col-span-full flex items-center justify-center gap-2 py-4 text-xs text-site-text-muted"
        >
          <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand-pink border-t-transparent" />
          <span>Loading more songs...</span>
        </div>
      )}

      {/* End of list indicator */}
      {!hasMore && (
        <div className="col-span-full border-t border-site-border-subtle py-3 text-center text-xs text-site-text-muted">
          All {totalFilteredCount} songs loaded
        </div>
      )}
    </div>
  );
});
