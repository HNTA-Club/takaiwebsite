import { Search, X } from "lucide-react";
import type { SortOption, SortOrder } from "./SongTable";

export interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortOption: SortOption;
  sortOrder: SortOrder;
  onSelectSort: (sort: SortOption) => void;
  filteredCount: number;
  totalSongs: number;
}

export function SearchBar({
  searchQuery,
  onSearchChange,
  sortOption,
  sortOrder,
  onSelectSort,
  filteredCount,
  totalSongs,
}: SearchBarProps) {
  return (
    <div className="mb-4 flex flex-col">
      <div className="relative w-full">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-site-text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by artist, song, or anime..."
          aria-label="Search by artist, song, or anime"
          className="w-full rounded-xl border border-site-border bg-site-card-bg py-2.5 pl-10 pr-9 text-sm text-site-text outline-none shadow-xs transition-all focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-site-text-muted hover:text-site-text transition-colors"
            title="Clear search"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-site-text-muted">
        <span>
          Showing <strong>{filteredCount}</strong> of <strong>{totalSongs}</strong> songs
        </span>

        <div className="flex items-center gap-1.5 sm:hidden">
          <span className="font-medium text-site-text-muted">Sort by:</span>
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
  );
}
