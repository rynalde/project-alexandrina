"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, ClipboardList, RotateCcw, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ChoiceLetter, choiceClass, type ChoiceState } from "@/components/learning/Choice";
import { QUESTIONS, TOPIC_LABELS, type Question } from "@/lib/data";
import { useUiText } from "@/lib/ui-text";
import { spring } from "@/lib/motion";

interface Props {
  questions?: Question[];
  topicLabels?: Record<string, string>;
  /** the section's title and instructions, shown on their own screen before the first question */
  children?: ReactNode;
}

type View = "intro" | "exam" | "result" | "review";

/**
 * Exam mode, one screen at a time: intro → one question per screen (no feedback until the end)
 * → result → a paged review of every answer with its explanation.
 */
export default function Simulado({ questions = QUESTIONS, topicLabels = TOPIC_LABELS, children }: Props) {
  const ui = useUiText();
  const t = ui.exam;
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [view, setView] = useState<View>(children ? "intro" : "exam");
  const [pos, setPos] = useState(0);

  const total = questions.length;
  const answered = Object.keys(answers).length;
  const correctCount = questions.filter((q) => answers[q.id] === q.correct).length;
  const pct = Math.round((correctCount / total) * 100);
  const grade = t.grades[pct >= 85 ? 0 : pct >= 70 ? 1 : pct >= 55 ? 2 : 3];

  const topicResults = useMemo(() => {
    const r: Record<string, { correct: number; total: number }> = {};
    questions.forEach((q) => {
      if (!r[q.topic]) r[q.topic] = { correct: 0, total: 0 };
      r[q.topic].total++;
      if (answers[q.id] === q.correct) r[q.topic].correct++;
    });
    return r;
  }, [answers, questions]);

  const go = (next: View, at = 0) => {
    setView(next);
    setPos(at);
  };

  const reset = () => {
    setAnswers({});
    go("exam");
  };

  if (view === "intro") {
    return (
      <div>
        {children}
        <Button onClick={() => go("exam")} className="mt-6 h-12 w-full text-base">
          {ui.start}
          <ChevronRight size={18} />
        </Button>
      </div>
    );
  }

  if (view === "result") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="rounded-2xl border border-border bg-card p-5 sm:p-8"
      >
        <div className="text-center">
          <Trophy size={32} className="mx-auto text-warning" />
          <div className="mt-1 kicker text-rubric">{t.result}</div>
          <div className="mt-1 text-6xl font-semibold leading-none text-ink tabular-nums">
            {correctCount}
            <span className="text-3xl text-ink-fade">/{total}</span>
          </div>
          <div className="mt-2 text-lg font-semibold text-ink-soft">
            {pct}% — {grade}
          </div>
        </div>
        <div className="mt-6 kicker text-ink-fade">{t.byTopic}</div>
        <div className="mt-2 space-y-1.5">
          {Object.entries(topicResults).map(([topic, score]) => {
            const share = score.correct / score.total;
            return (
              <div key={topic} className="flex items-center gap-3 text-[13px]">
                <span className="w-36 truncate text-ink-soft sm:w-44">{topicLabels[topic] ?? topic}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ledge">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      share === 1 ? "bg-success" : share >= 0.5 ? "bg-warning" : "bg-danger"
                    }`}
                    style={{ width: `${share * 100}%` }}
                  />
                </div>
                <span className="w-10 text-right font-mono text-ink">
                  {score.correct}/{score.total}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button onClick={() => go("review")} className="h-12 flex-1 text-base">
            {t.review}
            <ChevronRight size={18} />
          </Button>
          <Button variant="outline" onClick={reset} className="h-12 px-5 text-[15px]">
            <RotateCcw size={16} />
            {t.retry}
          </Button>
        </div>
      </motion.div>
    );
  }

  // exam and review share one card: a question per screen
  const q = questions[pos];
  const reviewing = view === "review";
  const picked = answers[q.id];
  const last = pos === total - 1;

  const stateOf = (index: number): ChoiceState => {
    if (!reviewing) return picked === index ? "selected" : "idle";
    if (index === q.correct) return picked === index ? "correct" : "missed";
    return picked === index ? "wrong" : "dim";
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-rubric/10 text-rubric">
          <ClipboardList size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="kicker text-rubric">{reviewing ? t.review : t.progress}</div>
          <div className="mt-0.5 truncate text-[15px] font-semibold text-ink">{topicLabels[q.topic] ?? q.topic}</div>
        </div>
        <span className="shrink-0 rounded-md bg-ledge px-2 py-1 font-mono text-[12px] text-ink-soft">
          {pos + 1}/{total}
        </span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-ledge" aria-hidden="true">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={false}
          animate={{ width: `${((reviewing ? pos + 1 : answered) / total) * 100}%` }}
          transition={spring}
        />
      </div>

      <motion.div key={`${view}-${pos}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={spring}>
        <p className="mt-5 text-[17px] font-medium leading-relaxed text-ink">{q.q}</p>
        <div className="mt-4 space-y-2.5">
          {q.opts.map((option, index) => (
            <button
              key={option}
              type="button"
              disabled={reviewing}
              aria-pressed={picked === index}
              onClick={() => setAnswers((current) => ({ ...current, [q.id]: index }))}
              className={choiceClass(stateOf(index))}
            >
              <ChoiceLetter index={index} />
              <span className="flex-1 pt-0.5">{option}</span>
            </button>
          ))}
        </div>
        {reviewing && q.exp ? (
          <div className="mt-4 rounded-xl border border-ledge bg-paper p-4 text-[15px] leading-7 text-ink-soft">{q.exp}</div>
        ) : null}
      </motion.div>

      <div className="mt-5 flex gap-3">
        {pos > 0 ? (
          <Button variant="outline" onClick={() => setPos(pos - 1)} aria-label={ui.back} className="h-12 px-4">
            <ChevronLeft size={18} />
          </Button>
        ) : null}
        {reviewing ? (
          <Button onClick={() => (last ? go("result") : setPos(pos + 1))} className="h-12 flex-1 text-base">
            {last ? t.toResult : t.next}
            <ChevronRight size={18} />
          </Button>
        ) : (
          <Button
            onClick={() => (last ? go("result") : setPos(pos + 1))}
            disabled={picked === undefined || (last && answered < total)}
            className="h-12 flex-1 text-base"
          >
            {last ? t.submit : t.next}
            {last ? null : <ChevronRight size={18} />}
          </Button>
        )}
      </div>
    </div>
  );
}
