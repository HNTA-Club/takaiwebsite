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
    <div className="relative w-full">
      <Search
        className="text-text-muted absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2"
        aria-hidden="true"
      />
      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="border-border-strong text-text focus:border-primary focus:ring-primary/20 w-full rounded-xl border bg-white py-2.5 pr-9 pl-10 text-sm shadow-xs transition-all outline-none focus:ring-2"
      />
      {query && (
        <button
          type="button"
          onClick={() => onQueryChange("")}
          title="Clear search"
          aria-label="Clear search"
          className="text-text-muted hover:text-text absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
