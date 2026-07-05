import type { Question } from "@/lib/data";

export interface LearningInteraction {
  id: string;
  title: string;
  kind: "simulation" | "flow" | "drill" | "flashcards" | "matching";
}

export interface LearningSectionMeta {
  id: string;
  objectives: string[];
  keyConcepts: string[];
  examTraps: string[];
  quizTopic?: string;
  interaction?: LearningInteraction;
}

export interface LearningCourseConfig {
  courseId: string;
  storageKey: string;
  sections: Record<string, LearningSectionMeta>;
}

export interface LearningQuizScore {
  correct: number;
  total: number;
}

export interface LearningProgressState {
  completedSections: string[];
  completedInteractions: string[];
  quizScores: Record<string, LearningQuizScore>;
  weakTopics: string[];
}

export type LearningQuizItem = Question;

export function createEmptyProgress(): LearningProgressState {
  return {
    completedSections: [],
    completedInteractions: [],
    quizScores: {},
    weakTopics: [],
  };
}

export function parseProgress(value: string | null): LearningProgressState {
  if (!value) return createEmptyProgress();

  try {
    const raw = JSON.parse(value) as Partial<LearningProgressState>;
    return normalizeProgress(raw);
  } catch {
    return createEmptyProgress();
  }
}

export function serializeProgress(progress: LearningProgressState) {
  return JSON.stringify(progress);
}

export function mergeProgress(
  current: LearningProgressState,
  patch: Partial<LearningProgressState>
): LearningProgressState {
  return normalizeProgress({
    completedSections: [
      ...current.completedSections,
      ...(patch.completedSections ?? []),
    ],
    completedInteractions: [
      ...current.completedInteractions,
      ...(patch.completedInteractions ?? []),
    ],
    quizScores: {
      ...current.quizScores,
      ...(patch.quizScores ?? {}),
    },
    weakTopics: [...current.weakTopics, ...(patch.weakTopics ?? [])],
  });
}

export function readProgress(storageKey: string): LearningProgressState {
  if (typeof window === "undefined") return createEmptyProgress();
  try {
    return parseProgress(window.localStorage.getItem(storageKey));
  } catch {
    return createEmptyProgress();
  }
}

export function writeProgress(
  storageKey: string,
  progress: LearningProgressState
) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey, serializeProgress(progress));
  } catch {
    // ponytail: local-only progress can safely degrade to session state.
  }
}

function normalizeProgress(
  raw: Partial<LearningProgressState>
): LearningProgressState {
  const quizScores: Record<string, LearningQuizScore> = {};

  if (raw.quizScores && typeof raw.quizScores === "object") {
    Object.entries(raw.quizScores).forEach(([topic, score]) => {
      if (
        typeof score?.correct === "number" &&
        typeof score.total === "number" &&
        score.total >= 0 &&
        score.correct >= 0
      ) {
        quizScores[topic] = {
          correct: score.correct,
          total: score.total,
        };
      }
    });
  }

  return {
    completedSections: uniqueStrings(raw.completedSections),
    completedInteractions: uniqueStrings(raw.completedInteractions),
    quizScores,
    weakTopics: uniqueStrings(raw.weakTopics),
  };
}

function uniqueStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.filter((item) => typeof item === "string")));
}
