import { ChevronDown, ChevronUp } from "lucide-react";
import type { SortOption, SortOrder } from "./SongTable";

export const SortableHeader = ({
  label,
  field,
  currentSortOption,
  currentSortOrder,
  onSelectSort,
}: {
  label: string;
  field: SortOption;
  currentSortOption: SortOption;
  currentSortOrder: SortOrder;
  onSelectSort: (sort: SortOption) => void;
}) => (
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
