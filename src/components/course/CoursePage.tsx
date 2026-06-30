"use client";

import { useState, useRef, type ComponentType } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Section } from "@/lib/data";
import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";

interface Props {
  sections: Section[];
  sectionComponents: Record<string, ComponentType>;
  vol?: string;
  courseTitle?: string;
}

export default function CoursePage({ sections, sectionComponents, vol, courseTitle }: Props) {
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const [visited, setVisited] = useState(new Set([sections[0]?.id ?? ""]));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  const goTo = (id: string) => {
    setActive(id);
    setVisited((v) => new Set([...v, id]));
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentIdx = sections.findIndex((s) => s.id === active);
  const current = sections[currentIdx];
  const prev = sections[currentIdx - 1];
  const next = sections[currentIdx + 1];

  const ActiveSection = sectionComponents[active];

  return (
    <div className="paper-texture min-h-screen font-sans text-ink">
      <MobileHeader
        sections={sections}
        current={current}
        currentIdx={currentIdx}
        total={sections.length}
        active={active}
        visited={visited}
        onNavigate={goTo}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        vol={vol}
        courseTitle={courseTitle}
      />

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex md:sticky md:top-0 md:h-screen md:w-72 shrink-0 flex-col bg-card border-r border-border overflow-hidden">
          <Sidebar
            sections={sections}
            active={active}
            visited={visited}
            onNavigate={goTo}
            vol={vol}
            courseTitle={courseTitle}
          />
        </aside>

        {/* Main content */}
        <main
          ref={mainRef}
          className="flex-1 min-w-0 md:h-screen md:overflow-y-auto custom-scrollbar"
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-8 md:px-12 lg:px-16 py-8 sm:py-12 md:py-16">
            <div key={active} className="animate-fade-in">
              {ActiveSection ? <ActiveSection /> : null}
            </div>

            {/* Prev / Next navigation */}
            <div className="mt-16 sm:mt-20 pt-6 sm:pt-8 border-t border-border flex items-start justify-between gap-3">
              {prev ? (
                <button
                  onClick={() => goTo(prev.id)}
                  className="group flex items-start gap-2 sm:gap-3 text-left max-w-[45%]"
                >
                  <ChevronLeft
                    size={16}
                    className="mt-1 text-ink-fade group-hover:text-rubric transition shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-ink-fade">
                      anterior
                    </div>
                    <div className="font-serif italic text-[14px] sm:text-[17px] text-ink group-hover:text-rubric transition truncate">
                      {prev.title}
                    </div>
                  </div>
                </button>
              ) : (
                <div />
              )}

              {next && (
                <button
                  onClick={() => goTo(next.id)}
                  className="group flex items-start gap-2 sm:gap-3 text-right max-w-[45%] ml-auto"
                >
                  <div className="min-w-0">
                    <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-ink-fade">
                      próximo
                    </div>
                    <div className="font-serif italic text-[14px] sm:text-[17px] text-ink group-hover:text-rubric transition truncate">
                      {next.title}
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className="mt-1 text-ink-fade group-hover:text-rubric transition shrink-0"
                  />
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
