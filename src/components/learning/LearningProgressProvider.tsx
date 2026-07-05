"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createEmptyProgress,
  mergeProgress,
  readProgress,
  writeProgress,
  type LearningCourseConfig,
  type LearningProgressState,
  type LearningQuizScore,
} from "@/lib/course-learning";

interface LearningProgressValue {
  config: LearningCourseConfig;
  progress: LearningProgressState;
  markSectionComplete: (sectionId: string) => void;
  markInteractionComplete: (interactionId: string) => void;
  recordQuizScore: (
    sectionId: string,
    score: LearningQuizScore,
    weakTopics?: string[]
  ) => void;
  resetProgress: () => void;
}

const LearningProgressContext = createContext<LearningProgressValue | null>(
  null
);

export function LearningProgressProvider({
  config,
  children,
}: {
  config: LearningCourseConfig;
  children: ReactNode;
}) {
  const [progress, setProgress] = useState(createEmptyProgress);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setProgress(readProgress(config.storageKey));
      setLoaded(true);
    }, 0);

    return () => window.clearTimeout(id);
  }, [config.storageKey]);

  useEffect(() => {
    if (!loaded) return;
    writeProgress(config.storageKey, progress);
  }, [config.storageKey, loaded, progress]);

  const patchProgress = useCallback(
    (patch: Partial<LearningProgressState>) => {
      setProgress((current) => mergeProgress(current, patch));
    },
    []
  );

  const value = useMemo<LearningProgressValue>(
    () => ({
      config,
      progress,
      markSectionComplete: (sectionId) =>
        patchProgress({ completedSections: [sectionId] }),
      markInteractionComplete: (interactionId) =>
        patchProgress({ completedInteractions: [interactionId] }),
      recordQuizScore: (sectionId, score, weakTopics = []) =>
        patchProgress({
          completedSections: [sectionId],
          quizScores: { [sectionId]: score },
          weakTopics,
        }),
      resetProgress: () => setProgress(createEmptyProgress()),
    }),
    [config, patchProgress, progress]
  );

  return (
    <LearningProgressContext.Provider value={value}>
      {children}
    </LearningProgressContext.Provider>
  );
}

export function useLearningProgress() {
  return useContext(LearningProgressContext);
}
