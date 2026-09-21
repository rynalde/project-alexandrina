import type { Question, Section } from "@/lib/data";

export const WORLD_MODELS_QUESTIONS: Question[] = [
  {
    id: 1,
    topic: "overview",
    q: "The fundamental difference between a classifier and a world model is:",
    opts: [
      "The classifier uses neural networks and the world model uses statistical rules.",
      "The classifier maps input to a human-provided label; the world model predicts missing or future parts of its own input.",
      "The world model only works with video, the classifier only with images.",
      "The world model does not need training.",
    ],
    correct: 1,
    exp: "Classifier = supervised mapping input → label. World model = self-supervised prediction, where the target comes from the data itself.",
  },
  {
    id: 2,
    topic: "overview",
    q: "Why is self-supervised learning attractive at scale?",
    opts: [
      "Because it requires no data.",
      "Because it always achieves higher accuracy than supervised learning.",
      "Because the supervision signal comes from the data itself, allowing training on huge unlabeled corpora.",
      "Because it eliminates the need for GPUs.",
    ],
    correct: 2,
    exp: "The bottleneck in supervised learning is human labeling. Self-supervision removes it — frame 9 is already in the video.",
  },
  {
    id: 3,
    topic: "overview",
    q: "After pretraining a world model, what is normally reused for the real task?",
    opts: [
      "The predicted frames.",
      "The loss function.",
      "The learned representation (the encoder's output).",
      "The training dataset.",
    ],
    correct: 2,
    exp: "The prediction is a disposable pretext. The prize is the representation the encoder built in order to predict.",
  },
  {
    id: 4,
    topic: "overview",
    q: "Which statement is FALSE about world models?",
    opts: [
      "They learn notions like object permanence without anyone labeling them.",
      "By definition they must generate realistic pixels.",
      "They can be trained on unlabeled video.",
      "The term was popularized by Ha & Schmidhuber (2018).",
    ],
    correct: 1,
    exp: "Pixel generation is one option, not the definition. JEPA predicts in representation space and never reconstructs pixels.",
  },
];

export const WORLD_MODELS_TOPIC_LABELS: Record<string, string> = {
  overview: "What a World Model Is",
};

export const WORLD_MODELS_SECTIONS: Section[] = [
  {
    id: "inicio",
    num: "00",
    title: "What a World Model Is",
    subtitle: "Learning by predicting, not by labeling",
  },
  {
    id: "roadmap",
    num: "01",
    title: "Roadmap",
    subtitle: "Where this caderno is going",
  },
  {
    id: "simulado",
    num: "∞",
    title: "Final Simulation",
    subtitle: "Exam-style questions (growing as chapters land)",
  },
];
