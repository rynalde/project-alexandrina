"use client";

import { useMemo, useState } from "react";
import { Boxes, Calculator, Clock3, Crosshair, Film, GitMerge, Layers, Shuffle, Target, Waves } from "lucide-react";
import { useLearningProgress } from "@/components/learning/LearningProgressProvider";
import { CompleteButton, LabShell, Meter, Panel, Seg, WM, mulberry32 } from "./ui";

/* ───────────────────────── ch04 · family timeline ───────────────────────── */

type Signal = "pixels" | "representations";
const FAMILY: Array<{
  year: string;
  name: string;
  who: string;
  signal: Signal;
  idea: string;
  lesson: string;
}> = [
  {
    year: "2018",
    name: "World Models",
    who: "Ha & Schmidhuber",
    signal: "pixels",
    idea: "V (a VAE) compresses each frame, M (an MDN-RNN) predicts the next latent, C (a tiny controller) acts. In VizDoom the controller was trained entirely inside the model's dream, then transferred back to the real game.",
    lesson: "Learn a model of the world first, then act inside it.",
  },
  {
    year: "2020",
    name: "Dreamer",
    who: "Hafner et al.",
    signal: "pixels",
    idea: "A latent dynamics model trained with pixel reconstruction; behaviour is learned by imagining trajectories in latent space. DreamerV3 later collected diamonds in Minecraft from scratch.",
    lesson: "Imagining in latent space is cheap and good for control.",
  },
  {
    year: "2020",
    name: "BYOL",
    who: "Grill et al.",
    signal: "representations",
    idea: "Two augmented views of one image. An online network plus a predictor predicts the target network's representation. The target is an EMA of the online network. No negatives.",
    lesson: "EMA target + predictor + stop-grad avoids collapse — JEPA inherits this.",
  },
  {
    year: "2021",
    name: "MAE",
    who: "He et al.",
    signal: "pixels",
    idea: "Hide 75% of image patches, reconstruct their pixels with a light decoder.",
    lesson: "Masking works at scale — but pixel targets spend capacity on detail.",
  },
  {
    year: "2022",
    name: "data2vec",
    who: "Baevski et al. (Meta)",
    signal: "representations",
    idea: "A student sees a masked input and predicts the representations an EMA teacher produces from the full input — one recipe for speech, images and text.",
    lesson: "Masked prediction in latent space with an EMA teacher — the I-JEPA paper's closest prior work.",
  },
  {
    year: "2022",
    name: "JEPA (position paper)",
    who: "LeCun — A Path Towards Autonomous Machine Intelligence",
    signal: "representations",
    idea: "Proposes the Joint-Embedding Predictive Architecture: predict the representation of y from the representation of x; stack them hierarchically (H-JEPA) as the world model of an agent.",
    lesson: "Predict in representation space, not in pixel space.",
  },
  {
    year: "2023",
    name: "I-JEPA",
    who: "Assran et al. (Meta)",
    signal: "representations",
    idea: "Images. From one context block, predict the representations of 4 target blocks. No hand-crafted augmentations. A ViT-H/14 trained on ImageNet in under 72 h on 16 A100s.",
    lesson: "The recipe works — and it is cheap.",
  },
  {
    year: "2024",
    name: "V-JEPA",
    who: "Bardes et al. (Meta)",
    signal: "representations",
    idea: "Video. Feature prediction only, ~90% spatio-temporal masking, ~2M videos. Frozen backbone + attentive probe (ViT-H/16, 384px): 81.9% Kinetics-400, 72.2% SSv2, 77.9% ImageNet.",
    lesson: "Latent prediction learns motion without labels or pixels.",
  },
  {
    year: "2025",
    name: "V-JEPA 2",
    who: "Meta FAIR",
    signal: "representations",
    idea: "Over 1M hours of video, ViT-g (~1B params). 77.3% SSv2. V-JEPA 2-AC trains a new action-conditioned predictor on the frozen encoder with under 62 h of robot video, and plans zero-shot pick-and-place on Franka arms.",
    lesson: "Understanding → prediction → planning with one world model.",
  },
];

export function FamilyTimeline() {
  const [filter, setFilter] = useState<"all" | Signal>("all");
  const [active, setActive] = useState(() => FAMILY.findIndex((item) => item.name === "I-JEPA"));
  const shown = FAMILY.map((item, index) => ({ item, index })).filter(
    ({ item }) => filter === "all" || item.signal === filter,
  );
  const current = FAMILY[active];

  return (
    <LabShell icon={<GitMerge size={15} />} title="The family tree, in one line">
      <Seg
        label="learning signal"
        value={filter}
        onChange={setFilter}
        options={[
          { value: "all", label: "all" },
          { value: "pixels", label: "reconstructs pixels" },
          { value: "representations", label: "predicts representations" },
        ]}
      />
      <div className="relative mt-5">
        <div className="absolute left-0 right-0 top-[15px] h-px bg-border" />
        <div className="relative flex gap-1 overflow-x-auto pb-2">
          {FAMILY.map((item, index) => {
            const visible = shown.some((entry) => entry.index === index);
            const isActive = index === active;
            return (
              <button
                key={item.name}
                type="button"
                disabled={!visible}
                onClick={() => setActive(index)}
                className={`flex min-w-[76px] flex-col items-center gap-1 rounded-md px-1 pb-1 transition ${visible ? "opacity-100" : "opacity-25"}`}
              >
                <span
                  className="flex size-[30px] items-center justify-center rounded-full border-2 font-mono text-[9px]"
                  style={{
                    borderColor: item.signal === "pixels" ? WM.ink : WM.rubric,
                    background: isActive ? (item.signal === "pixels" ? WM.ink : WM.rubric) : WM.paper,
                    color: isActive ? WM.paper : WM.ink,
                  }}
                >
                  {item.year.slice(2)}
                </span>
                <span className={`text-center text-[11px] leading-tight ${isActive ? "font-semibold text-ink" : "text-muted-foreground"}`}>
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-3 rounded-lg border border-border bg-background p-3 animate-fade-in" key={current.name}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="font-serif text-lg italic text-ink">
            {current.name} <span className="font-sans text-sm not-italic text-ink-fade">· {current.year}</span>
          </div>
          <span
            className="rounded px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-paper"
            style={{ background: current.signal === "pixels" ? WM.ink : WM.rubric }}
          >
            {current.signal === "pixels" ? "reconstructs pixels" : "predicts representations"}
          </span>
        </div>
        <div className="mt-0.5 text-xs text-ink-fade">{current.who}</div>
        <p className="mt-2 text-sm leading-relaxed text-ink">{current.idea}</p>
        <p className="mt-2 border-l-2 border-rubric pl-2.5 text-sm italic leading-relaxed text-muted-foreground">{current.lesson}</p>
      </div>
      <CompleteButton interactionId="wm-family-timeline" />
    </LabShell>
  );
}

/* ───────────────────────── ch05 · I-JEPA diagram ───────────────────────── */

type Part = "image" | "ctx" | "tgt" | "pred" | "tokens" | "reps" | "loss" | "ema";
const IJEPA_STEPS: Array<{ title: string; text: string; parts: Part[]; grad?: boolean }> = [
  { title: "1 · patchify", text: "Cut the 224×224 image into a grid of patches. Each patch becomes a token.", parts: ["image"] },
  { title: "2 · sample masks", text: "Pick 4 target blocks (15–20% of the image each) and one big context block (85–100%). Remove any overlap from the context so the answer can't leak.", parts: ["image"] },
  { title: "3 · context encoder", text: "A ViT sees ONLY the context patches and outputs one representation per visible patch.", parts: ["image", "ctx"] },
  { title: "4 · target encoder", text: "A second ViT sees the FULL image. The targets are the representations of the target blocks, cut from its OUTPUT — not from its input.", parts: ["image", "tgt", "reps"] },
  { title: "5 · predictor", text: "A narrow ViT gets the context tokens plus one mask token per target patch, each carrying its position. It runs once per target block and predicts the representation at every patch of that block.", parts: ["ctx", "tokens", "pred"] },
  { title: "6 · loss", text: "Average L2 distance between the predicted and the target patch representations.", parts: ["pred", "reps", "loss"] },
  { title: "7 · update", text: "Gradients flow into the predictor and the context encoder only. The target encoder gets none: it is updated as an EMA of the context encoder (τ ramps from 0.996 to 1.0).", parts: ["ctx", "pred", "loss", "ema", "tgt"], grad: true },
];

function DiagramBox({ x, y, w, h, label, sub, on }: { x: number; y: number; w: number; h: number; label: string; sub?: string; on: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="2.5" fill={on ? "rgba(199,80,46,0.12)" : WM.paper} stroke={on ? WM.rubric : WM.fade} strokeWidth={on ? 0.9 : 0.45} className="transition-all duration-300" />
      <text x={x + w / 2} y={y + (sub ? h / 2 - 0.6 : h / 2 + 1.6)} textAnchor="middle" className="fill-ink font-sans text-[4.6px] font-semibold">{label}</text>
      {sub ? <text x={x + w / 2} y={y + h / 2 + 4.8} textAnchor="middle" className="fill-ink font-mono text-[3.4px]" opacity="0.6">{sub}</text> : null}
    </g>
  );
}

export function IJepaDiagram() {
  const [step, setStep] = useState(0);
  const [showGrad, setShowGrad] = useState(false);
  const current = IJEPA_STEPS[step];
  const grad = showGrad || Boolean(current.grad);
  const on = (part: Part) => current.parts.includes(part);
  const learnColor = grad ? WM.rubric : WM.fade;
  const frozenColor = grad ? WM.olive : WM.fade;

  const cells = Array.from({ length: 36 }, (_, index) => {
    const r = Math.floor(index / 6);
    const c = index % 6;
    const target = (r <= 1 && c >= 3 && c <= 4) || (r >= 3 && r <= 4 && c <= 1);
    return { r, c, target };
  });

  return (
    <LabShell icon={<Layers size={15} />} title="I-JEPA, step by step">
      <svg viewBox="0 0 220 128" className="w-full rounded-lg border border-border bg-background" role="img" aria-label="I-JEPA architecture diagram">
        <defs>
          <marker id="wm-arrow" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M0 0 L6 3 L0 6 z" fill={WM.ink} />
          </marker>
        </defs>
        {/* image */}
        <g opacity={on("image") ? 1 : 0.55} className="transition-opacity duration-300">
          {cells.map((cell) => (
            <rect
              key={`${cell.r}-${cell.c}`}
              x={6 + cell.c * 6.6}
              y={44 + cell.r * 6.6}
              width="6"
              height="6"
              rx="0.6"
              fill={step >= 1 ? (cell.target ? WM.rubric : WM.paperDark) : WM.paperDark}
              stroke={WM.faint}
              strokeWidth="0.2"
            />
          ))}
          <text x="25.8" y="90" textAnchor="middle" className="fill-ink font-mono text-[3.6px]">image</text>
        </g>
        {/* arrows */}
        <path d="M46 52 L62 30" stroke={learnColor} strokeWidth={grad ? 0.9 : 0.5} fill="none" markerEnd="url(#wm-arrow)" />
        <text x="44" y="37" className="fill-ink font-mono text-[3px]" opacity="0.7">context only</text>
        <path d="M46 78 L62 100" stroke={frozenColor} strokeWidth={grad ? 0.9 : 0.5} fill="none" markerEnd="url(#wm-arrow)" />
        <text x="44" y="95" className="fill-ink font-mono text-[3px]" opacity="0.7">full image</text>
        <path d="M108 28 L124 28" stroke={learnColor} strokeWidth={grad ? 0.9 : 0.5} markerEnd="url(#wm-arrow)" />
        <path d="M146 52 L146 40" stroke={learnColor} strokeWidth={grad ? 0.9 : 0.5} markerEnd="url(#wm-arrow)" />
        <path d="M168 30 L184 56" stroke={learnColor} strokeWidth={grad ? 0.9 : 0.5} fill="none" markerEnd="url(#wm-arrow)" />
        <path d="M108 102 L124 102" stroke={frozenColor} strokeWidth={grad ? 0.9 : 0.5} markerEnd="url(#wm-arrow)" />
        <path d="M168 100 L184 76" stroke={frozenColor} strokeWidth={grad ? 0.9 : 0.5} fill="none" markerEnd="url(#wm-arrow)" />
        {grad ? (
          <g className="animate-fade-in">
            <circle cx="176" cy="88" r="3.2" fill={WM.paper} stroke={WM.olive} strokeWidth="0.6" />
            <path d="M174 86 L178 90 M178 86 L174 90" stroke={WM.olive} strokeWidth="0.6" />
            <text x="181" y="93" className="fill-ink font-mono text-[3px]">stop-grad</text>
          </g>
        ) : null}
        {/* EMA */}
        <path d="M86 40 L86 90" stroke={on("ema") ? WM.olive : WM.faint} strokeWidth={on("ema") ? 0.9 : 0.5} strokeDasharray="2 1.5" markerEnd="url(#wm-arrow)" />
        <text x="89" y="67" className="fill-ink font-mono text-[3.6px]" opacity={on("ema") ? 1 : 0.5}>EMA</text>
        {/* boxes */}
        <DiagramBox x={64} y={18} w={44} h={22} label="context encoder" sub="ViT · trained" on={on("ctx")} />
        <DiagramBox x={64} y={90} w={44} h={22} label="target encoder" sub="EMA copy · no grad" on={on("tgt")} />
        <DiagramBox x={124} y={18} w={44} h={22} label="predictor" sub="narrow ViT" on={on("pred")} />
        <DiagramBox x={124} y={90} w={44} h={22} label="target reps" sub="blocks cut from output" on={on("reps")} />
        <DiagramBox x={184} y={55} w={32} h={22} label="L2 loss" sub="pred vs target" on={on("loss")} />
        {/* mask tokens */}
        <g opacity={on("tokens") ? 1 : 0.5} className="transition-opacity duration-300">
          {[0, 1, 2, 3].map((index) => (
            <rect key={index} x={133 + index * 7} y={53} width="5" height="5" rx="1" fill={on("tokens") ? WM.rubric : WM.paperDark} stroke={WM.fade} strokeWidth="0.3" />
          ))}
          <text x="146" y="64" textAnchor="middle" className="fill-ink font-mono text-[3px]">mask tokens + positions</text>
        </g>
      </svg>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {IJEPA_STEPS.map((item, index) => (
          <button
            key={item.title}
            type="button"
            onClick={() => setStep(index)}
            className={`min-h-9 min-w-9 rounded-md border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest transition ${
              index === step ? "border-transparent bg-ink text-paper" : "border-border bg-background text-ink hover:border-rubric/40"
            }`}
          >
            {index + 1}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-ink">
          <input type="checkbox" checked={grad} onChange={(event) => setShowGrad(event.target.checked)} disabled={Boolean(current.grad)} className="accent-rubric" />
          gradient flow
        </label>
      </div>
      <div className="mt-3">
        <Panel label={current.title}>{current.text}</Panel>
      </div>
      {grad ? (
        <div className="mt-2 flex flex-wrap gap-3 font-mono text-[9px] uppercase tracking-widest text-ink-fade">
          <span className="flex items-center gap-1"><span className="h-0.5 w-4" style={{ background: WM.rubric }} /> gets gradient</span>
          <span className="flex items-center gap-1"><span className="h-0.5 w-4" style={{ background: WM.olive }} /> no gradient (stop-grad)</span>
        </div>
      ) : null}
      <CompleteButton interactionId="wm-ijepa-diagram" />
    </LabShell>
  );
}

/* ───────────────────────── ch05 · I-JEPA mask sampler ───────────────────────── */

const GRID = 14;

function sampleIJepaMasks(seed: number) {
  const rand = mulberry32(seed);
  const uniform = (lo: number, hi: number) => lo + rand() * (hi - lo);
  const block = (scale: number, aspect: number) => {
    const area = scale * GRID * GRID;
    const h = Math.max(1, Math.min(GRID, Math.round(Math.sqrt(area * aspect))));
    const w = Math.max(1, Math.min(GRID, Math.round(Math.sqrt(area / aspect))));
    const top = Math.floor(rand() * (GRID - h + 1));
    const left = Math.floor(rand() * (GRID - w + 1));
    return { top, left, h, w };
  };
  const targets = Array.from({ length: 4 }, () => block(uniform(0.15, 0.2), uniform(0.75, 1.5)));
  const context = block(uniform(0.85, 1.0), 1);
  const inside = (b: { top: number; left: number; h: number; w: number }, r: number, c: number) =>
    r >= b.top && r < b.top + b.h && c >= b.left && c < b.left + b.w;
  return Array.from({ length: GRID * GRID }, (_, index) => {
    const r = Math.floor(index / GRID);
    const c = index % GRID;
    const targetId = targets.findIndex((t) => inside(t, r, c));
    if (targetId >= 0) return { kind: "target" as const, targetId };
    if (inside(context, r, c)) return { kind: "context" as const, targetId: -1 };
    return { kind: "none" as const, targetId: -1 };
  });
}

const TARGET_SHADES = ["#c7502e", "#a8431f", "#d9714f", "#8f3a1c"];

export function MaskSampler() {
  const [seed, setSeed] = useState(3);
  const [rolls, setRolls] = useState(0);
  const cells = useMemo(() => sampleIJepaMasks(seed), [seed]);
  const total = GRID * GRID;
  const target = cells.filter((cell) => cell.kind === "target").length;
  const context = cells.filter((cell) => cell.kind === "context").length;

  return (
    <LabShell icon={<Target size={15} />} title="Sample I-JEPA masks yourself" kicker="micro-interaction">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,260px)_1fr]">
        <div className="grid gap-[2px] rounded-md border border-border bg-background p-1" style={{ gridTemplateColumns: `repeat(${GRID}, minmax(0, 1fr))` }}>
          {cells.map((cell, index) => (
            <div
              key={index}
              className="aspect-square rounded-[1.5px] transition-colors duration-300"
              style={{
                background:
                  cell.kind === "target" ? TARGET_SHADES[cell.targetId] : cell.kind === "context" ? WM.paperDark : "transparent",
                outline: cell.kind === "none" ? `1px dashed ${WM.faint}` : undefined,
              }}
            />
          ))}
        </div>
        <div className="space-y-3">
          <Meter label="context (encoder sees)" value={context / total} tone="ink" />
          <Meter label="targets (4 blocks, predicted)" value={target / total} />
          <p className="text-sm leading-relaxed text-muted-foreground">
            14×14 = 196 patches (a 224px image cut into 16px patches). Targets are <b className="text-ink">big</b> enough to be
            semantic — a whole part of an object. The context is <b className="text-ink">spread out</b> enough to be
            informative. The paper found both conditions essential.
          </p>
          <button
            type="button"
            onClick={() => {
              setSeed((value) => value * 7 + 11);
              setRolls((value) => value + 1);
            }}
            className="flex min-h-9 items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-paper"
          >
            <Shuffle size={12} /> resample {rolls > 0 ? `(${rolls})` : ""}
          </button>
        </div>
      </div>
    </LabShell>
  );
}

/* ───────────────────────── ch05 · EMA lab ───────────────────────── */

const EMA_STEPS = 120;
const ONLINE = (() => {
  const rand = mulberry32(9);
  let w = 8;
  return Array.from({ length: EMA_STEPS }, () => {
    w += 0.28 + (rand() - 0.5) * 3.2;
    return w;
  });
})();

function emaSeries(tau: number) {
  const out: number[] = [];
  let t = ONLINE[0];
  for (const w of ONLINE) {
    t = tau * t + (1 - tau) * w;
    out.push(t);
  }
  return out;
}

export function EmaLab() {
  const [tau, setTau] = useState(0.99);
  const target = useMemo(() => emaSeries(tau), [tau]);
  const min = Math.min(...ONLINE, ...target) - 2;
  const max = Math.max(...ONLINE, ...target) + 2;
  const toPath = (series: number[]) =>
    series.map((value, index) => `${index === 0 ? "M" : "L"}${(index / (EMA_STEPS - 1)) * 120} ${48 - ((value - min) / (max - min)) * 44}`).join(" ");

  return (
    <LabShell icon={<Waves size={15} />} title="The slow teacher: EMA" kicker="micro-interaction">
      <div className="mb-3 rounded-md bg-background px-3 py-2 text-center font-mono text-sm text-ink">
        θ<sub>target</sub> ← τ · θ<sub>target</sub> + (1 − τ) · θ<sub>online</sub>
      </div>
      <Seg
        label="momentum τ"
        value={tau}
        onChange={setTau}
        options={[
          { value: 0.9, label: "0.9" },
          { value: 0.99, label: "0.99" },
          { value: 0.996, label: "0.996" },
          { value: 0.999, label: "0.999" },
        ]}
      />
      <svg viewBox="0 0 120 50" className="mt-3 w-full rounded-lg border border-border bg-background" role="img" aria-label="Online weights versus EMA target weights over training">
        <path d={toPath(ONLINE)} fill="none" stroke={WM.rubric} strokeWidth="0.6" opacity="0.8" />
        <path d={toPath(target)} fill="none" stroke={WM.olive} strokeWidth="1.1" className="transition-all duration-300" />
      </svg>
      <div className="mt-2 flex flex-wrap gap-3 font-mono text-[9px] uppercase tracking-widest text-ink-fade">
        <span className="flex items-center gap-1"><span className="h-0.5 w-4" style={{ background: WM.rubric }} /> online encoder (gets gradients, noisy)</span>
        <span className="flex items-center gap-1"><span className="h-0.5 w-4" style={{ background: WM.olive }} /> target encoder (EMA, smooth)</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Higher τ = a slower, steadier teacher. I-JEPA ramps τ from <b className="text-ink">0.996 → 1.0</b>; V-JEPA from{" "}
        <b className="text-ink">0.998 → 1.0</b>. By the end the teacher barely moves.
      </p>
    </LabShell>
  );
}

/* ───────────────────────── ch06 · tube masking lab ───────────────────────── */

const T_FRAMES = 4;
const T_SIDE = 6;

function blockMask(rand: () => number) {
  const cells = new Array<boolean>(T_SIDE * T_SIDE).fill(false);
  let guard = 0;
  while (cells.filter(Boolean).length / cells.length < 0.72 && guard < 12) {
    guard += 1;
    const h = 2 + Math.floor(rand() * 3);
    const w = 2 + Math.floor(rand() * 3);
    const top = Math.floor(rand() * (T_SIDE - h + 1));
    const left = Math.floor(rand() * (T_SIDE - w + 1));
    for (let r = top; r < top + h; r += 1) for (let c = left; c < left + w; c += 1) cells[r * T_SIDE + c] = true;
  }
  return cells;
}

export function TubeMaskLab() {
  const [mode, setMode] = useState<"frame" | "tube">("frame");
  const [seed, setSeed] = useState(5);
  const frames = useMemo(() => {
    const rand = mulberry32(seed);
    if (mode === "tube") {
      const shared = blockMask(rand);
      return Array.from({ length: T_FRAMES }, () => shared);
    }
    return Array.from({ length: T_FRAMES }, () => blockMask(rand));
  }, [mode, seed]);

  const leak = (f: number, i: number) =>
    frames[f][i] && ((f > 0 && !frames[f - 1][i]) || (f < T_FRAMES - 1 && !frames[f + 1][i]));
  const hidden = frames.flat().filter(Boolean).length;
  const leaks = frames.reduce(
    (sum, frame, f) => sum + frame.reduce((inner, _, i) => inner + (leak(f, i) ? 1 : 0), 0),
    0,
  );

  return (
    <LabShell icon={<Film size={15} />} title="Why V-JEPA hides the same region in every frame">
      <Seg
        label="masking"
        value={mode}
        onChange={setMode}
        options={[
          { value: "frame", label: "new mask each frame" },
          { value: "tube", label: "same mask every frame (V-JEPA)" },
        ]}
      />
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {frames.map((frame, f) => (
          <div key={f}>
            <div className="grid grid-cols-6 gap-[2px] rounded border border-border bg-background p-[3px]">
              {frame.map((isHidden, i) => {
                const isLeak = leak(f, i);
                return (
                  <div
                    key={i}
                    className="relative aspect-square rounded-[2px] transition-colors duration-300"
                    style={{ background: isHidden ? WM.rubric : WM.paperDark }}
                  >
                    {isLeak ? <span className="absolute inset-[30%] rounded-full bg-paper" /> : null}
                  </div>
                );
              })}
            </div>
            <div className="mt-1 text-center font-mono text-[9px] uppercase tracking-widest text-ink-fade">t = {f + 1}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Meter label="masking ratio" value={hidden / (T_FRAMES * T_SIDE * T_SIDE)} tone="ink" />
        <Meter label="copyable from a neighbour frame" value={hidden ? leaks / hidden : 0} display={`${leaks} / ${hidden}`} />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        White dots = hidden patches whose exact spot is <b className="text-ink">visible</b> in the frame before or after. Consecutive frames are
        nearly identical, so the model could just copy — and learn nothing about motion. Repeating the mask through time closes that shortcut.
      </p>
      <div className="mt-2 flex items-center gap-3">
        <button type="button" onClick={() => setSeed((value) => value * 5 + 3)} className="flex min-h-9 items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-ink hover:text-rubric">
          <Shuffle size={12} /> resample
        </button>
      </div>
      <CompleteButton interactionId="wm-tube-mask" />
    </LabShell>
  );
}

/* ───────────────────────── ch06 · token counter ───────────────────────── */

export function TokenCounter() {
  const [frames, setFrames] = useState(16);
  const [res, setRes] = useState(224);
  const [tube, setTube] = useState(2);
  const side = res / 16;
  const tokens = (frames / tube) * side * side;
  const cost = (tokens / 1568) ** 2;

  return (
    <LabShell icon={<Calculator size={15} />} title="How many tokens is a video?" kicker="micro-interaction">
      <div className="grid gap-3 sm:grid-cols-3">
        <Seg label="frames" value={frames} onChange={setFrames} options={[8, 16, 32, 64].map((v) => ({ value: v, label: String(v) }))} />
        <Seg label="resolution" value={res} onChange={setRes} options={[224, 256, 384].map((v) => ({ value: v, label: `${v}px` }))} />
        <Seg label="tubelet depth" value={tube} onChange={setTube} options={[1, 2].map((v) => ({ value: v, label: `${v} frame${v > 1 ? "s" : ""}` }))} />
      </div>
      <div className="mt-4 rounded-lg border border-border bg-background p-3 text-center">
        <div className="font-mono text-sm text-ink">
          ({frames} ÷ {tube}) × ({res} ÷ 16)² = {frames / tube} × {side} × {side}
        </div>
        <div className="mt-1 font-serif text-3xl italic text-rubric">{tokens.toLocaleString("en-US")} tokens</div>
        <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-ink-fade">
          attention cost ≈ {cost < 10 ? cost.toFixed(1) : Math.round(cost).toLocaleString("en-US")}× the V-JEPA default (1,568 tokens)
        </div>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Self-attention cost grows with tokens². That is why V-JEPA 2 trains mostly at 16 frames / 256px and only moves to
        longer, higher-resolution clips (64 frames, up to 384px) in a short final phase — about 8× cheaper than training at full size all the way.
      </p>
    </LabShell>
  );
}

/* ───────────────────────── ch07 · probe lab ───────────────────────── */

const PROBE_OPTIONS = ["linear probe", "attentive probe", "full fine-tune", "action-conditioned planning"] as const;
const PROBE_SCENARIOS: Array<{ prompt: string; correct: (typeof PROBE_OPTIONS)[number]; note: string }> = [
  {
    prompt: "Frozen V-JEPA 2 encoder, ~1,000 labeled UCF101 clips, a free Colab T4. You want an action classifier.",
    correct: "attentive probe",
    note: "Encoder frozen, only a small cross-attention head is trained — fits a T4. V-JEPA outputs patch tokens, so a learned query that attends over them beats plain averaging.",
  },
  {
    prompt: "You just want the fastest sanity check that the features separate your classes at all.",
    correct: "linear probe",
    note: "Average the tokens, train one linear layer. Cheapest possible test — a lower ceiling, but it answers the question in minutes.",
  },
  {
    prompt: "8 A100s, 100k labeled clips, and you need the last few points of accuracy.",
    correct: "full fine-tune",
    note: "Unfreeze the encoder and train everything. Best accuracy, highest cost — and it overfits easily on small datasets.",
  },
  {
    prompt: "A robot arm must move a cup until the scene matches a goal photo — no task-specific training.",
    correct: "action-conditioned planning",
    note: "V-JEPA 2-AC imagines the outcome of candidate actions in latent space and picks the ones whose predicted state is closest to the goal's representation.",
  },
];

export function ProbeLab() {
  const learning = useLearningProgress();
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const scenario = PROBE_SCENARIOS[index];
  const correct = answer === scenario.correct;
  const last = index === PROBE_SCENARIOS.length - 1;

  return (
    <LabShell icon={<Crosshair size={15} />} title="Pick the right way to use the encoder">
      <div className="mb-3 flex gap-1">
        {PROBE_SCENARIOS.map((item, i) => (
          <span key={item.prompt} className={`h-1.5 flex-1 rounded-full ${i <= index ? "bg-rubric" : "bg-border"}`} />
        ))}
      </div>
      <div className="font-serif text-lg italic leading-snug text-ink">{scenario.prompt}</div>
      <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
        {PROBE_OPTIONS.map((option) => {
          const picked = answer === option;
          const tone = picked
            ? option === scenario.correct
              ? "border-transparent bg-ink text-paper"
              : "border-rubric text-rubric line-through bg-background"
            : "border-border bg-background text-ink hover:border-rubric/40";
          return (
            <button key={option} type="button" onClick={() => setAnswer(option)} disabled={correct} className={`min-h-10 rounded-md border px-3 py-2 text-left text-sm transition ${tone}`}>
              {option}
            </button>
          );
        })}
      </div>
      {answer ? (
        <div className="mt-3 animate-fade-in">
          <Panel label={correct ? "yes" : "not this one"}>{correct ? scenario.note : "Think about what is frozen, what is trained, and what the task needs."}</Panel>
        </div>
      ) : null}
      {correct ? (
        <button
          type="button"
          onClick={() => {
            if (last) {
              learning?.markInteractionComplete("wm-probe-lab");
              setIndex(0);
            } else {
              setIndex((value) => value + 1);
            }
            setAnswer(null);
          }}
          className="mt-3 min-h-10 rounded-md bg-ink px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-paper"
        >
          {last ? "finish · mark done" : "next scenario →"}
        </button>
      ) : null}
    </LabShell>
  );
}

/* ───────────────────────── ch07 · attentive pooling viz ───────────────────────── */

const POOL_TOKENS = [
  { label: "floor", attn: 0.06 },
  { label: "wall", attn: 0.04 },
  { label: "arm", attn: 0.24 },
  { label: "arm", attn: 0.21 },
  { label: "torso", attn: 0.2 },
  { label: "head", attn: 0.12 },
  { label: "window", attn: 0.04 },
  { label: "floor", attn: 0.09 },
];

export function AttentivePoolViz() {
  const [mode, setMode] = useState<"mean" | "attentive">("mean");
  return (
    <LabShell icon={<Boxes size={15} />} title="Mean pooling vs a learned query" kicker="micro-interaction">
      <Seg
        value={mode}
        onChange={setMode}
        options={[
          { value: "mean", label: "mean pooling (linear probe)" },
          { value: "attentive", label: "learned query (attentive probe)" },
        ]}
      />
      <div className="mt-4 flex h-32 items-end gap-1.5 rounded-lg border border-border bg-background px-2 pb-1 pt-3">
        {POOL_TOKENS.map((token, index) => {
          const weight = mode === "mean" ? 1 / POOL_TOKENS.length : token.attn;
          return (
            <div key={index} className="flex flex-1 flex-col items-center justify-end gap-1">
              <span className="font-mono text-[9px] text-ink-fade">{Math.round(weight * 100)}%</span>
              <div
                className="w-full rounded-t transition-all duration-500"
                style={{ height: `${weight * 330}%`, maxHeight: "78px", minHeight: "3px", background: token.attn > 0.1 ? WM.rubric : WM.ink, opacity: mode === "mean" ? 0.55 : 1 }}
              />
              <span className="font-mono text-[9px] text-ink">{token.label}</span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        A clip of push-ups, 8 of its patch tokens. {mode === "mean"
          ? "Mean pooling gives every token the same weight — background dilutes the signal."
          : "The attentive probe learns one query token that asks \"what matters for the action?\" through cross-attention. Arm and torso get most of the weight."}
      </p>
      <div className="mt-2 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-ink-fade">
        <Clock3 size={11} /> illustrative weights, not from a trained model
      </div>
    </LabShell>
  );
}
