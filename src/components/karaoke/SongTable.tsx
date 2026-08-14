import { useCallback } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { KaraokeSong, SortOption, SortOrder } from "./types";

interface SortableHeaderProps {
  label: string;
  field: SortOption;
  currentSortOption: SortOption;
  currentSortOrder: SortOrder;
  onSelectSort: (sort: SortOption) => void;
}

/**
 * Interactive header element for table columns on desktop.
 * Shows active sorting indicators (ChevronUp / ChevronDown) and triggers sort toggle on click.
 */
const SortableHeader = ({
  label,
  field,
  currentSortOption,
  currentSortOrder,
  onSelectSort,
}: SortableHeaderProps) => (
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

export interface SongTableProps {
  songs: KaraokeSong[];
  sortOption: SortOption;
  sortOrder: SortOrder;
  onSelectSort: (sort: SortOption) => void;
  searchQuery?: string;
}

/**
 * Unified list component using a single CSS Grid layout.
 * On desktop (>= 640px), renders as a 3-column table.
 * On mobile (< 640px), collapses into stacked card items via display: contents.
 */
export function SongTable({
  songs,
  sortOption,
  sortOrder,
  onSelectSort,
  searchQuery = "",
}: SongTableProps) {
  // Highlights substring matches in text matching the user's active search terms
  const highlightMatch = useCallback(
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
          className="group sm:contents flex flex-col p-3.5 border-b border-site-border-subtle last:border-b-0 hover:bg-site-hover transition-colors sm:hover:bg-transparent"
        >
          {/* Artist */}
          <div className="order-3 sm:order-0 mt-0.5 sm:mt-0 text-xs sm:text-sm text-site-text-muted sm:text-site-text sm:font-medium sm:px-4 sm:py-2.5 sm:flex sm:items-center sm:border-b sm:border-site-border-subtle sm:group-hover:bg-site-hover transition-colors">
            {highlightMatch(song.artist)}
          </div>

          {/* Song Title */}
          <div className="order-2 sm:order-0 text-sm font-bold sm:font-semibold text-brand-pink sm:px-4 sm:py-2.5 sm:flex sm:items-center sm:border-b sm:border-site-border-subtle sm:group-hover:bg-site-hover transition-colors">
            {highlightMatch(song.song)}
          </div>

          {/* Anime / Source */}
          <div className="order-1 sm:order-0 mb-1 sm:mb-0 sm:px-4 sm:py-2.5 sm:flex sm:items-center sm:text-site-text-muted sm:border-b sm:border-site-border-subtle sm:group-hover:bg-site-hover transition-colors">
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
}
