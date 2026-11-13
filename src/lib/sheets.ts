function parseTsv<K extends string>(
  tsv: string,
  keys: readonly K[],
): Record<K, string>[] {
  const rows: Record<K, string>[] = [];

  for (const line of tsv.split(/\r?\n/).slice(1)) {
    const cells = line.split("\t");
    const row = {} as Record<K, string>;
    let hasValue = false;

    keys.forEach((key, i) => {
      const value = (cells[i] ?? "").trim();
      row[key] = value;
      if (value) hasValue = true;
    });

    if (hasValue) rows.push(row);
  }

  return rows;
}

/**
 * Fetches a published Google Sheet as TSV and maps each row to an object.
 *
 * `keys` names the columns in sheet order. The first line is treated as a
 * header and skipped. Rows where every cell is empty are dropped.
 */
export async function fetchSheetRows<K extends string>(
  url: string,
  keys: readonly K[],
): Promise<Record<K, string>[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch sheet: ${response.status} ${response.statusText}`,
    );
  }
  return parseTsv(await response.text(), keys);
}
