import { memo } from "react";

interface Chunk {
  text: string;
  isMatch: boolean;
  start: number;
}

/**
 * Scans a string and slices it into structured text chunks indicating
 * whether each segment matches the search query.
 */
function getHighlightedChunks(
  text: string,
  searchRegex: RegExp | null
): Chunk[] {
  if (!searchRegex || !text) {
    return [{ text: text || "", isMatch: false, start: 0 }];
  }

  // Clone regex to keep execution isolated and reset lastIndex
  const regex = new RegExp(searchRegex.source, "gi");
  const chunks: Chunk[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // 1. Text before the match
    if (match.index > lastIndex) {
      chunks.push({
        text: text.slice(lastIndex, match.index),
        isMatch: false,
        start: lastIndex,
      });
    }

    // 2. The matched term
    chunks.push({
      text: match[0],
      isMatch: true,
      start: match.index,
    });

    lastIndex = match.index + match[0].length;

    // Guard against zero-length matches causing infinite loops
    if (match[0].length === 0) {
      regex.lastIndex++;
    }
  }

  // 3. Any remaining text after the last match
  if (lastIndex < text.length) {
    chunks.push({
      text: text.slice(lastIndex),
      isMatch: false,
      start: lastIndex,
    });
  }

  return chunks;
}

/**
 * Renders text with search query substrings wrapped in <mark> tags.
 * Keys are derived from character start positions in the string.
 */
export const HighlightedText = memo(function HighlightedText({
  text,
  searchRegex,
}: {
  text: string;
  searchRegex: RegExp | null;
}) {
  if (!searchRegex || !text) {
    return <>{text || ""}</>;
  }

  const chunks = getHighlightedChunks(text, searchRegex);

  return (
    <>
      {chunks.map((chunk) =>
        chunk.isMatch ? (
          <mark
            key={chunk.start}
            className="rounded bg-search-highlight-bg font-semibold text-search-highlight-text"
          >
            {chunk.text}
          </mark>
        ) : (
          chunk.text
        )
      )}
    </>
  );
});
