import type { KaraokeSong } from "./songsData";
import { DataTable } from "../data-table/DataTable";

export function KaraokeTable({ songs }: { songs: KaraokeSong[] }) {
  return (
    <DataTable
      rows={songs}
      columns={[
        { key: "artist", label: "Artist", thenSortBy: ["source", "song"] },
        { key: "song", label: "Song Title", thenSortBy: ["source", "artist"] },
        { key: "source", label: "Source", thenSortBy: ["artist", "song"] },
      ]}
      defaultSort={{ key: "source", order: "asc" }}
      itemLabel="songs"
      searchPlaceholder="Search by artist, song, or anime..."
    >
      {(song) => (
        // The mobile `order-*` classes stack each card as source badge, song,
        // then artist; desktop keeps the column order. An empty card line
        // would only add spacing, so empty cells are hidden below md.
        <>
          <div className="text-text-muted md:text-text order-3 mt-0.5 text-xs max-md:empty:hidden md:order-0 md:mt-0 md:flex md:items-center md:px-4 md:py-2.5 md:text-sm md:font-medium">
            {song.artist}
          </div>
          <div className="text-primary order-2 text-sm font-bold max-md:empty:hidden md:order-0 md:flex md:items-center md:px-4 md:py-2.5 md:font-semibold">
            {song.song}
          </div>
          <div
            // Without a source, mobile shows no badge and desktop a dash.
            className={`md:text-secondary order-1 mb-1 md:order-0 md:mb-0 md:flex md:items-center md:px-4 md:py-2.5 ${song.source ? "" : "max-md:hidden"}`}
          >
            {/* A badge on mobile only; on desktop it reads as plain text. */}
            <span className="max-md:border-secondary/30 max-md:bg-secondary-subtle max-md:text-secondary-strong max-md:inline-block max-md:rounded-md max-md:border max-md:px-2 max-md:py-0.5 max-md:text-[11px] max-md:font-semibold">
              {song.source || "—"}
            </span>
          </div>
        </>
      )}
    </DataTable>
  );
}
