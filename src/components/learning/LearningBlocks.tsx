"use client";

import { Children, isValidElement, useContext, useEffect, useMemo, useState, type ReactElement, type ReactNode } from "react";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  CircleCheck,
  Eye,
  Layers,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RANTIA_QUESTIONS } from "@/lib/rantia-data";
import type { Question } from "@/lib/data";
import { useLearningProgress } from "@/components/learning/LearningProgressProvider";
import { QuestionStepper } from "@/components/learning/Choice";
import { useUiText, type Lang } from "@/lib/ui-text";
import { LessonStepsContext } from "@/components/course/CoursePage";
import Beats, { IntroContext } from "@/components/learning/Beats";
import { motion } from "motion/react";
import { spring } from "@/lib/motion";

export function LearningObjectives({
  sectionId,
  items,
}: {
  sectionId: string;
  items: string[];
}) {
  const learning = useLearningProgress();
  const t = useUiText();
  const inIntro = useContext(IntroContext);
  const done = learning?.progress.completedSections.includes(sectionId);

  // Open on the chapter's intro screen; collapsed when it shares a screen with the lesson.
  return (
    <details open={inIntro || undefined} className="group mb-10 rounded-xl border border-ledge bg-chrome/60 px-4 py-3">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-[14px] text-ink-soft transition hover:text-ink [&::-webkit-details-marker]:hidden">
        <Target size={15} className="text-rubric" />
        <span>
          {t.goals} ({items.length})
        </span>
        {done ? (
          <span className="flex items-center gap-1 text-[13px] text-success">
            <CircleCheck size={13} /> {t.done}
          </span>
        ) : null}
        <ChevronDown size={15} className="ml-auto transition-transform group-open:rotate-180" />
      </summary>
      <ul className="mt-3 space-y-2 border-t border-ledge pt-3">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-[15px] leading-6 text-ink">
            <Check size={15} className="mt-1 shrink-0 text-rubric" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}

type MobileStepScreenProps = {
  label: string;
  title?: string;
  children: ReactNode;
};

export function MobileStepScreen({ children }: MobileStepScreenProps) {
  return <>{children}</>;
}

export function MobileStepScreens({ children }: { children: ReactNode }) {
  const steps = Children.toArray(children).filter(
    (child): child is ReactElement<MobileStepScreenProps> =>
      isValidElement<MobileStepScreenProps>(child)
  );
  // Step state lives in CoursePage so its top bar tabs and Continue button drive it.
  const lesson = useContext(LessonStepsContext);
  const register = lesson?.registerSteps;
  const labelKey = steps.map((step) => step.props.label).join("\u0000");
  const active = lesson ? Math.min(lesson.step, steps.length - 1) : -1;

  useEffect(() => {
    if (!register) return;
    register(labelKey.split("\u0000"));
    return () => register(null);
  }, [register, labelKey]);

  if (!steps.length) return null;

  return (
    <div>
      {steps.map((step, index) => (
        <motion.section
          key={`${step.props.label}-${index}`}
          aria-label={step.props.title ?? step.props.label}
          className={active === -1 || index === active ? "" : "hidden"}
          // hidden steps park off to their side, so a step always enters from where it sits
          initial={false}
          animate={
            active === -1 || index === active
              ? { opacity: 1, x: 0 }
              : { opacity: 0, x: index < active ? -40 : 40 }
          }
          transition={spring}
        >
          <Beats active={index === active}>{step.props.children}</Beats>
        </motion.section>
      ))}
    </div>
  );
}

/** Tells MdxLesson that everything above this element is the chapter's intro screen. */
MobileStepScreens.lessonSteps = true;

/** The step name now lives in the header tabs, so this marker renders nothing. */
export function LessonStage() {
  return null;
}
// renders nothing, so it must not claim a screen (see Beats)
LessonStage.aside = true;

export function ConceptFlow({
  title = "fluxo",
  steps,
}: {
  title?: string;
  steps: string[];
}) {
  return (
    <div className="my-6 rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-rubric/10 text-rubric">
          <Layers size={15} />
        </span>
        <span className="text-[15px] font-semibold text-white first-letter:uppercase">{title}</span>
      </div>
      <ol className="space-y-2">
        {steps.map((step, index) => (
          <li
            key={`${step}-${index}`}
            className="flex gap-3 rounded-lg bg-paper/70 px-3 py-2.5 text-[15px] leading-6 text-ink"
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-rubric/15 font-mono text-[12px] text-rubric">
              {index + 1}
            </span>
            <span className="pt-px">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function ImportantBlock({
  title = "importante",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <aside className="my-8 rounded-r-xl border-l-4 border-rubric bg-rubric/[0.07] py-4 pl-5 pr-5">
      <div className="mb-1.5 flex items-center gap-2 text-[16px] font-semibold text-white">
        <CircleCheck size={16} className="shrink-0 text-rubric" />
        <span className="first-letter:uppercase">{title}</span>
      </div>
      <div className="text-[16px] leading-7 text-ink-soft">{children}</div>
    </aside>
  );
}

/** Callouts decorate the screen they follow instead of getting one of their own (see Beats). */
ImportantBlock.aside = true;

export function ExamTrap({
  title = "armadilha de exame",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <aside className="my-8 rounded-r-xl border-l-4 border-warning/80 bg-warning/[0.06] py-4 pl-5 pr-5">
      <div className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider text-warning">
        <AlertTriangle size={14} className="shrink-0" />
        {title}
      </div>
      <div className="text-[16px] leading-7 text-ink-soft">{children}</div>
    </aside>
  );
}

ExamTrap.aside = true;

/** A quiz always gets a screen of its own (see Beats). */
SectionQuiz.screen = true;

export function SectionQuiz({
  sectionId,
  topic,
  title = "Checkpoint",
  source = RANTIA_QUESTIONS,
  lang,
}: {
  sectionId: string;
  topic: string;
  title?: string;
  source?: Question[];
  /** defaults to the course language */
  lang?: Lang;
}) {
  const t = useUiText();
  const questions = useMemo(
    () => source.filter((question) => question.topic === topic),
    [source, topic]
  );
  const learning = useLearningProgress();

  if (questions.length === 0) {
    return (
      <div className="my-8 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        {t.noQuestions}
      </div>
    );
  }

  return (
    <QuestionStepper
      questions={questions}
      title={title}
      kicker={t.checkpointKicker}
      lang={lang}
      onComplete={(correct, missed) =>
        learning?.recordQuizScore(
          sectionId,
          { correct, total: questions.length },
          missed
        )
      }
    />
  );
}

export function FlashcardDrill({
  sectionId,
  title = "flashcards",
  cards,
}: {
  sectionId: string;
  title?: string;
  cards: Array<{ front: string; back: string }>;
}) {
  const learning = useLearningProgress();
  const t = useUiText();
  const [active, setActive] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = cards[active];

  if (!card) return null;

  const next = () => {
    const nextIndex = active + 1;
    if (nextIndex >= cards.length) {
      learning?.markSectionComplete(sectionId);
      setActive(0);
    } else {
      setActive(nextIndex);
    }
    setFlipped(false);
  };

  return (
    <div className="my-6 rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="kicker text-rubric">
          {title}
        </div>
        <div className="kicker text-ink-fade">
          {active + 1}/{cards.length}
        </div>
      </div>
      <div className="mb-3 flex gap-1">
        {cards.map((item, index) => (
          <span
            key={item.front}
            className={`h-1.5 flex-1 rounded-full ${
              index <= active ? "bg-rubric" : "bg-border"
            }`}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={() => setFlipped((value) => !value)}
        className="min-h-32 w-full rounded-lg border border-border bg-background p-4 text-left transition hover:border-rubric/30"
      >
        <div className="font-serif font-semibold text-lg text-ink">
          {flipped ? card.back : card.front}
        </div>
        <div className="mt-3 kicker text-ink-fade">
          {t.flashTo(flipped)}
        </div>
      </button>
      <Button type="button" size="sm" onClick={next} className="mt-3 h-10">
        {t.next}
      </Button>
    </div>
  );
}

export function MatchingDrill({
  sectionId,
  title = "associação",
  pairs,
}: {
  sectionId: string;
  title?: string;
  pairs: Array<{ prompt: string; answer: string }>;
}) {
  const learning = useLearningProgress();
  const t = useUiText();
  const [active, setActive] = useState(0);
  const [choice, setChoice] = useState("");
  const [completed, setCompleted] = useState<string[]>([]);
  const answers = useMemo(
    () => Array.from(new Set(pairs.map((pair) => pair.answer))).sort(),
    [pairs]
  );
  const current = pairs[active];
  const isCorrect = Boolean(current && choice === current.answer);
  const allDone = pairs.length > 0 && completed.length === pairs.length;
  const alreadyComplete = learning?.progress.completedSections.includes(sectionId);

  useEffect(() => {
    if (allDone && !alreadyComplete) learning?.markSectionComplete(sectionId);
  }, [allDone, alreadyComplete, learning, sectionId]);

  if (!current) {
    return (
      <div className="my-6 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        {t.noPairs}
      </div>
    );
  }

  const advance = () => {
    if (!isCorrect) return;

    setCompleted((items) =>
      items.includes(current.prompt) ? items : [...items, current.prompt]
    );

    if (active < pairs.length - 1) {
      setActive((value) => value + 1);
    }
    setChoice("");
  };

  const reset = () => {
    setActive(0);
    setChoice("");
    setCompleted([]);
  };

  if (allDone) {
    return (
      <div className="my-6 rounded-xl border border-border bg-card p-4">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-[rgba(134,239,172,0.35)] bg-[rgba(134,239,172,0.1)] text-[#86efac]">
            <CircleCheck size={16} />
          </span>
          <div>
            <div className="kicker text-rubric">
              {title}
            </div>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {t.matchDone}
            </p>
          </div>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={reset} className="mt-4 h-10">
          {t.repeat}
        </Button>
      </div>
    );
  }

  return (
    <div className="my-6 rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="kicker text-rubric">
          {title}
        </div>
        <div className="kicker text-ink-fade">
          {active + 1}/{pairs.length}
        </div>
      </div>
      <div className="mb-4 flex gap-1">
        {pairs.map((pair, index) => (
          <span
            key={pair.prompt}
            className={`h-1.5 flex-1 rounded-full ${
              completed.includes(pair.prompt) || index === active
                ? "bg-rubric"
                : "bg-border"
            }`}
          />
        ))}
      </div>
      <div className="rounded-lg border border-border bg-background p-4">
        <div className="kicker text-ink-fade">
          {t.matchItem}
        </div>
        <div className="mt-2 font-serif font-semibold text-xl leading-tight text-ink">
          {current.prompt}
        </div>
      </div>
      <div className="mt-4 grid gap-2">
        {answers.map((answer) => (
          <button
            key={answer}
            type="button"
            aria-pressed={choice === answer}
            onClick={() => setChoice(answer)}
            className={`min-h-11 rounded-lg border px-3 py-3 text-left text-sm leading-5 transition ${
              choice !== answer
                ? "border-border bg-background text-ink hover:border-rubric/30"
                : isCorrect
                  ? "border-success/60 bg-success/15 text-white"
                  : "border-danger/60 bg-danger/10 text-white"
            }`}
          >
            {answer}
          </button>
        ))}
      </div>
      {choice ? (
        <div
          className={`mt-3 rounded-md border p-3 text-sm leading-relaxed ${
            isCorrect
              ? "border-[rgba(134,239,172,0.35)] bg-[rgba(134,239,172,0.1)] text-[#86efac]"
              : "border-danger/40 bg-danger/10 text-danger animate-shake"
          }`}
        >
          {isCorrect ? t.matchRight : t.matchWrong}
        </div>
      ) : null}
      <Button
        type="button"
        size="sm"
        onClick={advance}
        disabled={!isCorrect}
        className="mt-4 h-10 w-full sm:w-auto"
      >
        {active === pairs.length - 1 ? t.finish : t.next}
      </Button>
    </div>
  );
}

export function ProgressSummary() {
  const learning = useLearningProgress();

  if (!learning) return null;

  const sectionTotal = Object.keys(learning.config.sections).length;
  const completed = learning.progress.completedSections.length;
  const weakTopics = learning.progress.weakTopics.slice(0, 4);

  return (
    <div className="my-6 rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <Eye size={15} className="text-rubric" />
        <span className="kicker text-rubric">
          progresso local
        </span>
      </div>
      <div className="font-serif font-semibold text-3xl text-ink">
        {completed}
        <span className="text-xl text-ink-fade">/{sectionTotal}</span>
      </div>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        Seções concluídas neste browser. Os dados ficam apenas neste dispositivo.
      </p>
      {weakTopics.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {weakTopics.map((topic) => (
            <span
              key={topic}
              className="rounded-md border border-rubric/30 bg-rubric/10 px-2 py-1 kicker text-rubric"
            >
              rever {topic}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
