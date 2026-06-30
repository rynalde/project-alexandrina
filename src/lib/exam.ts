import examData from "@/content/exam/lnsc-exam.json";

export interface ExamAlternative {
  id: number;
  text: string;
}

export interface ExamQuestion {
  id: string;
  year: number;
  exam: string;
  multiple_answers: boolean;
  select: "correct" | "false";
  question: string;
  alternatives: ExamAlternative[];
  answers: number[];
  answer_confidence: "high" | "medium" | "low";
  notes?: string;
}

export interface ExamMetadata {
  course: string;
  institution: string;
  description: string;
  total_questions: number;
}

const data = examData as unknown as {
  metadata: ExamMetadata;
  questions: ExamQuestion[];
};

export const EXAM_METADATA: ExamMetadata = data.metadata;
export const EXAM_QUESTIONS: ExamQuestion[] = data.questions;

export const QUESTIONS_PER_ROUND = 10;
export const SECONDS_PER_QUESTION_BUDGET = 5 * 60;
export const ROUND_TOLERANCE_SECONDS = 10 * 60;
export const ROUND_BUDGET_SECONDS =
  QUESTIONS_PER_ROUND * SECONDS_PER_QUESTION_BUDGET + ROUND_TOLERANCE_SECONDS;

/**
 * Score a single answered question:
 *  - se alguma alternativa incorreta foi marcada → 0 pontos
 *  - caso contrário, crédito proporcional pelas corretas marcadas:
 *    earned = corretas_marcadas / total_corretas
 */
export function scoreQuestion(
  question: ExamQuestion,
  selected: number[]
): { earned: number; max: number; correctIds: number[] } {
  const correctSet = new Set(question.answers);
  const selectedSet = new Set(selected);

  for (const id of selectedSet) {
    if (!correctSet.has(id)) {
      return { earned: 0, max: 1, correctIds: question.answers };
    }
  }

  const correctMarked = [...selectedSet].filter((id) => correctSet.has(id))
    .length;
  const earned = correctSet.size === 0 ? 0 : correctMarked / correctSet.size;
  return { earned, max: 1, correctIds: question.answers };
}

/**
 * Time bonus: reward finishing under budget. Returns multiplier in [1.0, 1.5].
 * Finishes at budget → 1.0×; finishes instantly → 1.5×.
 */
export function timeBonusMultiplier(
  elapsedSeconds: number,
  budgetSeconds: number
): number {
  if (budgetSeconds <= 0) return 1;
  const ratio = Math.min(1, Math.max(0, elapsedSeconds / budgetSeconds));
  return 1 + 0.5 * (1 - ratio);
}

export function pickRandomQuestions(
  pool: ExamQuestion[],
  excludeIds: Set<string>,
  n: number
): ExamQuestion[] {
  const available = pool.filter((q) => !excludeIds.has(q.id));
  const shuffled = [...available];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, n);
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
