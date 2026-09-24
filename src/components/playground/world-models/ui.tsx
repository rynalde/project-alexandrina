"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useLearningProgress } from "@/components/learning/LearningProgressProvider";

export { mulberry32 } from "@/lib/world-models-sim";

/** Palette shared by every World Models interaction (matches globals.css). */
export const WM = {
  ink: "#1a1512",
  rubric: "#c7502e",
  paper: "#f5efe3",
  paperDark: "#ede4d0",
  olive: "#5f6f52",
  fade: "rgba(26,21,18,0.45)",
  faint: "rgba(26,21,18,0.12)",
} as const;

export function LabShell({
  icon,
  title,
  kicker = "interaction",
  children,
}: {
  icon: ReactNode;
  title: string;
  kicker?: string;
  children: ReactNode;
}) {
  return (
    <div className="my-6 rounded-lg border border-border bg-card p-4 shadow-[0_12px_30px_rgba(26,21,18,0.05)] sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-rubric/20 bg-rubric/10 text-rubric">
          {icon}
        </span>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-rubric">
            {kicker}
          </div>
          <div className="font-serif text-lg italic leading-tight text-ink">
            {title}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

export function CompleteButton({ interactionId }: { interactionId: string }) {
  const learning = useLearningProgress();
  const done = learning?.progress.completedInteractions.includes(interactionId);
  return (
    <Button
      type="button"
      size="sm"
      variant={done ? "outline" : "default"}
      className="mt-4 h-10"
      onClick={() => learning?.markInteractionComplete(interactionId)}
    >
      {done ? "interaction done" : "mark as done"}
    </Button>
  );
}

export function Seg<T extends string | number>({
  options,
  value,
  onChange,
  label,
}: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  label?: string;
}) {
  return (
    <div>
      {label ? (
        <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-ink-fade">
          {label}
        </div>
      ) : null}
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <button
            key={String(option.value)}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={`min-h-9 rounded-md border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition ${
              value === option.value
                ? "border-transparent bg-ink text-paper"
                : "border-border bg-background text-ink hover:border-rubric/40"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Meter({
  label,
  value,
  display,
  tone = "rubric",
}: {
  label: string;
  value: number;
  display?: string;
  tone?: "rubric" | "ink" | "olive";
}) {
  const color = tone === "rubric" ? WM.rubric : tone === "olive" ? WM.olive : WM.ink;
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div>
      <div className="mb-1 flex justify-between font-mono text-[10px] uppercase tracking-widest text-ink-fade">
        <span>{label}</span>
        <span className="text-ink">{display ?? `${Math.round(pct)}%`}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

export function Panel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="font-mono text-[10px] uppercase tracking-widest text-rubric">{label}</div>
      <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}

/** Tiny line chart for a live metric (loss, spread, energy…). Values are drawn as-is inside [min, max]. */
export function Sparkline({
  values,
  label,
  color = WM.rubric,
  min,
  max,
  display,
}: {
  values: number[];
  label: string;
  color?: string;
  min?: number;
  max?: number;
  display?: string;
}) {
  const lo = min ?? Math.min(...values, 0);
  const hi = max ?? Math.max(...values, lo + 1e-9);
  const span = hi - lo || 1;
  const points = values
    .map((v, i) => `${values.length > 1 ? (i / (values.length - 1)) * 100 : 0},${28 - ((Math.min(hi, Math.max(lo, v)) - lo) / span) * 26}`)
    .join(" ");
  return (
    <div>
      <div className="mb-1 flex justify-between font-mono text-[10px] uppercase tracking-widest text-ink-fade">
        <span>{label}</span>
        <span className="text-ink">{display ?? (values.length ? values[values.length - 1].toFixed(3) : "—")}</span>
      </div>
      <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-10 w-full rounded border border-border bg-background" role="img" aria-label={`${label} over time`}>
        {values.length > 1 ? <polyline points={points} fill="none" stroke={color} strokeWidth="1.2" vectorEffect="non-scaling-stroke" /> : null}
      </svg>
    </div>
  );
}
