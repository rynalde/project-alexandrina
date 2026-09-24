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
    pixel_latent: {
      id: "pixel_latent",
      objectives: [
        "Explain why a pixel-prediction model produces blurry futures.",
        "Explain why pixel losses waste capacity on unpredictable detail.",
        "Describe what JEPA predicts instead, and what that costs.",
      ],
      keyConcepts: ["MSE averaging", "unpredictable detail", "joint embedding", "latent target"],
      examTraps: [
        "Blur is the optimum of squared error under uncertainty, not a network bug.",
        "In JEPA the target has its own encoder.",
        "Latent prediction opens the door to collapse.",
      ],
      quizTopic: "pixel_latent",
      interaction: { id: "wm-blur-lab", title: "Why pixel predictors go blurry", kind: "simulation" },
    },
    collapse: {
      id: "collapse",
      objectives: [
        "Explain representation collapse and why latent prediction invites it.",
        "Name the three families of defenses and one example of each.",
        "Say which defense I-JEPA and V-JEPA use, and how to detect collapse.",
      ],
      keyConcepts: ["collapse", "negatives", "VICReg", "SIGReg", "EMA", "stop-gradient", "predictor"],
      examTraps: [
        "Zero loss can mean collapse, not success.",
        "Pixel-reconstruction models can't collapse this way — their target is fixed data.",
        "JEPA needs no negatives; it uses BYOL-style asymmetry.",
        "SIGReg (LeJEPA) needs neither EMA nor stop-gradient.",
      ],
      quizTopic: "collapse",
      interaction: { id: "wm-collapse-lab", title: "Train a tiny JEPA — and watch it cheat", kind: "simulation" },
    },
    family: {
      id: "family",
      objectives: [
        "Place the main world-model papers on a timeline, 2018–2026.",
        "Sort them into the pixel branch and the representation branch.",
        "Say what JEPA inherited from each ancestor.",
      ],
      keyConcepts: ["World Models", "Dreamer", "MAE", "BYOL", "JEPA", "V-JEPA 2", "LeJEPA", "V-JEPA 2.1"],
      examTraps: [
        "Dreamer's world model is trained with pixel reconstruction.",
        "MAE masks like I-JEPA but predicts pixels.",
        "The 2022 JEPA paper is a proposal, not a trained model.",
      ],
      quizTopic: "family",
      interaction: { id: "wm-family-timeline", title: "The family tree", kind: "flashcards" },
    },
    ijepa: {
      id: "ijepa",
      objectives: [
        "Describe the masking strategy: 4 target blocks and 1 context block.",
        "Explain what each of the three networks sees and outputs.",
        "Explain why targets come from the target encoder's output, and how EMA works.",
      ],
      keyConcepts: ["context block", "target blocks", "mask tokens", "EMA", "L2 loss"],
      examTraps: [
        "The target encoder sees the full image; targets are cut from its output.",
        "The target encoder gets no gradient.",
        "No hand-crafted augmentations.",
      ],
      quizTopic: "ijepa",
      interaction: { id: "wm-ijepa-diagram", title: "I-JEPA, step by step", kind: "flow" },
    },
    vjepa: {
      id: "vjepa",
      objectives: [
        "Explain how a clip becomes tokens (tubelets) and compute the token count.",
        "Explain why ~90% masking and why the same mask in every frame.",
        "List what V-JEPA 2 changed.",
      ],
      keyConcepts: ["tubelet", "1,568 tokens", "tube masking", "L1 loss", "3D-RoPE", "ViT-g"],
      examTraps: [
        "A tubelet spans 2 frames.",
        "V-JEPA uses L1; I-JEPA uses L2.",
        "V-JEPA results are frozen-backbone results.",
      ],
      quizTopic: "vjepa",
      interaction: { id: "wm-tube-mask", title: "Why the same mask in every frame", kind: "simulation" },
    },
    usage: {
      id: "usage",
      objectives: [
        "Choose between a linear probe, an attentive probe and fine-tuning.",
        "Explain how an attentive probe works and why V-JEPA needs one.",
        "Explain how V-JEPA 2-AC plans robot actions in latent space, and why long tasks need sub-goals.",
        "Explain how prediction error becomes a test of intuitive physics.",
      ],
      keyConcepts: ["frozen evaluation", "linear probe", "attentive probe", "fine-tuning", "MPC", "CEM", "sub-goals", "surprise"],
      examTraps: [
        "Frozen evaluation still trains the probe.",
        "An attentive probe is not fine-tuning.",
        "V-JEPA 2-AC plans in representation space — no pixels generated.",
        "Its energy scores the imagined end state; long, non-greedy tasks need sub-goal images.",
      ],
      quizTopic: "usage",
      interaction: { id: "wm-planning-lab", title: "Plan by imagining: CEM, live", kind: "simulation" },
    },
    lab: {
      id: "lab",
      objectives: [
        "Build every piece of a JEPA and train it on unlabeled video.",
        "Catch collapse with a spread alarm and measure learning with linear probes.",
        "Plan with a frozen encoder, an action-conditioned predictor and CEM.",
      ],
      keyConcepts: ["EMA target", "stop-gradient", "layer-normed targets", "linear probe", "SIGReg", "CEM", "sub-goal"],
      examTraps: [
        "A near-zero loss with near-zero spread is collapse, not success.",
        "A random encoder is a baseline, not zero.",
        "Latent energy is only informative near the goal; far goals need sub-goals.",
      ],
      quizTopic: "lab",
      interaction: { id: "wm-python-lab", title: "Run the Python lab", kind: "simulation" },
    },
    roadmap: {
      id: "roadmap",
      objectives: [
        "See the whole of vol. x at a glance.",
        "Know which cadernos follow (PyTorch, building, applying).",
        "Find the primary sources behind every chapter.",
      ],
      keyConcepts: ["JEPA", "latent prediction", "collapse", "probing"],
      examTraps: [],
    },
  },
};
