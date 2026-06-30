"use client";

import { useState } from "react";
import { Check, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QUESTIONS, type Question } from "@/lib/data";

interface Props {
  topic: string;
  title?: string;
  source?: Question[];
}

export default function QuizBlock({ topic, title = "Mini-quiz", source = QUESTIONS }: Props) {
  const questions = source.filter((q) => q.topic === topic);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  const answer = (qid: number, oidx: number) => {
    if (revealed[qid]) return;
    setAnswers((s) => ({ ...s, [qid]: oidx }));
    setRevealed((s) => ({ ...s, [qid]: true }));
  };

  const reset = () => {
    setAnswers({});
    setRevealed({});
  };

  const correctCount = questions.filter(
    (q) => answers[q.id] === q.correct
  ).length;
  const allDone = questions.every((q) => revealed[q.id]);

  return (
    <div className="my-8 sm:my-10 bg-card border border-border rounded-sm p-4 sm:p-6 md:p-8">
      <div className="flex items-center justify-between mb-5 border-b border-border pb-3 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-rubric">
            Check-point
          </span>
          <h3 className="font-serif italic text-lg sm:text-xl text-ink">
            {title}
          </h3>
        </div>
        {allDone && (
          <div className="flex items-center gap-3 shrink-0">
            <span className="font-mono text-sm text-ink">
              {correctCount}/{questions.length}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={reset}
              className="h-8 w-8 text-muted-foreground hover:text-rubric"
            >
              <RotateCcw size={14} />
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-7">
        {questions.map((q) => (
          <div key={q.id} className="animate-fade-in">
            <div className="flex gap-2 sm:gap-3 mb-3">
              <span className="font-mono text-[10px] sm:text-[11px] text-ink-fade mt-1 shrink-0">
                Q{q.id.toString().padStart(2, "0")}
              </span>
              <p className="text-ink font-sans text-sm sm:text-[15px] leading-relaxed flex-1">
                {q.q}
              </p>
            </div>
            <div className="space-y-1.5 ml-6 sm:ml-8">
              {q.opts.map((opt, oi) => {
                const selected = answers[q.id] === oi;
                const isCorrect = q.correct === oi;
                const isRevealed = revealed[q.id];

                let cls =
                  "w-full text-left px-2.5 sm:px-3 py-2.5 rounded-sm font-sans text-[13px] sm:text-[14px] transition-all flex items-start gap-2 sm:gap-3 border ";

                if (!isRevealed) {
                  cls +=
                    "bg-background border-border hover:bg-card hover:border-rubric/30 text-ink";
                } else if (isCorrect) {
                  cls +=
                    "bg-[rgba(92,140,92,0.1)] border-[rgba(92,140,92,0.4)] text-ink";
                } else if (selected) {
                  cls +=
                    "bg-rubric/8 border-rubric/40 text-ink";
                } else {
                  cls += "bg-background/50 text-ink-fade border-border";
                }

                return (
                  <button
                    key={oi}
                    onClick={() => answer(q.id, oi)}
                    className={cls}
                    disabled={isRevealed}
                  >
                    <span className="font-mono text-[10px] sm:text-[11px] mt-0.5 min-w-[14px]">
                      {String.fromCharCode(97 + oi)})
                    </span>
                    <span className="flex-1">{opt}</span>
                    {isRevealed && isCorrect && (
                      <Check
                        size={15}
                        className="text-[#5c8c5c] mt-0.5 shrink-0"
                      />
                    )}
                    {isRevealed && selected && !isCorrect && (
                      <X size={15} className="text-rubric mt-0.5 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
            {revealed[q.id] && q.exp && (
              <div
                className="mt-3 ml-6 sm:ml-8 pl-3 border-l-2 border-rubric animate-slide-in"
              >
                <p className="font-serif italic text-[12px] sm:text-[13px] text-muted-foreground leading-relaxed">
                  {q.exp}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
