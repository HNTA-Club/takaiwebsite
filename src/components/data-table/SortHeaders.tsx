import { SortIcon } from "./SortIcon";
import type { Column, SortState } from "./types";

/** The table's header row. Its grid columns come from the table's `--columns`. */
export function SortHeaders<K extends string>({
  columns,
  sort,
  onSort,
}: {
  columns: Column<K>[];
  sort: SortState<K>;
  onSort: (key: K) => void;
}) {
  return (
    <div className="text-text hidden text-xs md:grid md:grid-cols-(--columns)">
      {columns.map((column) => {
        const active = sort.key === column.key;

        return (
          <div
            key={column.key}
            className="bg-code-bg border-border flex items-center border-b"
          >
            <button
              type="button"
              onClick={() => onSort(column.key)}
              title={`Sort by ${column.label.toLowerCase()}`}
              className="hover:bg-border-strong/15 flex h-full w-full cursor-pointer items-center gap-1 px-4 py-3 text-left font-bold tracking-wider uppercase transition-colors"
            >
              {column.label}
              {active && (
                <SortIcon
                  order={sort.order}
                  className="text-primary size-4 stroke-3"
                />
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
