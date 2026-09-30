"use client";

import { createContext, useEffect, useRef, useState, type ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen, Trophy } from "lucide-react";
import type { Section } from "@/lib/data";
import type { LearningCourseConfig } from "@/lib/course-learning";
import { saveCourseNav, useCourseNav, usePanelOpen } from "@/lib/course-nav";
import { Button, buttonVariants } from "@/components/ui/button";
import AppRail from "@/components/layout/AppRail";
import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import { LearningProgressProvider } from "@/components/learning/LearningProgressProvider";
import { AnimatePresence, motion } from "motion/react";
import { snappy, spring } from "@/lib/motion";
import { LangContext, useUiText, type Lang } from "@/lib/ui-text";

export interface BeatsApi {
  shown: number;
  total: number;
  /** the screen on view holds a question nobody has answered yet */
  pending: boolean;
  next: () => void;
  prev: () => void;
}

/**
 * Lets a chapter's intro, <MobileStepScreens> and <Beats> hand their state to the page chrome,
 * so one Continue button walks intro → screens → steps → chapters, one screen at a time.
 */
export const LessonStepsContext = createContext<{
  step: number;
  setStep: (index: number) => void;
  registerSteps: (labels: string[] | null) => void;
  registerBeats: (beats: BeatsApi | null) => void;
  /** the chapter's title-and-goals screen is on view */
  intro: boolean;
  registerIntro: (has: boolean) => void;
} | null>(null);

export function StepTabs({
  labels,
  step,
  onSelect,
  layoutId,
  className = "",
}: {
  labels: string[];
  step: number;
  onSelect: (index: number) => void;
  /** unique per mounted instance (desktop bar vs mobile header) so the pill slides within its own group */
  layoutId: string;
  className?: string;
}) {
  const t = useUiText();
  return (
    <nav
      aria-label={t.chapterSteps}
      className={`flex overflow-hidden rounded-lg border border-b-3 border-ledge bg-raised ${className}`}
    >
      {labels.map((label, index) => (
        <button
          key={`${label}-${index}`}
          type="button"
          aria-current={index === step ? "step" : undefined}
          onClick={() => onSelect(index)}
          className={`relative flex min-h-8 items-center justify-center gap-1.5 whitespace-nowrap px-3 text-[13px] font-medium capitalize transition-colors ${
            index > 0 ? "border-l border-ledge" : ""
          } ${index === step ? "text-white" : "text-ink-soft hover:bg-[#232326] hover:text-ink"}`}
        >
          {index === step ? (
            <motion.span
              layoutId={layoutId}
              transition={snappy}
              className="absolute inset-0 border-b-2 border-primary bg-[#0d2818]"
            />
          ) : null}
          <span className="relative flex items-center gap-1.5">
            {index < step ? (
              <Check size={13} strokeWidth={3} className="text-success" />
            ) : (
              <span className="font-mono text-[11px] opacity-70">{index + 1}</span>
            )}
            {label}
          </span>
        </button>
      ))}
    </nav>
  );
}

interface Props {
  sections: Section[];
  sectionComponents: Record<string, ComponentType>;
  vol?: string;
  courseTitle?: string;
  learningConfig?: LearningCourseConfig;
  /** language of the course text; the chrome follows it */
  lang?: Lang;
}

export default function CoursePage({ lang = "pt", ...props }: Props) {
  return (
    <LangContext.Provider value={lang}>
      <CourseLayout {...props} />
    </LangContext.Provider>
  );
}

function CourseLayout({
  sections,
  sectionComponents,
  vol,
  courseTitle,
  learningConfig,
}: Omit<Props, "lang">) {
  const t = useUiText();
  const pathname = usePathname();
  const saved = useCourseNav()[pathname];
  const firstId = sections[0]?.id ?? "";
  const active =
    saved && sections.some((s) => s.id === saved.active) ? saved.active : firstId;
  const visited = new Set(saved?.visited ?? [firstId]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [stepLabels, setStepLabels] = useState<string[] | null>(null);
  const [step, setStep] = useState(0);
  const [beats, setBeats] = useState<BeatsApi | null>(null);
  // every chapter opens on its title screen (when it has one)
  const [intro, setIntro] = useState(true);
  const [hasIntro, setHasIntro] = useState(false);
  const [panelOpen, setPanelOpen] = usePanelOpen();
  // +1 = moving forward through the course, -1 = back; chapters slide in from that side.
  // 0 = first paint: no entrance, so server HTML is visible before hydration.
  const [direction, setDirection] = useState(0);
  const mainRef = useRef<HTMLDivElement>(null);

  // First visit: register the course so the home page can offer "continue".
  useEffect(() => {
    if (!saved) saveCourseNav(pathname, { active: firstId, visited: [firstId], at: Date.now() });
  }, [saved, pathname, firstId]);

  // a new screen replaces the old one, so jump (don't glide) back to its top
  const scrollToTop = () => {
    mainRef.current?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  };

  const goTo = (id: string, atStep = 0) => {
    const from = sections.findIndex((s) => s.id === active);
    setDirection(sections.findIndex((s) => s.id === id) >= from ? 1 : -1);
    setStep(atStep);
    setIntro(atStep === 0);
    saveCourseNav(pathname, { active: id, visited: [...visited, id], at: Date.now() });
    scrollToTop();
  };

  const changeStep = (index: number) => {
    setStep(index);
    setIntro(false);
    scrollToTop();
  };

  const currentIdx = Math.max(0, sections.findIndex((s) => s.id === active));
  const current = sections[currentIdx];
  const prev = sections[currentIdx - 1];
  const next = sections[currentIdx + 1];

  const stepCount = stepLabels?.length ?? 0;
  const stepIdx = Math.min(step, Math.max(0, stepCount - 1));
  const hasNextStep = stepIdx < stepCount - 1;
  const hasPrevStep = stepCount > 0 && stepIdx > 0;

  const showIntro = intro && hasIntro;
  const beatsLeft = beats ? beats.total - beats.shown : 0;
  const beatsBehind = beats ? beats.shown - 1 : 0;
  const pending = !showIntro && (beats?.pending ?? false);
  const onContinue = () => {
    if (showIntro) setIntro(false);
    else if (beats && beatsLeft > 0) beats.next();
    else if (hasNextStep) return changeStep(stepIdx + 1);
    else return next && goTo(next.id);
    scrollToTop();
  };
  // Brilliant-style lesson bar: how far through this chapter (steps × screens) the reader is.
  const beatFraction = beats ? beats.shown / beats.total : 1;
  const lessonProgress = showIntro ? 0 : stepCount ? (stepIdx + beatFraction) / stepCount : beatFraction;
  // ponytail: "back" past a chapter's title screen opens the previous chapter at its title screen.
  const onBack = () => {
    if (!showIntro && beats && beatsBehind > 0) beats.prev();
    else if (!showIntro && hasPrevStep) return changeStep(stepIdx - 1);
    else if (!showIntro && hasIntro) setIntro(true);
    else return prev && goTo(prev.id);
    scrollToTop();
  };
  const canBack = showIntro ? Boolean(prev) : beatsBehind > 0 || hasPrevStep || hasIntro || Boolean(prev);

  const ActiveSection = sectionComponents[active];
  const sectionContent = (
    <LessonStepsContext.Provider
      value={{
        step: stepIdx,
        setStep: changeStep,
        registerSteps: setStepLabels,
        registerBeats: setBeats,
        intro,
        registerIntro: setHasIntro,
      }}
    >
      <motion.div
        key={active}
        initial={direction ? { opacity: 0, x: 40 * direction } : false}
        animate={{ opacity: 1, x: 0 }}
        transition={spring}
      >
        {ActiveSection ? <ActiveSection /> : null}
      </motion.div>
    </LessonStepsContext.Provider>
  );

  return (
    <div className="flex min-h-dvh flex-col bg-chrome font-sans text-ink lg:flex-row">
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
        lessonProgress={lessonProgress}
        steps={
          stepLabels ? (
            <StepTabs
              labels={stepLabels}
              step={stepIdx}
              onSelect={changeStep}
              layoutId="step-pill-mobile"
              className="w-full [&>button]:flex-1"
            />
          ) : null
        }
      />

      {/* Focus mode: rail + chapter panel slide in only when asked for */}
      <AnimatePresence initial={false}>
        {panelOpen ? (
          <motion.div
            key="panel"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 360, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={spring}
            className="hidden shrink-0 overflow-hidden lg:sticky lg:top-0 lg:flex lg:h-screen"
          >
            <div className="flex h-full w-[360px] shrink-0">
              <AppRail />
              <aside className="flex h-full w-72 shrink-0 flex-col overflow-hidden border-r border-ledge">
                <Sidebar
                  sections={sections}
                  active={active}
                  visited={visited}
                  onNavigate={goTo}
                  vol={vol}
                  courseTitle={courseTitle}
                />
              </aside>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Main content */}
      <main
        ref={mainRef}
        className="paper-texture custom-scrollbar flex min-w-0 flex-1 flex-col lg:h-screen lg:overflow-y-auto"
      >
        {/* Desktop top bar: breadcrumb · chapter steps · course progress */}
        <div className="sticky top-0 z-30 hidden h-14 shrink-0 items-center gap-4 border-b border-ledge bg-chrome px-3 lg:flex">
          <button
            type="button"
            onClick={() => setPanelOpen(!panelOpen)}
            aria-expanded={panelOpen}
            aria-label={panelOpen ? t.hideChapters : t.showChapters}
            title={panelOpen ? t.hideChapters : t.showChapters}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-ink-soft transition hover:bg-raised hover:text-ink"
          >
            {panelOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
          <nav aria-label={t.breadcrumb} className="flex min-w-0 flex-1 items-center gap-2 text-[13px] text-ink-soft">
            <Link href="/" className="shrink-0 hover:text-ink">
              {t.courses}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="hidden shrink-0 xl:inline">{courseTitle}</span>
            <span aria-hidden="true" className="hidden xl:inline">/</span>
            <span className="truncate font-medium text-ink">
              {current.num} · {current.title}
            </span>
          </nav>
          {stepLabels ? (
            <StepTabs labels={stepLabels} step={stepIdx} onSelect={changeStep} layoutId="step-pill-desktop" className="shrink-0" />
          ) : null}
          <div className="flex min-w-0 flex-1 items-center justify-end">
            <span className="shrink-0 text-[13px] text-ink-soft">{t.chapterOf(currentIdx + 1, sections.length)}</span>
          </div>
          <motion.span
            aria-hidden="true"
            className="absolute inset-x-0 -bottom-px h-0.5 origin-left bg-primary"
            initial={false}
            animate={{ scaleX: lessonProgress }}
            transition={spring}
          />
        </div>

        {/* One screen at a time: the screen fills the space between the bars, short screens sit centred */}
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 sm:px-8 lg:px-12">
          <div className="flex flex-1 flex-col justify-center py-5 sm:py-10">
            {learningConfig ? (
              <LearningProgressProvider config={learningConfig}>{sectionContent}</LearningProgressProvider>
            ) : (
              sectionContent
            )}
          </div>

          {/* One Continue bar, pinned to the bottom (Brilliant/Duolingo): next screen, then the next
              step, then the next chapter. An open question turns it into "Skip". */}
          {showIntro || beatsLeft > 0 || hasNextStep || next ? (
            <div className="sticky bottom-0 z-20 border-t border-ledge bg-paper pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
              <div className="flex gap-3">
                {canBack ? (
                  <Button variant="outline" onClick={onBack} aria-label={t.back} className="h-12 px-4 text-[15px]">
                    <ChevronLeft size={18} />
                    <span className="hidden sm:inline">{t.back}</span>
                  </Button>
                ) : null}
                <Button
                  onClick={onContinue}
                  variant={pending ? "outline" : "default"}
                  className="h-12 flex-1 text-base"
                >
                  {showIntro
                    ? t.start
                    : pending
                      ? t.skip
                      : beatsLeft > 0 || hasNextStep
                        ? t.continue
                        : t.nextChapter}
                  <ChevronRight size={18} />
                </Button>
              </div>
              {/* phones keep the space for the lesson; the top bar already shows progress */}
              <p className="mt-2 hidden min-h-7 items-center truncate text-[13px] text-ink-fade sm:flex">
                {showIntro ? (
                  <span className="truncate">
                    {t.upNext} <span className="capitalize text-ink-soft">{stepLabels?.[0] ?? current.title}</span>
                  </span>
                ) : pending ? (
                  t.answerFirst
                ) : beats && beatsLeft > 0 ? (
                  t.part(beats.shown, beats.total)
                ) : (
                  <span className="truncate">
                    {t.upNext}{" "}
                    <span className="text-ink-soft">
                      {hasNextStep ? (
                        <>
                          <span className="capitalize">{stepLabels?.[stepIdx + 1]}</span> · {t.stepOf(stepIdx + 2, stepCount)}
                        </>
                      ) : (
                        <>
                          {next?.num} · {next?.title}
                        </>
                      )}
                    </span>
                  </span>
                )}
              </p>
            </div>
          ) : (
            // last chapter: the same footer, pointing home (its own result screen is the celebration)
            <div className="sticky bottom-0 z-20 border-t border-ledge bg-paper pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
              <div className="flex gap-3">
                {canBack ? (
                  <Button variant="outline" onClick={onBack} aria-label={t.back} className="h-12 px-4 text-[15px]">
                    <ChevronLeft size={18} />
                    <span className="hidden sm:inline">{t.back}</span>
                  </Button>
                ) : null}
                <Link href="/" className={buttonVariants({ variant: "outline", className: "h-12 flex-1 text-base" })}>
                  {t.backToCourses}
                </Link>
              </div>
              <p className="mt-2 hidden min-h-7 items-center gap-1.5 text-[13px] text-ink-fade sm:flex">
                <Trophy size={14} className="text-warning" />
                {t.endTitle} · {t.visited(visited.size, sections.length)}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
