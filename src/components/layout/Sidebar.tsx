"use client";

import { CircleDot } from "lucide-react";
import type { Section } from "@/lib/data";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
  sections: Section[];
  active: string;
  visited: Set<string>;
  onNavigate: (id: string) => void;
  vol?: string;
  courseTitle?: string;
}

export default function Sidebar({ sections, active, visited, onNavigate, vol, courseTitle }: Props) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-border shrink-0">
        {vol && (
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-rubric">
            {vol} · caderno
          </div>
        )}
        {courseTitle && (
          <h1 className="font-serif text-xl sm:text-2xl italic text-ink mt-1 leading-tight">
            {courseTitle}
          </h1>
        )}
        <div className="font-sans text-[11px] text-ink-fade mt-2 tracking-wide">
          {visited.size}/{sections.length} sessões visitadas
        </div>
        <div className="mt-2">
          <Progress
            value={(visited.size / sections.length) * 100}
            className="h-1 bg-paper"
          />
        </div>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 min-h-0 overflow-hidden">
        <nav className="py-4">
          {sections.map((s) => {
            const isActive = active === s.id;
            const isVisited = visited.has(s.id);
            return (
              <button
                key={s.id}
                onClick={() => onNavigate(s.id)}
                className={`w-full text-left px-5 sm:px-6 py-3 transition border-l-2 ${
                  isActive
                    ? "bg-background border-l-rubric"
                    : "border-l-transparent hover:bg-background/50"
                }`}
              >
                <div className="flex items-baseline gap-3">
                  <span
                    className={`font-mono text-[10px] shrink-0 ${
                      isActive ? "text-rubric" : "text-ink-fade"
                    }`}
                  >
                    {s.num}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-serif text-[14px] sm:text-[15px] leading-tight ${
                        isActive ? "text-ink" : "text-muted-foreground"
                      }`}
                    >
                      {s.title}
                    </div>
                    <div className="font-sans text-[10px] sm:text-[11px] text-ink-fade mt-0.5 truncate">
                      {s.subtitle}
                    </div>
                  </div>
                  {isVisited && !isActive && (
                    <CircleDot
                      size={10}
                      className="text-rubric opacity-50 mt-1 shrink-0"
                    />
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-5 sm:p-6 border-t border-border shrink-0">
        <div className="font-mono text-[9px] uppercase tracking-widest text-ink-fade">
          baseado no histórico
          <br />
          2021 — 2025
        </div>
      </div>
    </div>
  );
}
