import type { KaraokeSong } from "./data";
import type { SortOption, SortOrder } from "./index";
import { SortableHeader } from "./SortableHeader";

/**
 * Wraps matching search query substrings in <mark> tags for visual highlighting.
 * Hoisted outside component render loop to avoid function allocations per render.
 */
function highlightMatch(text: string, searchRegex: RegExp | null) {
  // If there is no active search, just return the plain text.
  if (!searchRegex || !text) return text || "";

  // JavaScript's String.split() behaves specially when a capturing group `(...)` is used in the regex.
  // Instead of just removing the matched separators, it INCLUDES the matched substrings in the output array.
  // Example: "Spy x Family".split(/(spy|family)/gi) -> ["", "Spy", " x ", "Family", ""]
  // Because of this, the matched search terms will ALWAYS land at the odd indices (1, 3, 5...).
  const parts = text.split(searchRegex);

  return parts.map((part, i) =>
    // If the index is odd, we know it's a matching search term, so we wrap it in a <mark> tag to highlight it.
    // If it's even, it's just normal surrounding text, so we return it as-is.
    i % 2 === 1 ? (
      <mark
        key={i}
        className="rounded bg-search-highlight-bg font-semibold text-search-highlight-text"
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export function SongTable({
  songs,
  sortOption,
  sortOrder,
  onSelectSort,
  searchQuery = "",
}: {
  songs: KaraokeSong[];
  sortOption: SortOption;
  sortOrder: SortOrder;
  onSelectSort: (sort: SortOption) => void;
  searchQuery?: string;
}) {
  // --- Highlighting Logic ---
  // We compile the search terms into a single Regular Expression here at the component root.
  // Doing this outside of `highlightMatch` ensures we only compile the regex ONCE per render,
  // rather than re-compiling it for every single text field of every single song in the table.

  // 1. Split the search query by spaces into individual words (tokens).
  // 2. Escape any special regex characters in each token to prevent crashes.
  const rawTokens = searchQuery
    .trim()
    .split(/\s+/)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .filter(Boolean);

  // 3. Join tokens with the OR operator `|` and wrap them in a capturing group `(...)`.
  // The 'gi' flags make the search global (find all matches) and case-insensitive.
  // Example: If user searches "spy family", regex becomes /(spy|family)/gi
  const searchRegex = rawTokens.length > 0
    ? new RegExp(`(${rawTokens.join("|")})`, "gi")
    : null;

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
          className="group md:contents flex flex-col p-3.5 border-b border-site-border-subtle last:border-b-0 hover:bg-site-hover transition-colors md:hover:bg-transparent [content-visibility:auto] [contain-intrinsic-size:1px_48px]"
        >
          {/* Artist */}
          <div className="order-3 md:order-0 mt-0.5 md:mt-0 text-xs md:text-sm text-site-text-muted md:text-site-text md:font-medium md:px-4 md:py-2.5 md:flex md:items-center md:border-b md:border-site-border-subtle md:group-hover:bg-site-hover transition-colors">
            <span>{highlightMatch(song.artist, searchRegex)}</span>
          </div>

          {/* Song Title */}
          <div className="order-2 md:order-0 text-sm font-bold md:font-semibold text-brand-pink md:px-4 md:py-2.5 md:flex md:items-center md:border-b md:border-site-border-subtle md:group-hover:bg-site-hover transition-colors">
            <span>{highlightMatch(song.song, searchRegex)}</span>
          </div>

          {/* Anime / Source */}
          <div className="order-1 md:order-0 mb-1 md:mb-0 md:px-4 md:py-2.5 md:flex md:items-center md:text-site-text-muted md:border-b md:border-site-border-subtle md:group-hover:bg-site-hover transition-colors">
            <span className="md:hidden inline-block rounded-md border border-brand-purple-border bg-brand-purple-bg px-2 py-0.5 text-[11px] font-semibold text-brand-purple-text">
              {highlightMatch(song.anime || "Original / Special", searchRegex)}
            </span>
            <span className="hidden md:inline">
              {highlightMatch(song.anime || "—", searchRegex)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
