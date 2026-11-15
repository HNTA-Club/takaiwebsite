import { Search, X } from "lucide-react";

export function SearchBar({
  query,
  onQueryChange,
  placeholder,
}: {
  query: string;
  onQueryChange: (query: string) => void;
  placeholder: string;
}) {
  return (
    <div className="group relative w-full">
      <Search
        className="text-text-muted group-focus-within:text-primary pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 transition-colors"
        aria-hidden="true"
      />
      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        autoComplete="off"
        className="border-border focus:border-primary focus:ring-primary/15 w-full rounded-xl border bg-white py-3 pr-12 pl-12 text-base shadow-md transition-all outline-none focus:ring-4 md:text-sm"
      />
      {query && (
        <button
          type="button"
          onClick={() => onQueryChange("")}
          title="Clear search"
          aria-label="Clear search"
          className="text-text-muted hover:bg-primary-subtle hover:text-primary-strong absolute top-1/2 right-2.5 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
