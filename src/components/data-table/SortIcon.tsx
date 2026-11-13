import { ChevronDown, ChevronUp } from "lucide-react";
import type { SortOrder } from "./types";

export function SortIcon({
  order,
  className,
}: {
  order: SortOrder;
  className: string;
}) {
  const Icon = order === "asc" ? ChevronDown : ChevronUp;
  return <Icon className={className} aria-hidden="true" />;
}
