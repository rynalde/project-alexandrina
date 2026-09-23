"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, CircleDot, Grid3x3, Pause, Play, Shuffle, Sparkles } from "lucide-react";
import { CompleteButton, LabShell, Meter, Panel, Seg, WM, mulberry32 } from "./ui";

/* ───────────────────────── ch00 · predict the next frame ───────────────────────── */

const TRAIL = [
  { x: 12, y: 46 },
  { x: 34, y: 32 },
  { x: 56, y: 26 },
];
const GUESSES = [
  { id: "A", x: 78, y: 18, verdict: "Straight-line extrapolation. Close — but real throws bend: gravity keeps pulling the ball down." },
  { id: "B", x: 78, y: 30, verdict: "Yes. It keeps its forward speed and the arc bends down. You just used momentum and gravity — nobody labeled them for you." },
  { id: "C", x: 56, y: 48, verdict: "Objects don't lose their forward speed for no reason. That would break momentum." },
] as const;

export function NextFrameGuess() {
  const [pick, setPick] = useState<string | null>(null);
  const chosen = GUESSES.find((guess) => guess.id === pick);
  const right = pick === "B";

  return (
    <LabShell icon={<CircleDot size={15} />} title="Where is the ball in frame 4?">
      <svg viewBox="0 0 100 60" className="w-full rounded-lg border border-border bg-background" role="img" aria-label="Three frames of a thrown ball and three candidate positions for frame four">
        <line x1="0" y1="54" x2="100" y2="54" stroke={WM.faint} strokeWidth="0.6" />
        {TRAIL.map((point, index) => (
          <g key={index}>
            <circle cx={point.x} cy={point.y} r="3.4" fill={WM.ink} opacity={0.35 + index * 0.3} />
            <text x={point.x} y={point.y - 5.5} textAnchor="middle" className="fill-ink font-mono text-[3px]">
              f{index + 1}
            </text>
          </g>
        ))}
        {GUESSES.map((guess) => {
          const isPick = pick === guess.id;
          const showTruth = pick !== null && guess.id === "B";
          return (
            <g key={guess.id} onClick={() => setPick(guess.id)} className="cursor-pointer">
              <circle
                cx={guess.x}
                cy={guess.y}
                r="3.4"
                fill={showTruth ? WM.rubric : "transparent"}
                stroke={isPick || showTruth ? WM.rubric : WM.fade}
                strokeWidth="0.7"
                strokeDasharray={showTruth ? undefined : "1.2 1"}
              />
              <text x={guess.x + 5} y={guess.y + 1.2} className="fill-ink font-mono text-[3.4px]">
                {guess.id}
              </text>
            </g>
          );
        })}
        {pick ? (
          <path
            d="M12 46 Q 45 14 78 30"
            fill="none"
            stroke={WM.rubric}
            strokeWidth="0.5"
            strokeDasharray="1.5 1.2"
            className="animate-fade-in"
          />
        ) : null}
      </svg>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {GUESSES.map((guess) => (
          <button
            key={guess.id}
            type="button"
            onClick={() => setPick(guess.id)}
            className={`min-h-9 rounded-md border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition ${
              pick === guess.id ? "border-transparent bg-ink text-paper" : "border-border bg-background text-ink hover:border-rubric/40"
            }`}
          >
            guess {guess.id}
          </button>
        ))}
      </div>
      {chosen ? (
        <div className="mt-3 animate-fade-in">
          <Panel label={right ? "correct" : "not quite"}>{chosen.verdict}</Panel>
          {right ? (
            <p className="mt-3 text-sm leading-relaxed text-ink">
              That was the pretext task: frames 1–3 were the <b>context</b>, frame 4 the <b>target</b>.
              A world model plays this game millions of times.
            </p>
          ) : null}
        </div>
      ) : null}
      <CompleteButton interactionId="wm-next-frame" />
    </LabShell>
  );
}

/* ───────────────────────── ch01 · mask playground ───────────────────────── */

type MaskMode = "future" | "random" | "tube";
const FRAMES = 6;
const SIDE = 4;

const MODE_INFO: Record<MaskMode, { task: string; note: string }> = {
  future: {
    task: "Next-frame prediction",
    note: "Context = the past, target = the future. The classic video world model (Ha & Schmidhuber, Dreamer).",
  },
  random: {
    task: "Masked prediction — fill the gaps",
    note: "Context = scattered visible patches. MAE hides random patches and reconstructs their pixels. I-JEPA deliberately uses a few large blocks instead — random patches did far worse in its ablation.",
  },
  tube: {
    task: "Spatio-temporal block masking",
    note: "The same region is hidden in every frame, so the answer can't be copied from a neighbouring frame. This is V-JEPA's trick (chapter 06).",
  },
};

function buildMask(mode: MaskMode, seed: number): boolean[][] {
  const rand = mulberry32(seed);
  return Array.from({ length: FRAMES }, (_, frame) =>
    Array.from({ length: SIDE * SIDE }, (_, cell) => {
      const row = Math.floor(cell / SIDE);
      const col = cell % SIDE;
      if (mode === "future") return frame >= FRAMES - 2;
      if (mode === "tube") return row >= 1 && row <= 2 && col >= 1 && col <= 2;
      return rand() < 0.45;
    }),
  );
}

export function MaskPlayground() {
  const [mode, setMode] = useState<MaskMode>("future");
  const [seed, setSeed] = useState(7);
  const mask = useMemo(() => buildMask(mode, seed), [mode, seed]);
  const total = FRAMES * SIDE * SIDE;
  const hidden = mask.flat().filter(Boolean).length;
  const info = MODE_INFO[mode];

  return (
    <LabShell icon={<Grid3x3 size={15} />} title="Same clip, different masks">
      <Seg
        label="mask rule"
        value={mode}
        onChange={setMode}
        options={[
          { value: "future", label: "hide the future" },
          { value: "random", label: "hide random patches" },
          { value: "tube", label: "hide a block in every frame" },
        ]}
      />
      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {mask.map((frame, frameIndex) => (
          <div key={frameIndex}>
            <div className="grid grid-cols-4 gap-[2px] rounded border border-border bg-background p-[3px]">
              {frame.map((isHidden, cellIndex) => (
                <div
                  key={cellIndex}
                  className="aspect-square rounded-[2px] transition-colors duration-300"
                  style={{ background: isHidden ? WM.rubric : WM.paperDark }}
                />
              ))}
            </div>
            <div className="mt-1 text-center font-mono text-[9px] uppercase tracking-widest text-ink-fade">
              frame {frameIndex + 1}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-ink-fade">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm" style={{ background: WM.paperDark, border: `1px solid ${WM.faint}` }} /> context (seen)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm" style={{ background: WM.rubric }} /> target (hidden)
        </span>
        {mode === "random" ? (
          <button type="button" onClick={() => setSeed((value) => value + 1)} className="ml-auto flex items-center gap-1 text-ink hover:text-rubric">
            <Shuffle size={12} /> reshuffle
          </button>
        ) : null}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Meter label="context — what the model sees" value={(total - hidden) / total} tone="ink" />
        <Meter label="target — what it must predict" value={hidden / total} />
      </div>
      <div className="mt-3">
        <Panel label={info.task}>{info.note}</Panel>
      </div>
      <CompleteButton interactionId="wm-mask-playground" />
    </LabShell>
  );
}

/* ───────────────────────── ch02 · blur lab ───────────────────────── */

export function BlurLab() {
  const [left, setLeft] = useState(50);
  const [texture, setTexture] = useState(false);
  const p = left / 100;
  const uncertainty = 1 - Math.abs(2 * p - 1); // 0 = certain, 1 = coin flip
  const pixelLoss = Math.min(1, 0.55 * uncertainty + (texture ? 0.4 : 0));
  const latentLoss = 0.22 * uncertainty;
  const blur = 0.4 + 2.2 * uncertainty;

  return (
    <LabShell icon={<Sparkles size={15} />} title="Why pixel predictors go blurry">
      <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
        A ball reaches a fork. It goes <b className="text-ink">left</b> or <b className="text-ink">right</b>. Move the slider to change how
        likely each future is, then compare what each kind of predictor outputs.
      </p>
      <label className="block">
        <span className="mb-1 flex justify-between font-mono text-[10px] uppercase tracking-widest text-ink-fade">
          <span>chance it goes left</span>
          <span className="text-ink">{left}% · right {100 - left}%</span>
        </span>
        <input type="range" min={0} max={100} value={left} onChange={(event) => setLeft(Number(event.target.value))} className="w-full accent-rubric" />
      </label>
      <label className="mt-2 flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" checked={texture} onChange={(event) => setTexture(event.target.checked)} className="accent-rubric" />
        add unpredictable detail (leaves flickering in the background)
      </label>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-background p-2.5">
          <div className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-rubric">pixel predictor (MSE)</div>
          <svg viewBox="0 0 60 40" className="w-full" role="img" aria-label="Pixel prediction: a blurred average of both futures">
            <defs>
              <filter id="wm-blur" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation={blur} />
              </filter>
            </defs>
            {texture
              ? Array.from({ length: 14 }, (_, index) => (
                  <circle key={index} cx={4 + ((index * 37) % 52)} cy={4 + ((index * 23) % 32)} r="1.6" fill={WM.olive} opacity="0.18" filter="url(#wm-blur)" />
                ))
              : null}
            <path d="M30 38 L30 22 L12 8 M30 22 L48 8" fill="none" stroke={WM.faint} strokeWidth="1" />
            <circle cx="12" cy="10" r="4.5" fill={WM.ink} opacity={p} filter="url(#wm-blur)" />
            <circle cx="48" cy="10" r="4.5" fill={WM.ink} opacity={1 - p} filter="url(#wm-blur)" />
          </svg>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            MSE&apos;s best guess is the <b className="text-ink">average</b> of the futures: a faint ghost in both places.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background p-2.5">
          <div className="mb-1.5 font-mono text-[10px] uppercase tracking-widest" style={{ color: WM.olive }}>latent predictor (JEPA)</div>
          <div className="space-y-1.5 py-1 font-mono text-[11px] text-ink">
            <div className="flex justify-between"><span>object</span><span>ball ✓</span></div>
            <div className="flex justify-between"><span>moving</span><span>yes ✓</span></div>
            <div>
              <div className="mb-0.5 flex justify-between"><span>direction</span><span>L {left}% · R {100 - left}%</span></div>
              <div className="flex h-2 overflow-hidden rounded-full">
                <div style={{ width: `${left}%`, background: WM.ink }} />
                <div style={{ width: `${100 - left}%`, background: WM.olive }} />
              </div>
            </div>
            <div className="flex justify-between text-ink-fade"><span>leaf texture</span><span>{texture ? "ignored" : "—"}</span></div>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            The meaning stays <b className="text-ink">crisp</b>. Uncertainty becomes one clean attribute, not smeared pixels.
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Meter label="pixel loss (capacity wasted)" value={pixelLoss} />
        <Meter label="latent loss" value={latentLoss} tone="olive" />
      </div>
      <p className="mt-2 text-xs leading-relaxed text-ink-fade">
        Toy numbers, not a real training run. The shape is the point: unpredictable detail inflates the pixel loss;
        the latent predictor&apos;s encoder is free to drop it.
      </p>
      <CompleteButton interactionId="wm-blur-lab" />
    </LabShell>
  );
}

/* ───────────────────────── ch03 · collapse lab ───────────────────────── */

type Defense = "none" | "contrastive" | "vicreg" | "ema";
const DEFENSE_INFO: Record<Defense, { name: string; how: string }> = {
  none: {
    name: "no protection",
    how: "Both sides are learned and nothing stops them agreeing on a constant. The loss happily goes to zero.",
  },
  contrastive: {
    name: "contrastive (SimCLR, MoCo)",
    how: "Pull two views of the same input together AND push different inputs apart using negatives. A constant output can't push anything apart.",
  },
  vicreg: {
    name: "VICReg",
    how: "Add penalties: each embedding dimension must keep its variance across the batch, and dimensions must be decorrelated. A constant has zero variance, so it's punished.",
  },
  ema: {
    name: "EMA target + predictor + stop-grad",
    how: "The target encoder gets no gradient and only slowly follows the online encoder (EMA); a predictor sits on one side only. This asymmetry is what BYOL, I-JEPA and V-JEPA use.",
  },
};

const CLASS_CENTERS = [
  { x: 0, y: -0.62 },
  { x: 0.56, y: 0.36 },
  { x: -0.56, y: 0.36 },
];
const CLASS_COLORS = [WM.ink, WM.rubric, WM.olive];

const POINTS = (() => {
  const rand = mulberry32(42);
  return Array.from({ length: 15 }, (_, index) => ({
    cls: index % 3,
    x0: rand() * 1.8 - 0.9,
    y0: rand() * 1.8 - 0.9,
    jx: rand() * 0.36 - 0.18,
    jy: rand() * 0.36 - 0.18,
  }));
})();

function positions(defense: Defense, step: number) {
  const s = step / 100;
  if (defense === "none") {
    const shrink = (1 - s) ** 2;
    const c = { x: 0.15, y: 0.08 };
    return POINTS.map((pt) => ({ ...pt, x: c.x + (pt.x0 - c.x) * shrink, y: c.y + (pt.y0 - c.y) * shrink }));
  }
  const ease = 1 - (1 - s) ** 2;
  return POINTS.map((pt) => {
    const center = CLASS_CENTERS[pt.cls];
    return {
      ...pt,
      x: pt.x0 + (center.x + pt.jx - pt.x0) * ease,
      y: pt.y0 + (center.y + pt.jy - pt.y0) * ease,
    };
  });
}

function spread(points: Array<{ x: number; y: number }>) {
  const mx = points.reduce((sum, pt) => sum + pt.x, 0) / points.length;
  const my = points.reduce((sum, pt) => sum + pt.y, 0) / points.length;
  return points.reduce((sum, pt) => sum + (pt.x - mx) ** 2 + (pt.y - my) ** 2, 0) / points.length;
}

const INITIAL_SPREAD = spread(POINTS.map((pt) => ({ x: pt.x0, y: pt.y0 })));

export function CollapseLab() {
  const [defense, setDefense] = useState<Defense>("none");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const running = playing && step < 100;

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setStep((value) => Math.min(100, value + 2));
    }, 60);
    return () => window.clearInterval(timer);
  }, [running]);

  const pts = positions(defense, step);
  const variance = Math.min(1, spread(pts) / INITIAL_SPREAD);
  const s = step / 100;
  const loss = defense === "none" ? (1 - s) ** 2 : 0.22 + 0.78 * (1 - s) ** 2;
  const collapsed = defense === "none" && step >= 85;
  const info = DEFENSE_INFO[defense];

  const choose = (value: Defense) => {
    setDefense(value);
    setStep(0);
    setPlaying(false);
  };

  return (
    <LabShell icon={<Activity size={15} />} title="Watch a representation collapse">
      <Seg
        label="anti-collapse strategy"
        value={defense}
        onChange={choose}
        options={[
          { value: "none", label: "none" },
          { value: "contrastive", label: "contrastive" },
          { value: "vicreg", label: "VICReg" },
          { value: "ema", label: "EMA + predictor" },
        ]}
      />
      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_220px]">
        <div className="relative">
          <svg viewBox="-1.1 -1.1 2.2 2.2" className="aspect-square w-full rounded-lg border border-border bg-background" role="img" aria-label="Embedding space scatter plot">
            <line x1="-1.1" y1="0" x2="1.1" y2="0" stroke={WM.faint} strokeWidth="0.01" />
            <line x1="0" y1="-1.1" x2="0" y2="1.1" stroke={WM.faint} strokeWidth="0.01" />
            {pts.map((pt, index) => (
              <circle key={index} cx={pt.x} cy={pt.y} r="0.055" fill={CLASS_COLORS[pt.cls]} opacity="0.85" />
            ))}
          </svg>
          {collapsed ? (
            <div className="absolute inset-x-3 bottom-3 rounded-md bg-rubric px-3 py-2 text-center font-mono text-[10px] uppercase tracking-widest text-paper animate-fade-in">
              collapsed · loss ≈ 0 · every input → same point
            </div>
          ) : null}
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (running) {
                  setPlaying(false);
                  return;
                }
                if (step >= 100) setStep(0);
                setPlaying(true);
              }}
              className="flex min-h-9 items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-paper"
            >
              {running ? <Pause size={12} /> : <Play size={12} />} {running ? "pause" : step >= 100 ? "train again" : "train"}
            </button>
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-fade">step {step}</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={step}
            onChange={(event) => {
              setPlaying(false);
              setStep(Number(event.target.value));
            }}
            className="w-full accent-rubric"
            aria-label="training step"
          />
          <Meter label="prediction loss" value={loss} display={loss.toFixed(2)} />
          <Meter label="spread of embeddings" value={variance} tone="olive" />
          <div className="flex flex-wrap gap-2 font-mono text-[9px] uppercase tracking-widest text-ink-fade">
            {["class A", "class B", "class C"].map((label, index) => (
              <span key={label} className="flex items-center gap-1">
                <span className="size-2 rounded-full" style={{ background: CLASS_COLORS[index] }} /> {label}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3">
        <Panel label={info.name}>{info.how}</Panel>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-ink-fade">
        A toy picture, not a real run. Colours are classes the model never sees — with a defense, similar inputs end up near each other on their own.
      </p>
      <CompleteButton interactionId="wm-collapse-lab" />
    </LabShell>
  );
}
