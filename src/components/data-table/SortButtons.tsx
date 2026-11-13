import { SortIcon } from "./SortIcon";
import type { Column, SortState } from "./types";

export function SortButtons<K extends string>({
  columns,
  sort,
  onSort,
}: {
  columns: Column<K>[];
  sort: SortState<K>;
  onSort: (key: K) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 md:hidden">
      <span className="font-medium">Sort by:</span>
      {columns.map((column) => {
        const active = sort.key === column.key;
        return (
          <button
            key={column.key}
            type="button"
            onClick={() => onSort(column.key)}
            aria-pressed={active}
            className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
              active
                ? "border-primary bg-primary font-semibold text-white shadow-xs"
                : "border-border-strong text-text hover:bg-code-bg/60 bg-white"
            }`}
          >
            {column.label}
            {active && <SortIcon order={sort.order} className="h-3.5 w-3.5" />}
          </button>
        );
      })}
    </div>
  );
}
