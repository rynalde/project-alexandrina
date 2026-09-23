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
    ingredients: {
      id: "ingredients",
      objectives: [
        "Name the three parts every world model has and what each one does.",
        "Explain context and target as two parts of the same input.",
        "Say which part is usually kept after training, and why.",
      ],
      keyConcepts: ["encoder", "predictor", "loss", "mask", "context", "target"],
      examTraps: [
        "Context and target are two parts of the same input, not input and label.",
        "The predictor is usually discarded; the encoder is kept.",
        "The loss target (pixels vs representations) is the key design decision.",
      ],
      quizTopic: "ingredients",
      interaction: {
        id: "wm-ingredients-match",
        title: "Who does what?",
        kind: "matching",
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
