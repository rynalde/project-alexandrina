import type { ReactNode } from "react";

interface TermTooltipProps {
  term: string;
  definition: string;
  children?: ReactNode;
}

export default function TermTooltip({
  term,
  definition,
  children,
}: TermTooltipProps) {
  return (
    <span className="group relative inline-flex align-baseline">
      <button
        type="button"
        aria-label={`${term}: ${definition}`}
        className="border-b border-dotted border-rubric/70 font-medium text-rubric underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rubric/60"
      >
        {children ?? term}
      </button>
      <span
        role="tooltip"
        className="pointer-events-none invisible absolute bottom-full left-0 z-20 mb-2 w-64 rounded-md border border-border bg-card p-3 text-left font-sans text-sm font-normal leading-relaxed text-ink opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
      >
        {definition}
      </span>
    </span>
  );
}
