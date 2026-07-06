"use client";

import { Children, isValidElement, useEffect, useMemo, useRef, useState, type ReactElement, type ReactNode } from "react";
import {
  AlertTriangle,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  ClipboardList,
  Eye,
  Layers,
  RotateCcw,
  Target,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RANTIA_QUESTIONS } from "@/lib/rantia-data";
import type { Question } from "@/lib/data";
import { useLearningProgress } from "@/components/learning/LearningProgressProvider";

export function LearningObjectives({
  sectionId,
  items,
}: {
  sectionId: string;
  items: string[];
}) {
  const learning = useLearningProgress();
  const done = learning?.progress.completedSections.includes(sectionId);

  return (
    <div className="my-6 rounded-lg border border-border bg-card p-4 shadow-[0_12px_30px_rgba(26,21,18,0.05)] animate-fade-in sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-rubric/20 bg-rubric/10 text-rubric">
          <Target size={16} />
        </span>
        <div className="min-w-0">
          <span className="font-mono text-[10px] uppercase tracking-widest text-rubric">
            missão da etapa
          </span>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Aprende estes pontos antes de avançar para a interação.
          </p>
        </div>
        {done ? (
          <span className="ml-auto flex shrink-0 items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-[#5c8c5c]">
            <CircleCheck size={13} /> concluido
          </span>
        ) : null}
      </div>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-sm leading-6 text-ink">
            <Check size={15} className="mt-1 shrink-0 text-rubric" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const current = steps[active];

  if (!steps.length || !current) return null;

  const goToStep = (index: number) => {
    setActive(index);
    window.requestAnimationFrame(() => {
      const top = containerRef.current?.getBoundingClientRect().top;
      if (typeof top !== "number") return;
      window.scrollTo({
        top: window.scrollY + top - 57,
        behavior: "smooth",
      });
    });
  };

  return (
    <div ref={containerRef} className="contents md:block">
      <div className="sticky top-[57px] md:top-0 z-20 -mx-4 mb-5 border-y border-border bg-background/95 px-4 py-3 shadow-[0_10px_24px_rgba(26,21,18,0.06)] backdrop-blur">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="font-mono text-xs uppercase tracking-widest text-rubric">
              ecrã {active + 1} de {steps.length}
            </div>
            <div className="mt-0.5 truncate font-serif text-lg italic leading-tight text-ink">
              {current.props.title ?? current.props.label}
            </div>
          </div>
          <div className="flex shrink-0 gap-1.5" aria-hidden="true">
            {steps.map((step, index) => (
              <span
                key={`${step.props.label}-dot-${index}`}
                className={`size-2 rounded-full ${
                  index === active ? "bg-rubric" : "bg-border"
                }`}
              />
            ))}
          </div>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {steps.map((step, index) => (
            <button
              key={`${step.props.label}-${index}`}
              type="button"
              onClick={() => goToStep(index)}
              aria-current={index === active ? "step" : undefined}
              className={`flex min-h-10 shrink-0 items-center gap-2 rounded-full border py-2 pl-2 pr-3 text-left transition ${
                index === active
                  ? "border-transparent bg-ink text-paper shadow-[0_8px_18px_rgba(26,21,18,0.14)]"
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              <span
                className={`flex size-6 items-center justify-center rounded-full font-mono text-xs ${
                  index === active
                    ? "bg-paper/15 text-paper"
                    : "bg-background text-ink-fade"
                }`}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="font-mono text-xs uppercase tracking-widest">
                {step.props.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="contents md:block">
        {steps.map((step, index) => (
          <section
            key={`${step.props.label}-${index}`}
            className={`${
              index === active ? "block" : "hidden"
            } min-h-[calc(100svh-190px)] pb-6`}
          >
            {step.props.children}
          </section>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-2 shadow-[0_10px_24px_rgba(26,21,18,0.05)]">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={active === 0}
          onClick={() => goToStep(Math.max(0, active - 1))}
          className="h-11 flex-1"
        >
          <ChevronLeft size={15} />
          anterior
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={active === steps.length - 1}
          onClick={() => goToStep(Math.min(steps.length - 1, active + 1))}
          className="h-11 flex-1"
        >
          seguinte
          <ChevronRight size={15} />
        </Button>
      </div>
    </div>
  );
}

export function LessonStage({
  step,
  title,
  subtitle,
}: {
  step: string;
  title: string;
  subtitle?: string;
}) {
  const label = step.toString().padStart(2, "0");

  return (
    <div className="my-6 flex gap-3 rounded-lg border border-border bg-background/80 p-3 shadow-[0_10px_24px_rgba(26,21,18,0.04)]">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-ink font-mono text-[11px] uppercase tracking-widest text-paper">
        {label}
      </div>
      <div className="min-w-0 py-0.5">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-rubric">
          <BookOpen size={13} />
          etapa guiada
        </div>
        <h3 className="mt-1 font-serif text-xl italic leading-tight text-ink">
          {title}
        </h3>
        {subtitle ? (
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function ConceptFlow({
  title = "fluxo",
  steps,
}: {
  title?: string;
  steps: string[];
}) {
  return (
    <div className="my-6 rounded-lg border border-border bg-card p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-md border border-rubric/20 bg-rubric/10 text-rubric">
          <Layers size={15} />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-rubric">
          {title}
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((step, index) => (
          <div key={`${step}-${index}`} className="flex items-stretch gap-2">
            <div className="flex min-h-11 flex-1 items-center rounded-md border border-border bg-background px-3 py-2 font-mono text-[11px] leading-snug text-ink">
              {step}
            </div>
            {index < steps.length - 1 ? (
              <ChevronRight
                size={14}
                className="mt-3 hidden shrink-0 text-rubric sm:block"
              />
            ) : null}
          </div>
        ))}
      </div>
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
    <div className="my-5 rounded-lg border border-rubric/30 bg-rubric/10 p-4">
      <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-rubric">
        <CircleCheck size={13} />
        {title}
      </div>
      <div className="text-sm leading-7 text-ink">{children}</div>
    </div>
  );
}

export function ExamTrap({
  title = "armadilha de exame",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="my-5 rounded-lg border border-rubric/30 bg-card px-4 py-3">
      <div className="mb-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-rubric">
        <AlertTriangle size={13} />
        {title}
      </div>
      <div className="text-sm leading-7 text-muted-foreground">
        {children}
      </div>
    </div>
  );
}

export function SectionQuiz({
  sectionId,
  topic,
  title = "Checkpoint",
  source = RANTIA_QUESTIONS,
}: {
  sectionId: string;
  topic: string;
  title?: string;
  source?: Question[];
}) {
  const questions = useMemo(
    () => source.filter((question) => question.topic === topic),
    [source, topic]
  );
  const learning = useLearningProgress();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  const correctCount = questions.filter(
    (question) => answers[question.id] === question.correct
  ).length;
  const allDone =
    questions.length > 0 &&
    questions.every((question) => revealed[question.id]);

  const answer = (question: Question, optionIndex: number) => {
    if (revealed[question.id]) return;

    const nextAnswers = { ...answers, [question.id]: optionIndex };
    const nextRevealed = { ...revealed, [question.id]: true };
    setAnswers(nextAnswers);
    setRevealed(nextRevealed);

    const complete = questions.every((item) => nextRevealed[item.id]);
    if (complete) {
      const correct = questions.filter(
        (item) => nextAnswers[item.id] === item.correct
      ).length;
      const missed = questions
        .filter((item) => nextAnswers[item.id] !== item.correct)
        .map((item) => item.topic);
      learning?.recordQuizScore(
        sectionId,
        { correct, total: questions.length },
        missed
      );
    }
  };

  const reset = () => {
    setAnswers({});
    setRevealed({});
  };

  if (questions.length === 0) {
    return (
      <div className="my-8 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
        Sem perguntas configuradas para este checkpoint.
      </div>
    );
  }

  return (
    <div className="my-8 rounded-lg border border-border bg-card p-4 shadow-[0_14px_34px_rgba(26,21,18,0.06)] sm:p-6">
      <div className="mb-5 border-b border-border pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-rubric/20 bg-rubric/10 text-rubric">
              <ClipboardList size={16} />
            </span>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-rubric">
                quiz de checkpoint
              </div>
              <h3 className="mt-1 font-serif text-lg italic leading-tight text-ink">
                {title}
              </h3>
            </div>
          </div>
          {allDone ? (
            <div className="flex shrink-0 items-center gap-2">
              <span className="rounded-md border border-border bg-background px-2 py-1 font-mono text-sm text-ink">
                {correctCount}/{questions.length}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={reset}
                className="size-10 text-muted-foreground hover:text-rubric"
              >
                <RotateCcw size={15} />
              </Button>
            </div>
          ) : null}
        </div>
        <div className="mt-4 flex gap-1">
          {questions.map((question) => (
            <span
              key={question.id}
              className={`h-1.5 flex-1 rounded-full ${
                revealed[question.id] ? "bg-rubric" : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((question) => (
          <QuizQuestion
            key={question.id}
            question={question}
            selected={answers[question.id]}
            revealed={Boolean(revealed[question.id])}
            onAnswer={answer}
          />
        ))}
      </div>
    </div>
  );
}

function QuizQuestion({
  question,
  selected,
  revealed,
  onAnswer,
}: {
  question: Question;
  selected?: number;
  revealed: boolean;
  onAnswer: (question: Question, optionIndex: number) => void;
}) {
  return (
    <div className="animate-fade-in">
      <div className="mb-3 flex gap-3">
        <span className="mt-0.5 shrink-0 rounded-md border border-border bg-background px-2 py-1 font-mono text-[11px] text-ink-fade">
          Q{question.id.toString().padStart(2, "0")}
        </span>
        <p className="text-sm leading-6 text-ink sm:text-[15px] sm:leading-7">
          {question.q}
        </p>
      </div>
      <div className="space-y-2 sm:ml-11">
        {question.opts.map((option, optionIndex) => {
          const isCorrect = question.correct === optionIndex;
          const isSelected = selected === optionIndex;
          const className = quizOptionClass(revealed, isSelected, isCorrect);

          return (
            <button
              key={option}
              type="button"
              onClick={() => onAnswer(question, optionIndex)}
              disabled={revealed}
              className={className}
            >
              <span className="mt-0.5 min-w-[14px] font-mono text-[11px]">
                {String.fromCharCode(97 + optionIndex)})
              </span>
              <span className="flex-1">{option}</span>
              {revealed && isCorrect ? (
                <Check size={15} className="mt-0.5 shrink-0 text-[#5c8c5c]" />
              ) : null}
              {revealed && isSelected && !isCorrect ? (
                <X size={15} className="mt-0.5 shrink-0 text-rubric" />
              ) : null}
            </button>
          );
        })}
      </div>
      {revealed && question.exp ? (
        <div className="mt-3 rounded-md border border-rubric/20 bg-rubric/10 p-3 animate-slide-in sm:ml-11">
          <p className="font-serif text-[13px] italic leading-relaxed text-muted-foreground">
            {question.exp}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function quizOptionClass(
  revealed: boolean,
  selected: boolean,
  correct: boolean
) {
  const base =
    "flex min-h-11 w-full items-start gap-3 rounded-lg border px-3 py-3 text-left text-[14px] leading-5 transition-all ";

  if (!revealed) {
    return `${base}${
      selected
        ? "border-transparent bg-ink text-paper"
        : "border-border bg-background text-ink hover:border-rubric/30 hover:bg-card"
    }`;
  }

  if (correct) {
    return `${base}border-[rgba(92,140,92,0.4)] bg-[rgba(92,140,92,0.1)] text-ink`;
  }

  if (selected) {
    return `${base}border-rubric/40 bg-rubric/10 text-ink`;
  }

  return `${base}border-border bg-background/50 text-ink-fade`;
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
    <div className="my-6 rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="font-mono text-[10px] uppercase tracking-widest text-rubric">
          {title}
        </div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-ink-fade">
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
        <div className="font-serif text-lg italic text-ink">
          {flipped ? card.back : card.front}
        </div>
        <div className="mt-3 font-mono text-[10px] uppercase tracking-widest text-ink-fade">
          clicar para {flipped ? "pergunta" : "resposta"}
        </div>
      </button>
      <Button type="button" size="sm" onClick={next} className="mt-3 h-10">
        seguinte
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
      <div className="my-6 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
        Sem pares configurados para esta associação.
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
      <div className="my-6 rounded-lg border border-border bg-card p-4">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-[rgba(92,140,92,0.35)] bg-[rgba(92,140,92,0.1)] text-[#5c8c5c]">
            <CircleCheck size={16} />
          </span>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-rubric">
              {title}
            </div>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Associação concluída. Repetir ajuda a fixar a ordem das camadas.
            </p>
          </div>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={reset} className="mt-4 h-10">
          repetir
        </Button>
      </div>
    );
  }

  return (
    <div className="my-6 rounded-lg border border-border bg-card p-4 shadow-[0_12px_30px_rgba(26,21,18,0.05)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="font-mono text-[10px] uppercase tracking-widest text-rubric">
          {title}
        </div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-ink-fade">
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
        <div className="font-mono text-[10px] uppercase tracking-widest text-ink-fade">
          item a associar
        </div>
        <div className="mt-2 font-serif text-xl italic leading-tight text-ink">
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
              choice === answer
                ? "border-transparent bg-ink text-paper"
                : "border-border bg-background text-ink hover:border-rubric/30"
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
              ? "border-[rgba(92,140,92,0.35)] bg-[rgba(92,140,92,0.1)] text-[#456b45]"
              : "border-rubric/30 bg-rubric/10 text-rubric"
          }`}
        >
          {isCorrect
            ? "Certo. Avança para consolidar a próxima camada."
            : "Ainda não. Escolhe a função que corresponde melhor a este item."}
        </div>
      ) : null}
      <Button
        type="button"
        size="sm"
        onClick={advance}
        disabled={!isCorrect}
        className="mt-4 h-10 w-full sm:w-auto"
      >
        {active === pairs.length - 1 ? "concluir" : "seguinte"}
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
    <div className="my-6 rounded-lg border border-border bg-card p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <Eye size={15} className="text-rubric" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-rubric">
          progresso local
        </span>
      </div>
      <div className="font-serif text-3xl text-ink">
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
              className="rounded-md border border-rubric/30 bg-rubric/10 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-rubric"
            >
              rever {topic}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
