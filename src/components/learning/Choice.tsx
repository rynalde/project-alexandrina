"use client";

import { useContext, useEffect, useState, type ReactNode } from "react";
import { ClipboardList, RotateCcw, Trophy } from "lucide-react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "motion/react";
import { lively, spring } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import type { Question } from "@/lib/data";
import { LangContext, UI_TEXT, type Lang } from "@/lib/ui-text";
import { useBeatGate } from "@/components/learning/Beats";

/**
 * Brilliant-style answering: pick a tile, press Check, get a feedback banner,
 * then Continue. Shared by every quiz so they all feel the same.
 */

export type ChoiceState = "idle" | "selected" | "correct" | "wrong" | "missed" | "dim";

const CHOICE_TONE: Record<ChoiceState, string> = {
  idle: "border-ledge bg-raised text-ink hover:border-rubric/70 hover:bg-[#232326]",
  selected: "border-primary bg-primary/25 text-white",
  correct: "border-success bg-success/15 text-ink animate-pop",
  wrong: "border-danger bg-danger/15 text-ink animate-shake",
  missed: "border-success/60 bg-success/5 text-ink",
  dim: "border-ledge bg-raised/50 text-ink-fade",
};

export function choiceClass(state: ChoiceState, extra = "") {
  return `flex min-h-12 w-full items-start gap-3 rounded-xl border border-b-3 chonk px-3.5 py-3 text-left text-[15px] leading-snug ${CHOICE_TONE[state]} ${extra}`;
}

export function ChoiceLetter({ index }: { index: number }) {
  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-black/25 font-mono text-[12px] font-semibold">
      {String.fromCharCode(65 + index)}
    </span>
  );
}

export function Feedback({
  ok,
  title,
  children,
  action,
}: {
  ok: boolean;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={ok ? lively : spring}
      className={`mt-4 rounded-xl border p-4 ${
        ok ? "border-success/40 bg-success/10" : "border-danger/40 bg-danger/10"
      }`}
    >
      <div
        className={`flex items-center gap-2 text-base font-semibold ${
          ok ? "text-success" : "text-danger"
        }`}
      >
        <span
          className={`flex size-7 items-center justify-center rounded-full text-ledge ${
            ok ? "bg-success" : "bg-danger"
          }`}
        >
          <DrawnMark ok={ok} />
        </span>
        {title}
      </div>
      {children ? <div className="mt-2 text-[15px] leading-7 text-ink-soft">{children}</div> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </motion.div>
  );
}

/** Check / cross that draws itself, so the verdict reads as an event rather than a static icon. */
function DrawnMark({ ok }: { ok: boolean }) {
  const draw = (delay: number) => ({
    initial: { pathLength: 0 },
    animate: { pathLength: 1 },
    transition: { duration: 0.3, ease: "easeOut" as const, delay },
  });
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ok ? (
        <motion.path d="M5 12.5l4.5 4.5L19 7.5" {...draw(0.1)} />
      ) : (
        <>
          <motion.path d="M6.5 6.5l11 11" {...draw(0.1)} />
          <motion.path d="M17.5 6.5l-11 11" {...draw(0.22)} />
        </>
      )}
    </svg>
  );
}

function CountUp({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  useEffect(() => {
    const controls = animate(count, value, { duration: 0.8, ease: "easeOut" });
    return () => controls.stop();
  }, [count, value]);
  return <motion.span>{rounded}</motion.span>;
}

/** One question per screen. The first try is scored; missed questions come back at the end
 *  until they are answered right (Duolingo's mistake loop), without changing the score. */
export function QuestionStepper({
  questions,
  title,
  kicker = "checkpoint",
  lang,
  onComplete,
}: {
  questions: Question[];
  title: string;
  kicker?: string;
  /** defaults to the course language */
  lang?: Lang;
  onComplete?: (correct: number, missedTopics: string[]) => void;
}) {
  const course = useContext(LangContext);
  const t = UI_TEXT[lang ?? course].quiz;
  const total = questions.length;
  // queue of question indices; a miss is appended again, so it returns after the first pass
  const [queue, setQueue] = useState(() => questions.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  const done = pos >= queue.length;
  useBeatGate(done);

  if (!total) return null;

  const inReview = pos >= total;
  const question = questions[queue[Math.min(pos, queue.length - 1)]];
  const ok = picked === question.correct;
  const correctCount = results.filter(Boolean).length;
  const left = queue.length - pos;

  const check = () => {
    if (picked === null || checked) return;
    setChecked(true);
    if (!ok) setQueue((items) => [...items, queue[pos]]);
    if (inReview) return;
    const next = [...results, ok];
    setResults(next);
    if (next.length === total) {
      onComplete?.(
        next.filter(Boolean).length,
        questions.filter((_, i) => !next[i]).map((q) => q.topic)
      );
    }
  };

  const advance = () => {
    setPos((value) => value + 1);
    setPicked(null);
    setChecked(false);
  };

  const reset = () => {
    setQueue(questions.map((_, i) => i));
    setPos(0);
    setPicked(null);
    setChecked(false);
    setResults([]);
  };

  const stateOf = (optionIndex: number): ChoiceState => {
    if (!checked) return picked === optionIndex ? "selected" : "idle";
    if (optionIndex === picked) return ok ? "correct" : "wrong";
    if (optionIndex === question.correct) return "missed";
    return "dim";
  };

  return (
    <div className="my-8 rounded-2xl border border-border bg-card p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-rubric/10 text-rubric">
          {inReview && !done ? <RotateCcw size={17} /> : <ClipboardList size={17} />}
        </span>
        <div className="min-w-0 flex-1">
          <div className={`kicker ${inReview && !done ? "text-warning" : "text-rubric"}`}>
            {inReview && !done ? t.fixKicker : kicker}
          </div>
          <h3 className="mt-0.5 text-lg font-semibold leading-tight text-ink">{title}</h3>
        </div>
        <span className="shrink-0 rounded-md bg-ledge px-2 py-1 font-mono text-[12px] text-ink-soft">
          {inReview && !done ? t.fixLeft(left) : `${Math.min(pos + 1, total)}/${total}`}
        </span>
      </div>
      <div className="mt-4 flex gap-1" aria-hidden="true">
        {questions.map((q, i) => (
          <span
            key={q.id}
            className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
              i < results.length
                ? results[i]
                  ? "bg-success"
                  : "bg-danger"
                : i === pos
                  ? "bg-primary"
                  : "bg-ledge"
            }`}
          />
        ))}
      </div>

      <div className="relative">
      <AnimatePresence mode="popLayout" initial={false}>
      {done ? (
        <motion.div
          key="result"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          className="mt-6 text-center"
        >
          <motion.div
            initial={{ scale: 0.4, opacity: 0, rotate: -12 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ ...lively, delay: 0.1 }}
          >
            <Trophy size={32} className="mx-auto text-warning" />
          </motion.div>
          <div className="mt-2 text-4xl font-semibold text-ink tabular-nums">
            <CountUp value={correctCount} />
            <span className="text-2xl text-ink-fade">/{total}</span>
          </div>
          <p className="mt-1 text-[15px] text-ink-soft">
            {correctCount === total
              ? t.perfect
              : correctCount * 2 >= total
                ? t.good
                : t.review}
          </p>
          <Button variant="outline" onClick={reset} className="mt-5 h-11 px-5">
            <RotateCcw size={16} />
            {t.retry}
          </Button>
        </motion.div>
      ) : (
        <motion.div
          key={`${question.id}-${pos}`}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          className="mt-5"
        >
          <p className="text-[17px] font-medium leading-relaxed text-ink">{question.q}</p>
          <div className="mt-4 space-y-2.5">
            {question.opts.map((option, optionIndex) => (
              <button
                key={option}
                type="button"
                disabled={checked}
                aria-pressed={picked === optionIndex}
                onClick={() => setPicked(optionIndex)}
                className={choiceClass(stateOf(optionIndex))}
              >
                <ChoiceLetter index={optionIndex} />
                <span className="flex-1 pt-0.5">{option}</span>
              </button>
            ))}
          </div>

          {checked ? (
            <Feedback
              ok={ok}
              title={ok ? t.correct : t.wrong}
              action={
                <Button onClick={advance} className="h-12 w-full text-base">
                  {pos === queue.length - 1 ? t.finish : t.next}
                </Button>
              }
            >
              {question.exp}
            </Feedback>
          ) : (
            <Button onClick={check} disabled={picked === null} className="mt-5 h-12 w-full text-base">
              {t.check}
            </Button>
          )}
        </motion.div>
      )}
      </AnimatePresence>
      </div>
    </div>
  );
}
