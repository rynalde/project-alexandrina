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
  {
    id: 5,
    topic: "ingredients",
    q: "In a world model, the 'context' and the 'target' are:",
    opts: [
      "The input and its human-written label.",
      "Two parts of the same input: the visible part and the hidden part.",
      "The training set and the test set.",
      "The encoder and the predictor.",
    ],
    correct: 1,
    exp: "Both come from the same clip. The mask decides which part is visible (context) and which is hidden (target). No human label is involved.",
  },
  {
    id: 6,
    topic: "ingredients",
    q: "What is the job of the predictor?",
    opts: [
      "Turn raw pixels into a representation vector.",
      "Decide which patches to hide.",
      "Guess the target from the context's representation and the target's position.",
      "Compute the gradient of the loss.",
    ],
    correct: 2,
    exp: "The predictor is the 'imagination': given what was seen and where the hidden part is, it guesses what the hidden part contains.",
  },
  {
    id: 7,
    topic: "ingredients",
    q: "After pretraining, which component is normally kept for downstream tasks?",
    opts: [
      "The predictor.",
      "The mask.",
      "The loss function.",
      "The encoder.",
    ],
    correct: 3,
    exp: "The encoder learned to see and summarize — that's the reusable part. The predictor was scaffolding for the training game (V-JEPA 2 planning is a later exception).",
  },
  {
    id: 8,
    topic: "ingredients",
    q: "Which design decision determines whether a model is pixel-predicting or latent-predicting (JEPA-style)?",
    opts: [
      "The number of encoder layers.",
      "What the loss compares the prediction against: raw pixels or representations.",
      "Whether the data is video or images.",
      "The learning rate.",
    ],
    correct: 1,
    exp: "The loss target is the key choice. Compare against pixels → pixel prediction. Compare against the target's representation → latent prediction (JEPA).",
  },
];

export const WORLD_MODELS_TOPIC_LABELS: Record<string, string> = {
  overview: "What a World Model Is",
  ingredients: "The Three Ingredients",
};

export const WORLD_MODELS_SECTIONS: Section[] = [
  {
    id: "inicio",
    num: "00",
    title: "What a World Model Is",
    subtitle: "Learning by predicting, not by labeling",
  },
  {
    id: "ingredients",
    num: "01",
    title: "The Three Ingredients",
    subtitle: "Encoder, predictor, loss",
  },
  {
    id: "roadmap",
    num: "→",
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
