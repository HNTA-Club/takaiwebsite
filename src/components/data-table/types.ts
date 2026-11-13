export type SortOrder = "asc" | "desc";

export interface SortState<K extends string> {
  key: K;
  order: SortOrder;
}

export interface Column<K extends string> {
  /** Row field this column shows, sorts by and searches. */
  key: K;
  /** Label for table columns and sort buttons. */
  label: string;
  /** Tie-breaker columns used when sorting by this one, in priority order. */
  thenSortBy?: K[];
}
