import type { LearningCourseConfig } from "@/lib/course-learning";

export const WORLD_MODELS_LEARNING_CONFIG: LearningCourseConfig = {
  courseId: "world-models",
  storageKey: "study:world-models:progress:v1",
  sections: {
    inicio: {
      id: "inicio",
      objectives: [
        "Tell a classifier apart from a world model.",
        "Explain why prediction produces free labels.",
        "Say what a model is forced to learn in order to predict well.",
      ],
      keyConcepts: [
        "self-supervised learning",
        "pretext task",
        "downstream task",
        "representation",
      ],
      examTraps: [
        "A world model is not by definition a generative model — JEPA never reconstructs pixels.",
        "Self-supervised is not unsupervised: there IS a target, it just comes from the data.",
        "The goal is the representation left behind, not an accurate prediction.",
      ],
      quizTopic: "overview",
      interaction: {
        id: "wm-two-tracks",
        title: "Classifier path vs world model path",
        kind: "flow",
      },
    },
    roadmap: {
      id: "roadmap",
      objectives: [
        "Know the nine chapters of vol. x and the order they unlock in.",
        "Know which cadernos follow (PyTorch, building, applying).",
      ],
      keyConcepts: ["JEPA", "latent prediction", "collapse", "probing"],
      examTraps: [],
    },
  },
};
