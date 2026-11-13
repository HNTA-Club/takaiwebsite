export function Highlight({
  text,
  regex,
}: {
  text: string;
  regex: RegExp | null;
}) {
  if (!regex || !text) return text;

  return text.split(regex).map((part, i) =>
    i % 2 === 1 ? (
      <mark
        key={i}
        className="bg-accent-subtle text-accent-strong rounded font-semibold"
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}
