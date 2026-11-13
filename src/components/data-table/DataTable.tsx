import {
  memo,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Highlight } from "./Highlight";
import { ScrollToTopButton } from "./ScrollToTopButton";
import { SearchBar } from "./SearchBar";
import { SortButtons } from "./SortButtons";
import { SortHeaders } from "./SortHeaders";
import { buildHighlightRegex, normalizeText, toSearchTokens } from "./search";
import type { Column, SortState } from "./types";

const BATCH_SIZE = 25;

const COLLATOR = new Intl.Collator(undefined, {
  sensitivity: "base",
  numeric: true,
});

/** Rows that contain every search word in their columns. */
function filterRows<K extends string>(
  rows: Record<K, string>[],
  columns: Column<K>[],
  query: string,
) {
  const tokens = toSearchTokens(query);
  if (tokens.length === 0) return rows;

  const keys = columns.map((c) => c.key);
  return rows.filter((row) => {
    const text = normalizeText(keys.map((k) => row[k]).join(" "));
    return tokens.every((t) => text.includes(t));
  });
}

/** Sorts by the chosen column, then by its tie-breakers. */
function sortRows<K extends string>(
  rows: Record<K, string>[],
  columns: Column<K>[],
  sort: SortState<K>,
) {
  const thenBy =
    columns.find((c) => c.key === sort.key)?.thenSortBy ??
    columns.filter((c) => c.key !== sort.key).map((c) => c.key);
  const keys = [sort.key, ...thenBy];
  const direction = sort.order === "asc" ? 1 : -1;

  return rows.toSorted((a, b) => {
    for (const key of keys) {
      const aValue = a[key];
      const bValue = b[key];
      // Empty values sort last when ascending and first when descending.
      const cmp =
        !aValue || !bValue
          ? Number(!aValue) - Number(!bValue)
          : COLLATOR.compare(aValue, bValue);
      if (cmp !== 0) return cmp * direction;
    }
    return 0;
  });
}

type RenderCells<K extends string> = (row: Record<K, ReactNode>) => ReactNode;

function TableRow<K extends string>({
  row,
  query,
  renderCells,
}: {
  row: Record<K, string>;
  query: string;
  renderCells: RenderCells<K>;
}) {
  const highlightRegex = buildHighlightRegex(query);
  const highlighted = Object.fromEntries(
    Object.entries<string>(row).map(([key, value]) => [
      key,
      value && <Highlight text={value} regex={highlightRegex} />,
    ]),
  ) as Record<K, ReactNode>;

  // A stacked card below md and a grid row above md.
  return (
    <div className="border-border/60 hover:bg-code-bg/60 flex flex-col border-b p-3.5 transition-colors [contain-intrinsic-size:auto_48px] [content-visibility:auto] last:border-b-0 md:grid md:grid-cols-(--columns) md:p-0">
      {renderCells(highlighted)}
    </div>
  );
}

// Memoized to avoid rerendering previous rows when a new batch of rows is added.
const MemoTableRow = memo(TableRow) as typeof TableRow;

export function DataTable<K extends string>({
  rows,
  columns,
  defaultSort,
  itemLabel,
  searchPlaceholder,
  children,
}: {
  rows: Record<K, string>[];
  columns: Column<K>[];
  defaultSort: SortState<K>;
  /** Plural noun for the rows, e.g. "songs", "mangas". */
  itemLabel: string;
  searchPlaceholder: string;
  /** Renders one row. Return one element per column, in column order. */
  children: RenderCells<K>;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(defaultSort);
  const [batchCount, setBatchCount] = useState(1);

  // Memoize to avoid recalculation when batch is updated
  const sorted = useMemo(() => {
    const filtered = filterRows(rows, columns, query);
    return sortRows(filtered, columns, sort);
  }, [rows, columns, query, sort]);
  const shown = sorted.slice(0, batchCount * BATCH_SIZE);

  // Once the current batches have rendered, add the next one.
  useEffect(() => {
    if (shown.length >= sorted.length) return;
    const timer = setTimeout(() => setBatchCount((n) => n + 1));
    return () => clearTimeout(timer);
  }, [shown.length, sorted.length]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setBatchCount(1);
  };

  const handleSort = (key: K) => {
    setSort((prev) =>
      prev.key === key
        ? { key, order: prev.order === "asc" ? "desc" : "asc" }
        : { key, order: "asc" },
    );
    setBatchCount(1);
  };

  return (
    <div className="w-full font-sans">
      <div className="mb-4 flex flex-col">
        <SearchBar
          query={query}
          onQueryChange={handleQueryChange}
          placeholder={searchPlaceholder}
        />

        <div className="text-text-muted mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
          <span>
            Showing <strong>{shown.length}</strong> of{" "}
            <strong>{rows.length}</strong> {itemLabel}
          </span>
          <SortButtons columns={columns} sort={sort} onSort={handleSort} />
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="text-text-muted py-16 text-center">
          <p className="text-sm font-semibold">No matching {itemLabel} found</p>
          {query && (
            <button
              type="button"
              onClick={() => handleQueryChange("")}
              className="text-primary mt-2 text-xs font-semibold underline"
            >
              Reset search
            </button>
          )}
        </div>
      ) : (
        <div
          className="border-border w-full overflow-hidden rounded-xl border bg-white text-sm shadow-xs"
          style={
            {
              "--columns": `repeat(${columns.length}, minmax(0, 1fr))`,
            } as CSSProperties
          }
        >
          <SortHeaders columns={columns} sort={sort} onSort={handleSort} />

          {shown.map((row, i) => (
            // Index keys are fine here: rows hold no state of their own.
            <MemoTableRow
              key={i}
              row={row}
              query={query}
              renderCells={children}
            />
          ))}
        </div>
      )}

      <ScrollToTopButton />
    </div>
  );
}
