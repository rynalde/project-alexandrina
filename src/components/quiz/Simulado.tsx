"use client";

import { useState, useMemo } from "react";
import { Check, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { QUESTIONS, TOPIC_LABELS, type Question } from "@/lib/data";

interface Props {
  questions?: Question[];
  topicLabels?: Record<string, string>;
}

export default function Simulado({
  questions = QUESTIONS,
  topicLabels = TOPIC_LABELS,
}: Props = {}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const choose = (qid: number, oidx: number) => {
    if (submitted) return;
    setAnswers((s) => ({ ...s, [qid]: oidx }));
  };

  const answered = Object.keys(answers).length;
  const total = questions.length;
  const correctCount = questions.filter(
    (q) => answers[q.id] === q.correct
  ).length;
  const pct = Math.round((correctCount / total) * 100);

  const reset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  const grade =
    pct >= 85
      ? "excelente"
      : pct >= 70
      ? "muito bom"
      : pct >= 55
      ? "passou, mas revise"
      : "repita os tópicos fracos";

  const topicResults = useMemo(() => {
    const r: Record<string, { correct: number; total: number }> = {};
    questions.forEach((q) => {
      if (!r[q.topic]) r[q.topic] = { correct: 0, total: 0 };
      r[q.topic].total++;
      if (answers[q.id] === q.correct) r[q.topic].correct++;
    });
    return r;
  }, [answers, questions]);

  return (
    <div>
      {/* Sticky progress bar */}
      <div className="sticky top-0 sm:top-0 z-20 bg-background py-3 sm:py-4 border-b border-border mt-6 sm:mt-8 mb-6 -mx-4 sm:mx-0 px-4 sm:px-0">
        <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
          <div>
            <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-ink-fade">
              progresso
            </div>
            <div className="font-serif text-xl sm:text-2xl text-ink">
              {answered}
              <span className="text-ink-fade">/{total}</span>
            </div>
          </div>
          <div className="flex-1 min-w-[80px]">
            <Progress
              value={(answered / total) * 100}
              className="h-1 bg-card"
            />
          </div>
          {!submitted ? (
            <Button
              onClick={() => setSubmitted(true)}
              disabled={answered < total}
              className="font-mono text-[10px] sm:text-[11px] uppercase tracking-widest"
              size="sm"
            >
              Submeter →
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={reset}
              className="font-mono text-[10px] sm:text-[11px] uppercase tracking-widest"
            >
              <RotateCcw size={12} className="mr-1.5" /> Refazer
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      {submitted && (
        <div className="mb-10 animate-fade-in">
          <div className="bg-card border border-border rounded-sm p-5 sm:p-8 mb-6">
            <div className="flex items-start gap-6 flex-wrap">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-rubric">
                  resultado
                </div>
                <div className="font-serif text-5xl sm:text-7xl text-ink mt-1 leading-none">
                  {correctCount}
                  <span className="text-ink-fade text-3xl sm:text-4xl">/{total}</span>
                </div>
                <div className="font-serif italic text-base sm:text-xl text-muted-foreground mt-2">
                  {pct}% — {grade}
                </div>
              </div>
              <div className="flex-1 min-w-full md:min-w-[220px]">
                <div className="font-mono text-[10px] uppercase tracking-widest text-ink-fade mb-2">
                  por tópico
                </div>
                <div className="space-y-1.5">
                  {Object.entries(topicResults).map(
                    ([topic, { correct, total }]) => {
                      const topicPct = correct / total;
                      const barColor =
                        topicPct === 1
                          ? "#5c8c5c"
                          : topicPct >= 0.5
                          ? "#c7502e"
                          : "#8a3d24";
                      return (
                        <div
                          key={topic}
                          className="flex items-center gap-2 sm:gap-3 font-mono text-[11px] sm:text-[12px]"
                        >
                          <span className="text-muted-foreground w-32 sm:w-40 truncate">
                            {topicLabels[topic] ?? topic}
                          </span>
                          <div className="flex-1 bg-background border border-border rounded-sm h-3 overflow-hidden">
                            <div
                              className="h-full transition-all duration-700"
                              style={{
                                width: `${topicPct * 100}%`,
                                background: barColor,
                              }}
                            />
                          </div>
                          <span className="text-ink w-10 text-right">
                            {correct}/{total}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-6 sm:space-y-8">
        {questions.map((q) => {
          const selected = answers[q.id];
          const revealed = submitted;
          return (
            <div
              key={q.id}
              className="bg-card border border-border rounded-sm p-4 sm:p-6"
            >
              <div className="flex items-baseline gap-2 sm:gap-3 mb-4">
                <span className="font-mono text-[10px] sm:text-[11px] text-rubric shrink-0">
                  {q.id.toString().padStart(2, "0")}.
                </span>
                <p className="text-ink font-sans text-sm sm:text-[15px] leading-relaxed flex-1">
                  {q.q}
                </p>
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink-fade hidden md:inline shrink-0">
                  {topicLabels[q.topic] ?? q.topic}
                </span>
              </div>
              <div className="space-y-1.5 ml-6 sm:ml-8">
                {q.opts.map((opt, oi) => {
                  const isCorrect = q.correct === oi;
                  const isSel = selected === oi;
                  let cls =
                    "w-full text-left px-2.5 sm:px-3 py-2.5 rounded-sm font-sans text-[13px] sm:text-[14px] transition-all flex items-start gap-2 sm:gap-3 border ";
                  if (!revealed) {
                    cls += isSel
                      ? "bg-ink text-paper border-transparent"
                      : "bg-background border-border hover:bg-card hover:border-rubric/30 text-ink";
                  } else {
                    if (isCorrect)
                      cls +=
                        "bg-[rgba(92,140,92,0.1)] border-[rgba(92,140,92,0.4)] text-ink";
                    else if (isSel)
                      cls += "bg-rubric/8 border-rubric/40 text-ink";
                    else cls += "bg-background/50 text-ink-fade border-border";
                  }
                  return (
                    <button
                      key={oi}
                      onClick={() => choose(q.id, oi)}
                      className={cls}
                      disabled={revealed}
                    >
                      <span className="font-mono text-[10px] sm:text-[11px] mt-0.5 min-w-[14px]">
                        {String.fromCharCode(97 + oi)})
                      </span>
                      <span className="flex-1">{opt}</span>
                      {revealed && isCorrect && (
                        <Check
                          size={15}
                          className="text-[#5c8c5c] mt-0.5 shrink-0"
                        />
                      )}
                      {revealed && isSel && !isCorrect && (
                        <X size={15} className="text-rubric mt-0.5 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
              {revealed && q.exp && (
                <div className="mt-3 ml-6 sm:ml-8 pl-3 border-l-2 border-rubric animate-slide-in">
                  <p className="font-serif italic text-[12px] sm:text-[13px] text-muted-foreground leading-relaxed">
                    {q.exp}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
