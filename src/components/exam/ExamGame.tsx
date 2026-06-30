"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  GraduationCap,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  EXAM_METADATA,
  EXAM_QUESTIONS,
  QUESTIONS_PER_ROUND,
  ROUND_BUDGET_SECONDS,
  SECONDS_PER_QUESTION_BUDGET,
  formatDuration,
  pickRandomQuestions,
  scoreQuestion,
  timeBonusMultiplier,
  type ExamQuestion,
} from "@/lib/exam";

type Phase =
  | "intro"
  | "answering"
  | "feedback"
  | "round-summary"
  | "exhausted";

interface RoundResult {
  round: number;
  rawScore: number;
  bonus: number;
  finalScore: number;
  elapsedSeconds: number;
  perQuestion: { id: string; earned: number; elapsed: number }[];
}

const subscribeMounted = () => () => {};
const getMountedSnapshot = () => true;
const getServerMountedSnapshot = () => false;

export default function ExamGame() {
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [batch, setBatch] = useState<ExamQuestion[]>([]);
  const [round, setRound] = useState(1);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selectedByQ, setSelectedByQ] = useState<Record<string, number[]>>({});
  const [perQuestionElapsed, setPerQuestionElapsed] = useState<
    Record<string, number>
  >({});
  const [phase, setPhase] = useState<Phase>("intro");
  const [roundStartTs, setRoundStartTs] = useState<number>(0);
  const [questionStartTs, setQuestionStartTs] = useState<number>(0);
  const [now, setNow] = useState<number>(0);
  const [history, setHistory] = useState<RoundResult[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const mounted = useSyncExternalStore(
    subscribeMounted,
    getMountedSnapshot,
    getServerMountedSnapshot
  );

  useEffect(() => {
    if (!mounted || phase === "intro") return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [mounted, phase]);

  const currentQ = batch[questionIdx];

  const lastQIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!currentQ || phase !== "answering") return;
    if (lastQIdRef.current !== currentQ.id) {
      lastQIdRef.current = currentQ.id;
      setQuestionStartTs(Date.now());
    }
  }, [currentQ, phase]);

  const startGame = () => {
    setBatch(pickRandomQuestions(EXAM_QUESTIONS, new Set(), QUESTIONS_PER_ROUND));
    const t = Date.now();
    setRoundStartTs(t);
    setQuestionStartTs(t);
    setNow(t);
    setSeenIds(new Set());
    setRound(1);
    setQuestionIdx(0);
    setSelectedByQ({});
    setPerQuestionElapsed({});
    setHistory([]);
    setTotalScore(0);
    setPhase("answering");
  };

  if (!mounted) return null;

  if (phase === "intro") {
    return <IntroScreen onStart={startGame} />;
  }

  const elapsedRound = Math.floor((now - roundStartTs) / 1000);
  const elapsedQuestion = Math.floor((now - questionStartTs) / 1000);
  const remainingRound = Math.max(0, ROUND_BUDGET_SECONDS - elapsedRound);
  const selectedForCurrent = currentQ ? selectedByQ[currentQ.id] ?? [] : [];

  const toggleSelect = (altId: number) => {
    if (!currentQ || phase !== "answering") return;
    setSelectedByQ((prev) => {
      const cur = prev[currentQ.id] ?? [];
      if (currentQ.multiple_answers) {
        const next = cur.includes(altId)
          ? cur.filter((x) => x !== altId)
          : [...cur, altId];
        return { ...prev, [currentQ.id]: next };
      }
      return { ...prev, [currentQ.id]: cur.includes(altId) ? [] : [altId] };
    });
  };

  const lockAnswer = () => {
    if (!currentQ || phase !== "answering") return;
    setPerQuestionElapsed((m) => ({ ...m, [currentQ.id]: elapsedQuestion }));
    setPhase("feedback");
  };

  const goNext = () => {
    if (!currentQ) return;
    const nextIdx = questionIdx + 1;
    if (nextIdx >= batch.length) {
      finishRound();
    } else {
      setQuestionIdx(nextIdx);
      setPhase("answering");
    }
  };

  const finishRound = () => {
    const elapsedSeconds = Math.floor((Date.now() - roundStartTs) / 1000);
    let raw = 0;
    const perQuestion: RoundResult["perQuestion"] = [];
    for (const q of batch) {
      const sel = selectedByQ[q.id] ?? [];
      const { earned } = scoreQuestion(q, sel);
      raw += earned;
      perQuestion.push({
        id: q.id,
        earned,
        elapsed: perQuestionElapsed[q.id] ?? 0,
      });
    }
    const bonus = timeBonusMultiplier(elapsedSeconds, ROUND_BUDGET_SECONDS);
    const finalScore = raw * bonus;
    const result: RoundResult = {
      round,
      rawScore: raw,
      bonus,
      finalScore,
      elapsedSeconds,
      perQuestion,
    };
    setHistory((h) => [...h, result]);
    setTotalScore((s) => s + finalScore);
    setSeenIds((prev) => {
      const next = new Set(prev);
      for (const q of batch) next.add(q.id);
      return next;
    });
    setPhase("round-summary");
  };

  const startNextRound = () => {
    const newSeen = new Set(seenIds);
    for (const q of batch) newSeen.add(q.id);
    const next = pickRandomQuestions(
      EXAM_QUESTIONS,
      newSeen,
      QUESTIONS_PER_ROUND
    );
    if (next.length === 0) {
      setPhase("exhausted");
      return;
    }
    setBatch(next);
    setRound((r) => r + 1);
    setQuestionIdx(0);
    setSelectedByQ({});
    setPerQuestionElapsed({});
    setRoundStartTs(Date.now());
    setQuestionStartTs(Date.now());
    setPhase("answering");
  };

  const restart = () => {
    setPhase("intro");
  };

  if (phase === "exhausted") {
    return (
      <ExhaustedState
        totalRounds={history.length}
        totalScore={totalScore}
        onRestart={restart}
      />
    );
  }

  if (phase === "round-summary") {
    const last = history[history.length - 1];
    const remaining = EXAM_QUESTIONS.length - seenIds.size;
    return (
      <RoundSummary
        result={last}
        totalScore={totalScore}
        questionsRemaining={remaining}
        onContinue={startNextRound}
        onRestart={restart}
      />
    );
  }

  if (!currentQ) return null;

  const correctSet = new Set(currentQ.answers);
  const selectedSet = new Set(selectedForCurrent);
  const totalAnsweredInRound = Object.keys(perQuestionElapsed).length;
  const overTime = remainingRound === 0;
  const seenCount = seenIds.size + totalAnsweredInRound;

  return (
    <QuestionScreen
      round={round}
      questionIdx={questionIdx}
      batch={batch}
      currentQ={currentQ}
      elapsedQuestion={elapsedQuestion}
      remainingRound={remainingRound}
      totalScore={totalScore}
      seenCount={seenCount}
      poolSize={EXAM_QUESTIONS.length}
      phase={phase}
      overTime={overTime}
      selectedForCurrent={selectedForCurrent}
      selectedSet={selectedSet}
      correctSet={correctSet}
      onToggle={toggleSelect}
      onLock={lockAnswer}
      onNext={goNext}
    />
  );
}

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="paper-texture min-h-[100svh] font-sans text-ink flex flex-col">
      <header className="px-4 sm:px-8 pt-[max(env(safe-area-inset-top),1rem)] pb-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-ink-fade hover:text-rubric transition"
        >
          <ArrowLeft size={12} /> voltar
        </Link>
      </header>

      <div className="flex-1 px-4 sm:px-8 pt-4 pb-32 sm:pb-12 max-w-2xl mx-auto w-full">
        <div className="font-mono text-[10px] uppercase tracking-[0.35em] text-rubric mb-3 flex items-center gap-1.5">
          <GraduationCap size={12} /> simulado · modo prova
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl italic text-ink leading-tight text-balance">
          {EXAM_METADATA.course}
        </h1>
        <p className="font-sans text-sm text-ink-fade mt-2">
          {EXAM_METADATA.institution} · banco com {EXAM_QUESTIONS.length}{" "}
          questões reais.
        </p>

        <section className="mt-8 bg-card border border-border rounded-sm p-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-rubric mb-3">
            condições da prova
          </div>
          <ul className="font-sans text-[13.5px] text-ink leading-relaxed space-y-2 list-disc pl-5">
            <li>Prova com consulta; todas as questões têm a mesma cotação.</li>
            <li>
              Marcar com <span className="font-mono text-rubric">X</span> as
              alternativas corretas.
            </li>
            <li>
              Uma resposta errada zera a cotação da questão (regra mais estrita
              que a prova: <span className="font-mono">−50%</span> por marca
              indevida na prova oficial).
            </li>
            <li>Pode haver mais do que uma alternativa correta numa pergunta.</li>
          </ul>
        </section>

        <section className="mt-4 bg-card border border-border rounded-sm p-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-rubric mb-3">
            ronda gamificada
          </div>
          <ul className="font-sans text-[13.5px] text-ink leading-relaxed space-y-2 list-disc pl-5">
            <li>
              <span className="font-mono">10</span> questões aleatórias por
              ronda · banco sem repetição.
            </li>
            <li>
              <span className="font-mono">1 hora</span> por ronda (5 min/questão
              + 10 min de tolerância).
            </li>
            <li>
              Pontuação = cotação × bónus de tempo (até{" "}
              <span className="font-mono">×1.5</span> se terminar bem antes do
              prazo).
            </li>
            <li>Feedback só aparece depois de confirmar a resposta.</li>
          </ul>
        </section>
      </div>

      <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border px-4 sm:px-8 py-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={onStart}
            className="w-full h-12 font-mono text-[12px] uppercase tracking-widest"
            size="lg"
          >
            iniciar ronda <ArrowRight size={14} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface QuestionScreenProps {
  round: number;
  questionIdx: number;
  batch: ExamQuestion[];
  currentQ: ExamQuestion;
  elapsedQuestion: number;
  remainingRound: number;
  totalScore: number;
  seenCount: number;
  poolSize: number;
  phase: Phase;
  overTime: boolean;
  selectedForCurrent: number[];
  selectedSet: Set<number>;
  correctSet: Set<number>;
  onToggle: (id: number) => void;
  onLock: () => void;
  onNext: () => void;
}

function QuestionScreen({
  round,
  questionIdx,
  batch,
  currentQ,
  elapsedQuestion,
  remainingRound,
  totalScore,
  seenCount,
  poolSize,
  phase,
  overTime,
  selectedForCurrent,
  selectedSet,
  correctSet,
  onToggle,
  onLock,
  onNext,
}: QuestionScreenProps) {
  const overQuestion = elapsedQuestion > SECONDS_PER_QUESTION_BUDGET;
  const isLast = questionIdx + 1 >= batch.length;

  return (
    <div className="paper-texture min-h-[100svh] font-sans text-ink flex flex-col">
      <StickyHUD
        round={round}
        questionIdx={questionIdx}
        totalQuestions={batch.length}
        elapsedQuestion={elapsedQuestion}
        remainingRound={remainingRound}
        totalScore={totalScore}
        seenCount={seenCount}
        poolSize={poolSize}
        overQuestion={overQuestion}
        overTime={overTime}
      />

      <div className="flex-1 px-4 sm:px-8 pt-5 pb-36 sm:pb-32 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-rubric">
            Q{(questionIdx + 1).toString().padStart(2, "0")} / {batch.length}
          </span>
          {currentQ.multiple_answers && (
            <span className="font-mono text-[9px] uppercase tracking-widest text-rubric border border-rubric/40 px-1.5 py-0.5 rounded-sm">
              múltiplas
            </span>
          )}
          {currentQ.select === "false" && (
            <span className="font-mono text-[9px] uppercase tracking-widest text-rubric border border-rubric/40 px-1.5 py-0.5 rounded-sm">
              assinale falsas
            </span>
          )}
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-fade ml-auto truncate">
            {currentQ.exam}
          </span>
        </div>

        <p className="font-serif text-lg sm:text-xl italic text-ink leading-snug mb-5 text-pretty">
          {currentQ.question}
        </p>

        <div className="space-y-2">
          {currentQ.alternatives.map((alt, i) => {
            const isSelected = selectedSet.has(alt.id);
            const isCorrect = correctSet.has(alt.id);
            const revealed = phase === "feedback";

            let cls =
              "w-full text-left px-3 py-3.5 rounded-sm font-sans text-[14px] transition-all flex items-start gap-3 border min-h-[48px] active:scale-[0.99] ";
            if (!revealed) {
              cls += isSelected
                ? "bg-ink text-paper border-transparent"
                : "bg-card border-border text-ink";
            } else {
              if (isCorrect && isSelected)
                cls +=
                  "bg-[rgba(92,140,92,0.12)] border-[rgba(92,140,92,0.5)] text-ink";
              else if (isCorrect && !isSelected)
                cls +=
                  "bg-[rgba(92,140,92,0.06)] border-[rgba(92,140,92,0.3)] text-ink";
              else if (!isCorrect && isSelected)
                cls += "bg-rubric/10 border-rubric/50 text-ink";
              else cls += "bg-background/50 text-ink-fade border-border";
            }

            return (
              <button
                key={alt.id}
                onClick={() => onToggle(alt.id)}
                disabled={revealed}
                className={cls}
              >
                <span className="font-mono text-[12px] mt-0.5 min-w-[18px] flex items-center justify-center">
                  {isSelected ? (
                    <span
                      className={
                        revealed && !isCorrect
                          ? "text-rubric font-bold"
                          : revealed && isCorrect
                          ? "text-[#5c8c5c] font-bold"
                          : "font-bold"
                      }
                    >
                      X
                    </span>
                  ) : (
                    <span className="text-ink-fade">
                      {String.fromCharCode(97 + i)})
                    </span>
                  )}
                </span>
                <span className="flex-1 leading-relaxed">{alt.text}</span>
                {revealed && isCorrect && (
                  <Check size={15} className="text-[#5c8c5c] mt-0.5 shrink-0" />
                )}
                {revealed && !isCorrect && isSelected && (
                  <X size={15} className="text-rubric mt-0.5 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {phase === "feedback" && (
          <FeedbackPanel question={currentQ} selected={selectedForCurrent} />
        )}
      </div>

      <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border px-4 sm:px-8 py-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="font-mono text-[10px] uppercase tracking-widest text-ink-fade flex-1 min-w-0 truncate">
            {phase === "answering"
              ? selectedForCurrent.length === 0
                ? "marque com X"
                : `${selectedForCurrent.length} marcada(s)`
              : "feedback liberado"}
            {overTime && (
              <span className="ml-1.5 text-rubric">— tempo esgotado</span>
            )}
          </div>
          {phase === "answering" ? (
            <Button
              onClick={onLock}
              disabled={selectedForCurrent.length === 0}
              className="font-mono text-[11px] uppercase tracking-widest h-11 px-5"
              size="lg"
            >
              Confirmar
            </Button>
          ) : (
            <Button
              onClick={onNext}
              className="font-mono text-[11px] uppercase tracking-widest h-11 px-5"
              size="lg"
            >
              {isLast ? "Finalizar" : "Próxima"}
              <ArrowRight size={13} className="ml-1.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface StickyHUDProps {
  round: number;
  questionIdx: number;
  totalQuestions: number;
  elapsedQuestion: number;
  remainingRound: number;
  totalScore: number;
  seenCount: number;
  poolSize: number;
  overQuestion: boolean;
  overTime: boolean;
}

function StickyHUD({
  round,
  questionIdx,
  totalQuestions,
  elapsedQuestion,
  remainingRound,
  totalScore,
  seenCount,
  poolSize,
  overQuestion,
  overTime,
}: StickyHUDProps) {
  return (
    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border pt-[max(env(safe-area-inset-top),0.5rem)]">
      <div className="max-w-2xl mx-auto px-4 sm:px-8 py-2.5">
        <div className="grid grid-cols-4 gap-2 items-end">
          <HUDStat
            label="ronda"
            value={`#${round}`}
          />
          <HUDStat
            label="questão"
            value={`${questionIdx + 1}/${totalQuestions}`}
          />
          <HUDStat
            label="tempo q"
            value={formatDuration(elapsedQuestion)}
            icon={<Clock size={10} />}
            accent={overQuestion ? "text-rubric" : undefined}
          />
          <HUDStat
            label="resta"
            value={formatDuration(remainingRound)}
            icon={<Clock size={10} />}
            accent={overTime || remainingRound < 60 ? "text-rubric" : undefined}
          />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Progress
            value={(seenCount / poolSize) * 100}
            className="h-1 bg-card flex-1"
          />
          <span className="font-mono text-[9px] uppercase tracking-widest text-ink-fade whitespace-nowrap">
            {seenCount}/{poolSize} · {totalScore.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

function HUDStat({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  accent?: string;
}) {
  return (
    <div>
      <div className="font-mono text-[8.5px] uppercase tracking-widest text-ink-fade flex items-center gap-1 leading-none">
        {icon}
        {label}
      </div>
      <div
        className={`font-serif text-[17px] sm:text-lg text-ink mt-0.5 leading-none tabular-nums ${
          accent ?? ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function FeedbackPanel({
  question,
  selected,
}: {
  question: ExamQuestion;
  selected: number[];
}) {
  const { earned, max } = scoreQuestion(question, selected);
  const correctSet = new Set(question.answers);
  const selectedSet = new Set(selected);
  const missed = [...correctSet].filter((id) => !selectedSet.has(id));
  const wrong = [...selectedSet].filter((id) => !correctSet.has(id));
  const perfect = missed.length === 0 && wrong.length === 0;

  const labelOf = (id: number) =>
    String.fromCharCode(
      97 + question.alternatives.findIndex((a) => a.id === id)
    ) + ")";

  return (
    <div
      className={`mt-5 p-4 rounded-sm border ${
        perfect
          ? "bg-[rgba(92,140,92,0.08)] border-[rgba(92,140,92,0.4)]"
          : "bg-rubric/5 border-rubric/30"
      } animate-slide-in`}
    >
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <div className="font-mono text-[10px] uppercase tracking-widest text-rubric">
          {perfect ? "resposta perfeita" : "feedback"}
        </div>
        <div className="font-serif text-base text-ink">
          + {earned.toFixed(2)}
          <span className="text-ink-fade text-xs"> / {max.toFixed(2)}</span>
        </div>
      </div>
      {!perfect && (
        <ul className="mt-2 space-y-1 font-sans text-[12.5px] text-ink leading-relaxed">
          {missed.length > 0 && (
            <li>
              <span className="text-ink-fade">não marcadas (corretas): </span>
              <span className="font-mono text-rubric">
                {missed.map(labelOf).join(", ")}
              </span>
            </li>
          )}
          {wrong.length > 0 && (
            <li>
              <span className="text-ink-fade">marcadas indevidamente: </span>
              <span className="font-mono text-rubric">
                {wrong.map(labelOf).join(", ")}
              </span>
            </li>
          )}
        </ul>
      )}
      {question.notes && (
        <p className="mt-2 font-serif italic text-[12px] text-muted-foreground leading-relaxed">
          {question.notes}
        </p>
      )}
    </div>
  );
}

function RoundSummary({
  result,
  totalScore,
  questionsRemaining,
  onContinue,
  onRestart,
}: {
  result: RoundResult;
  totalScore: number;
  questionsRemaining: number;
  onContinue: () => void;
  onRestart: () => void;
}) {
  const accuracyPct = (result.rawScore / QUESTIONS_PER_ROUND) * 100;
  return (
    <div className="paper-texture min-h-[100svh] font-sans text-ink flex flex-col">
      <div className="flex-1 px-4 sm:px-8 pt-[max(env(safe-area-inset-top),1rem)] pb-32 max-w-2xl mx-auto w-full">
        <div className="bg-card border border-border rounded-sm p-5 sm:p-7 animate-fade-in">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-rubric">
            <Trophy size={12} /> ronda {result.round} concluída
          </div>
          <div className="mt-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-ink-fade">
              pontos da ronda
            </div>
            <div className="font-serif text-5xl sm:text-6xl text-ink leading-none mt-1 tabular-nums">
              {result.finalScore.toFixed(2)}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 pt-4 border-t border-border">
            <SummaryStat
              label="cotação"
              value={`${result.rawScore.toFixed(2)}/10`}
              hint={`${accuracyPct.toFixed(0)}%`}
            />
            <SummaryStat
              label="bónus"
              value={`×${result.bonus.toFixed(2)}`}
              icon={<Sparkles size={10} className="text-rubric" />}
            />
            <SummaryStat
              label="tempo"
              value={formatDuration(result.elapsedSeconds)}
              hint={`/${formatDuration(ROUND_BUDGET_SECONDS)}`}
            />
          </div>

          <div className="mt-5 pt-4 border-t border-border">
            <div className="font-mono text-[10px] uppercase tracking-widest text-ink-fade">
              score acumulado
            </div>
            <div className="font-serif text-2xl text-ink mt-1 tabular-nums">
              {totalScore.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="mt-4 bg-card border border-border rounded-sm p-4">
          <div className="font-mono text-[10px] uppercase tracking-widest text-ink-fade mb-3">
            questões da ronda
          </div>
          <div className="space-y-1.5">
            {result.perQuestion.map((q) => (
              <div
                key={q.id}
                className="flex items-center justify-between font-mono text-[12px] text-ink"
              >
                <span className="text-ink-fade">{q.id}</span>
                <span className="flex-1 mx-3 border-b border-dashed border-border" />
                <span className="text-ink-fade tabular-nums">
                  {formatDuration(q.elapsed)}
                </span>
                <span className="ml-3 w-12 text-right tabular-nums">
                  +{q.earned.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 font-mono text-[10px] uppercase tracking-widest text-ink-fade text-center">
          {questionsRemaining} questões restantes no banco
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border px-4 sm:px-8 py-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onRestart}
            className="font-mono text-[11px] uppercase tracking-widest h-11 px-4"
            size="lg"
          >
            <RotateCcw size={12} className="mr-1.5" /> recomeçar
          </Button>
          <Button
            onClick={onContinue}
            disabled={questionsRemaining === 0}
            className="flex-1 font-mono text-[11px] uppercase tracking-widest h-11"
            size="lg"
          >
            próxima ronda <ArrowRight size={13} className="ml-1.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-widest text-ink-fade flex items-center gap-1">
        {icon}
        {label}
      </div>
      <div className="font-serif text-[17px] text-ink mt-0.5 leading-none tabular-nums">
        {value}
      </div>
      {hint && (
        <div className="font-mono text-[10px] text-ink-fade mt-1 tabular-nums">
          {hint}
        </div>
      )}
    </div>
  );
}

function ExhaustedState({
  totalRounds,
  totalScore,
  onRestart,
}: {
  totalRounds: number;
  totalScore: number;
  onRestart: () => void;
}) {
  return (
    <div className="paper-texture min-h-[100svh] font-sans text-ink flex items-center justify-center px-4 sm:px-8 py-10">
      <div className="bg-card border border-border rounded-sm p-8 text-center animate-fade-in max-w-md w-full">
        <Trophy size={28} className="text-rubric mx-auto mb-3" />
        <div className="font-mono text-[10px] uppercase tracking-widest text-rubric">
          banco completo
        </div>
        <div className="font-serif text-3xl italic text-ink mt-2">
          respondeu todas as questões
        </div>
        <div className="font-mono text-[12px] text-ink-fade mt-3">
          {totalRounds} rondas · score final {totalScore.toFixed(2)}
        </div>
        <Button
          onClick={onRestart}
          className="mt-6 w-full h-11 font-mono text-[11px] uppercase tracking-widest"
          size="lg"
        >
          <RotateCcw size={12} className="mr-1.5" /> recomeçar do zero
        </Button>
      </div>
    </div>
  );
}
