"use client";

import { useState, type ReactNode } from "react";
import { Eye, Lightbulb, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChoiceLetter, choiceClass, Feedback, type ChoiceState } from "@/components/learning/Choice";
import { useBeatGate } from "@/components/learning/Beats";

/**
 * Micro-interactions: small, inline, low-friction checks that sit inside the
 * chapter text. They never block progress and don't write to the progress store.
 */

export function QuickCheck({
  q,
  options,
  correct,
  why,
  hint = "One of the other options fits better. Look at them again.",
}: {
  q: string;
  options: string[];
  correct: number;
  why: string;
  /** shown after the first miss; the answer and `why` come after the second */
  hint?: string;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  // options already tried and missed stay crossed out, Brilliant-style
  const [crossed, setCrossed] = useState<number[]>([]);
  const right = checked && picked === correct;
  const revealed = right || crossed.length >= 2;
  useBeatGate(revealed);

  const check = () => {
    if (picked === null) return;
    setChecked(true);
    if (picked !== correct) setCrossed((items) => [...items, picked]);
  };

  const stateOf = (index: number): ChoiceState => {
    if (checked && index === picked) return right ? "correct" : "wrong";
    if (revealed && index === correct) return "missed";
    if (checked || crossed.includes(index)) return "dim";
    return picked === index ? "selected" : "idle";
  };

  return (
    <div className="my-6 rounded-xl border border-practice/35 bg-practice/[0.06] p-4">
      <div className="mb-2 flex items-center gap-2 kicker text-practice">
        <Lightbulb size={13} /> Quick check
      </div>
      <div className="mb-3 text-[16px] font-medium leading-snug text-ink">{q}</div>
      <div className="grid gap-2">
        {options.map((option, index) => (
          <button
            key={option}
            type="button"
            disabled={checked || crossed.includes(index)}
            aria-pressed={picked === index}
            onClick={() => setPicked(index)}
            className={choiceClass(stateOf(index), crossed.includes(index) && index !== picked ? "line-through" : "")}
          >
            <ChoiceLetter index={index} />
            <span className="flex-1 pt-0.5">{option}</span>
          </button>
        ))}
      </div>
      {checked ? (
        <Feedback
          ok={right}
          title={right ? "Correct!" : "Not quite"}
          action={
            revealed ? null : (
              <Button
                variant="outline"
                onClick={() => {
                  setPicked(null);
                  setChecked(false);
                }}
                className="h-10 px-4"
              >
                <RotateCcw size={15} />
                Try again
              </Button>
            )
          }
        >
          {revealed ? why : hint}
        </Feedback>
      ) : (
        <Button onClick={check} disabled={picked === null} className="mt-3 h-11 px-6 text-[15px]">
          Check
        </Button>
      )}
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
  useBeatGate(open);
  return (
    <div className="my-6 rounded-xl border border-info/30 bg-info/[0.05] p-4">
      <div className="mb-2 flex items-center gap-2 kicker text-info">
        <Eye size={12} /> Think first
      </div>
      <div className="text-[16px] font-medium leading-snug text-ink">{prompt}</div>
      {open ? (
        <div className="mt-3 rounded-lg border-l-4 border-info bg-info/10 py-2 pl-3 pr-2 text-[15px] leading-7 text-ink animate-rise">
          {children}
        </div>
      ) : (
        <Button variant="outline" onClick={() => setOpen(true)} className="mt-3 h-10 px-4">
          <Eye size={15} />
          I have a guess — reveal
        </Button>
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
  useBeatGate(done);

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
    <div className="my-6 rounded-xl border border-practice/35 bg-practice/[0.06] p-4">
      <div className="mb-1 kicker text-practice">sort it</div>
      <div className="mb-3 text-[16px] font-medium leading-snug text-ink">{title}</div>

      {!done ? (
        <>
          <div className="mb-1 kicker text-ink-fade">
            1 · tap an item
          </div>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {remaining.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setSelected(item.label)}
                className={`min-h-10 rounded-lg border border-b-3 chonk px-3 py-1.5 text-sm ${
                  selected === item.label
                    ? "border-rubric/60 bg-rubric/15 text-white"
                    : "border-ledge bg-raised text-ink hover:border-rubric/70"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="mb-1 kicker text-ink-fade">
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
            className={`min-h-20 rounded-xl border border-b-3 p-3 text-left transition ${
              selected ? "border-rubric/70 bg-card hover:bg-rubric/10" : "border-ledge bg-paper"
            }`}
          >
            <div className="mb-1.5 kicker text-ink">{name}</div>
            <div className="flex flex-wrap gap-1">
              {items
                .filter((item) => placed[item.label] === index)
                .map((item) => (
                  <span key={item.label} className="rounded-md bg-success/15 px-2 py-0.5 text-xs text-ink animate-pop">
                    {item.label}
                  </span>
                ))}
            </div>
          </button>
        ))}
      </div>

      {lastWhy ? (
        <div key={lastWhy.text} className={`mt-3 text-[15px] leading-relaxed ${lastWhy.ok ? "text-success animate-fade-in" : "text-danger animate-shake"}`}>
          {lastWhy.text}
        </div>
      ) : null}
      {done ? (
        <div className="mt-2 kicker text-success">all sorted ✓</div>
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
