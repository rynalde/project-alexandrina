"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import Sidebar from "./Sidebar";
import type { Section } from "@/lib/data";
import { useUiText } from "@/lib/ui-text";

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
  steps?: ReactNode;
  lessonProgress?: number;
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
  steps,
  lessonProgress = 0,
}: Props) {
  const t = useUiText();
  return (
    <>
      {/* One row, Duolingo-style: menu · step tabs (or chapter title) · close */}
      <header className="sticky top-0 z-30 border-b border-ledge bg-chrome px-2 py-2 lg:hidden">
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            aria-label={t.openChapters}
            onClick={() => onOpenChange(true)}
          >
            <Menu size={20} className="text-ink" />
          </Button>
          {steps ? (
            <div className="min-w-0 flex-1">{steps}</div>
          ) : (
            <>
              <div className="min-w-0 flex-1">
                <div className="truncate kicker text-rubric">
                  {t.chapterShort} {current.num}
                </div>
                <div className="truncate text-[15px] font-semibold leading-tight text-ink">
                  {current.title}
                </div>
              </div>
              <span className="shrink-0 font-mono text-[12px] text-ink-soft">
                {currentIdx + 1}/{total}
              </span>
            </>
          )}
          <Link
            href="/"
            aria-label={t.exitToCourses}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-ink-soft hover:bg-raised hover:text-ink"
          >
            <X size={18} />
          </Link>
        </div>
        <motion.span
          aria-hidden="true"
          className="absolute inset-x-0 -bottom-px h-0.5 origin-left bg-primary"
          initial={false}
          animate={{ scaleX: lessonProgress }}
        />
      </header>

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-[85vw] max-w-[320px] border-ledge bg-chrome p-0">
          <SheetTitle className="sr-only">{t.navigation}</SheetTitle>
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
            layoutId="chapter-active-drawer"
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
