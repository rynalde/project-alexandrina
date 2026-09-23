"use client";

import { useState, type ReactNode } from "react";
import { Check, Eye, Lightbulb, X } from "lucide-react";

/**
 * Micro-interactions: small, inline, low-friction checks that sit inside the
 * chapter text. They never block progress and don't write to the progress store.
 */

export function QuickCheck({
  q,
  options,
  correct,
  why,
}: {
  q: string;
  options: string[];
  correct: number;
  why: string;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;
  const right = picked === correct;

  return (
    <div className="my-5 rounded-lg border border-dashed border-rubric/40 bg-rubric/[0.04] p-3.5">
      <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-rubric">
        <Lightbulb size={12} /> quick check
      </div>
      <div className="mb-3 text-[15px] leading-snug text-ink">{q}</div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option, index) => {
          const isPicked = picked === index;
          const isCorrect = index === correct;
          let tone = "border-border bg-background text-ink hover:border-rubric/40";
          if (answered && isCorrect) tone = "border-transparent bg-ink text-paper";
          else if (answered && isPicked) tone = "border-rubric bg-background text-rubric line-through";
          return (
            <button
              key={option}
              type="button"
              disabled={answered && right}
              onClick={() => setPicked(index)}
              className={`min-h-9 rounded-md border px-3 py-1.5 text-left text-sm transition ${tone}`}
            >
              {option}
            </button>
          );
        })}
      </div>
      {answered ? (
        <div
          className={`mt-3 flex items-start gap-2 text-sm leading-relaxed ${
            right ? "text-ink" : "text-rubric"
          } animate-fade-in`}
        >
          {right ? <Check size={15} className="mt-0.5 shrink-0" /> : <X size={15} className="mt-0.5 shrink-0" />}
          <span>
            {right ? "Right. " : "Not quite — try another. "}
            {right ? why : null}
          </span>
        </div>
      ) : null}
    </div>
  );
}

export function PredictReveal({
  prompt,
  children,
}: {
  prompt: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="my-5 rounded-lg border border-border bg-background p-3.5">
      <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-ink-fade">
        <Eye size={12} /> think first
      </div>
      <div className="text-[15px] italic leading-snug text-ink">{prompt}</div>
      {open ? (
        <div className="mt-3 border-l-2 border-rubric pl-3 text-sm leading-relaxed text-ink animate-fade-in">
          {children}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-3 min-h-9 rounded-md border border-border bg-card px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-ink transition hover:border-rubric/40"
        >
          I have a guess — reveal
        </button>
      )}
    </div>
  );
}

export function SortBuckets({
  title,
  buckets,
  items,
}: {
  title: string;
  buckets: [string, string];
  items: Array<{ label: string; bucket: 0 | 1; why: string }>;
}) {
  const [placed, setPlaced] = useState<Record<string, 0 | 1>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [lastWhy, setLastWhy] = useState<{ ok: boolean; text: string } | null>(null);

  const remaining = items.filter((item) => placed[item.label] === undefined);
  const done = remaining.length === 0;

  const drop = (bucket: 0 | 1) => {
    if (!selected) return;
    const item = items.find((entry) => entry.label === selected);
    if (!item) return;
    if (item.bucket === bucket) {
      setPlaced((prev) => ({ ...prev, [item.label]: bucket }));
      setLastWhy({ ok: true, text: item.why });
      setSelected(null);
    } else {
      setLastWhy({ ok: false, text: `"${item.label}" doesn't go there — think again.` });
    }
  };

  return (
    <div className="my-5 rounded-lg border border-dashed border-rubric/40 bg-rubric/[0.04] p-3.5">
      <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-rubric">sort it</div>
      <div className="mb-3 text-[15px] leading-snug text-ink">{title}</div>

      {!done ? (
        <>
          <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-ink-fade">
            1 · tap an item
          </div>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {remaining.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setSelected(item.label)}
                className={`min-h-9 rounded-md border px-3 py-1.5 text-sm transition ${
                  selected === item.label
                    ? "border-transparent bg-ink text-paper"
                    : "border-border bg-background text-ink hover:border-rubric/40"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-ink-fade">
            2 · tap where it belongs
          </div>
        </>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2">
        {buckets.map((name, index) => (
          <button
            key={name}
            type="button"
            disabled={!selected}
            onClick={() => drop(index as 0 | 1)}
            className={`min-h-20 rounded-lg border p-2.5 text-left transition ${
              selected ? "border-rubric/50 bg-card hover:bg-rubric/5" : "border-border bg-background"
            }`}
          >
            <div className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-ink">{name}</div>
            <div className="flex flex-wrap gap-1">
              {items
                .filter((item) => placed[item.label] === index)
                .map((item) => (
                  <span key={item.label} className="rounded bg-ink/5 px-2 py-0.5 text-xs text-ink">
                    {item.label}
                  </span>
                ))}
            </div>
          </button>
        ))}
      </div>

      {lastWhy ? (
        <div className={`mt-3 text-sm leading-relaxed animate-fade-in ${lastWhy.ok ? "text-ink" : "text-rubric"}`}>
          {lastWhy.text}
        </div>
      ) : null}
      {done ? (
        <div className="mt-2 font-mono text-[10px] uppercase tracking-widest text-rubric">all sorted ✓</div>
      ) : null}
    </div>
  );
}

/** Inline term: tap to open a one-line definition without leaving the paragraph. */
export function TermTip({ term, children }: { term: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <span>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="cursor-help border-b border-dashed border-rubric font-medium text-ink decoration-rubric transition hover:text-rubric"
      >
        {term}
      </button>
      {open ? (
        <span className="mx-1 inline rounded bg-rubric/10 px-1.5 py-0.5 text-[0.92em] text-ink animate-fade-in">
          {children}
        </span>
      ) : null}
    </span>
  );
}
