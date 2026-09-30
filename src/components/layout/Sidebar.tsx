"use client";

import { Check } from "lucide-react";
import type { Section } from "@/lib/data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "motion/react";
import { snappy } from "@/lib/motion";
import { useUiText } from "@/lib/ui-text";

interface Props {
  sections: Section[];
  active: string;
  visited: Set<string>;
  onNavigate: (id: string) => void;
  vol?: string;
  courseTitle?: string;
  /** unique per mounted instance so the active highlight glides within its own list */
  layoutId?: string;
}

/** Brilliant-style segmented bar: one segment per chapter. */
export function SectionProgress({
  sections,
  active,
  visited,
  className = "",
}: {
  sections: Section[];
  active: string;
  visited: Set<string>;
  className?: string;
}) {
  return (
    <div className={`flex gap-1 ${className}`} aria-hidden="true">
      {sections.map((s) => (
        <span
          key={s.id}
          className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
            s.id === active
              ? "bg-primary"
              : visited.has(s.id)
                ? "bg-success"
                : "bg-ledge"
          }`}
        />
      ))}
    </div>
  );
}

export default function Sidebar({
  sections,
  active,
  visited,
  onNavigate,
  vol,
  courseTitle,
  layoutId = "chapter-active",
}: Props) {
  const t = useUiText();
  const done = sections.filter((s) => visited.has(s.id)).length;

  return (
    <div className="flex h-full flex-col bg-chrome">
      {/* Header */}
      <div className="shrink-0 border-b border-ledge p-5">
        {vol && (
          <div className="kicker text-rubric">
            {vol} · {t.notebook}
          </div>
        )}
        {courseTitle && (
          <h1 className="mt-1 text-lg font-semibold leading-tight text-ink">
            {courseTitle}
          </h1>
        )}
        <div className="mt-3 flex items-baseline justify-between text-[12px] text-ink-soft">
          <span>{t.progress}</span>
          <span className="font-mono text-ink">
            {done}/{sections.length}
          </span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ledge">
          <div
            className="h-full rounded-full bg-success transition-[width] duration-500"
            style={{ width: `${(done / sections.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Chapter path */}
      <ScrollArea className="min-h-0 flex-1 overflow-hidden">
        <nav aria-label={t.chapters} className="p-3">
          <ol>
            {sections.map((s, index) => {
              const isActive = active === s.id;
              const isVisited = visited.has(s.id) && !isActive;
              const isLast = index === sections.length - 1;
              return (
                <li key={s.id} className="relative pb-2">
                  {/* path connector: runs in the node column, 4px clear of both nodes */}
                  {!isLast && (
                    <span
                      aria-hidden="true"
                      className={`absolute left-[15px] top-12 -bottom-2 w-0.5 rounded-full ${
                        isVisited ? "bg-success/60" : "bg-ledge"
                      }`}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => onNavigate(s.id)}
                    aria-current={isActive ? "step" : undefined}
                    className="group flex w-full items-start gap-2 text-left"
                  >
                    <span
                      className={`mt-3 flex size-8 shrink-0 items-center justify-center rounded-full border-2 font-mono text-[11px] font-semibold transition-colors ${
                        isActive
                          ? "border-[#86efac] bg-primary text-black"
                          : isVisited
                            ? "border-success bg-[#052e16] text-success"
                            : "border-ledge bg-paper text-ink-soft group-hover:border-rubric/60"
                      }`}
                    >
                      {isVisited ? <Check size={14} strokeWidth={3} /> : s.num}
                    </span>
                    <span
                      className={`relative min-w-0 flex-1 rounded-lg px-3 py-2 transition-colors ${
                        isActive ? "" : "group-hover:bg-raised"
                      }`}
                    >
                      {isActive ? (
                        <motion.span
                          layoutId={layoutId}
                          transition={snappy}
                          className="absolute inset-0 rounded-lg border border-[#166534] bg-[#0d2818]"
                        />
                      ) : null}
                      <span
                        className={`relative block text-[14px] font-medium leading-snug ${
                          isActive ? "text-white" : "text-ink"
                        }`}
                      >
                        {s.title}
                      </span>
                      <span
                        className={`relative mt-0.5 block truncate text-[12px] ${
                          isActive ? "text-[#bbf7d0]" : "text-ink-fade"
                        }`}
                      >
                        {s.subtitle}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="shrink-0 border-t border-ledge p-5">
        <div className="kicker text-ink-fade">
          baseado no histórico 2021 — 2025
        </div>
      </div>
    </div>
  );
}
