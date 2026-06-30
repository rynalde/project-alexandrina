"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import Sidebar from "./Sidebar";
import type { Section } from "@/lib/data";

interface Props {
  sections: Section[];
  current: Section;
  currentIdx: number;
  total: number;
  active: string;
  visited: Set<string>;
  onNavigate: (id: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vol?: string;
  courseTitle?: string;
}

export default function MobileHeader({
  sections,
  current,
  currentIdx,
  total,
  active,
  visited,
  onNavigate,
  open,
  onOpenChange,
  vol,
  courseTitle,
}: Props) {
  return (
    <>
      <header className="md:hidden sticky top-0 z-30 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="-ml-2"
          onClick={() => onOpenChange(true)}
        >
          <Menu size={20} className="text-ink" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-rubric truncate">
            cap. {current.num}
          </div>
          <div className="font-serif text-base italic text-ink truncate leading-tight">
            {current.title}
          </div>
        </div>
        <div className="font-mono text-[10px] text-ink-fade shrink-0">
          {currentIdx + 1}/{total}
        </div>
      </header>

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="p-0 w-[85vw] max-w-[300px] bg-card">
          <SheetTitle className="sr-only">Navegação</SheetTitle>
          <Sidebar
            sections={sections}
            active={active}
            visited={visited}
            onNavigate={(id) => {
              onNavigate(id);
              onOpenChange(false);
            }}
            vol={vol}
            courseTitle={courseTitle}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
