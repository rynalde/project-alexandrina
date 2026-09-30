"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, CircleDot, Grid3x3, Pause, Play, RotateCcw, Shuffle, Sparkles } from "lucide-react";
import {
  collapseLabels,
  FAN_MAX,
  FUTURE_H,
  FUTURE_W,
  averageFutures,
  collapseSnapshot,
  collapseStep,
  createCollapseRun,
  sampleFuture,
  type CollapseRun,
  type Future,
  type FutureSpec,
  type Strategy,
} from "@/lib/world-models-sim";
import { useBeatGate } from "@/components/learning/Beats";
import { LabShell, Meter, Panel, ROLE, Seg, Sparkline, WM, mulberry32, tint } from "./ui";

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
  useBeatGate(pick !== null);

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
            className={`min-h-9 rounded-md border px-3 py-1.5 kicker transition ${
              pick === guess.id ? "border-rubric/60 bg-rubric/15 text-white" : "border-border bg-background text-ink hover:border-rubric/40"
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
              A world model plays this game millions of times, and to win it has to pick up the
              same physics you just used.
            </p>
          ) : null}
        </div>
      ) : null}
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

/* The clip: a ball bouncing left → right past a post that never moves (units = cells). */
// ponytail: each frame puts the ball in a new cell, so "same cell next door" really means "unchanged".
const BALL: Array<[number, number]> = [[0.5, 0.5], [1.5, 1.4], [1.5, 2.5], [2.5, 2.6], [2.5, 1.5], [3.5, 1.4]];
const isPost = (row: number, col: number) => col === 3 && row >= 2;
const cellContent = (frame: number, row: number, col: number) => {
  const [x, y] = BALL[frame];
  if (Math.floor(x) === col && Math.floor(y) === row) return "ball";
  return isPost(row, col) ? "post" : "empty";
};

type HiddenKind = "copy" | "predict";

/** A hidden patch is copyable when the same spot is visible in a neighbouring frame and shows the same thing there. */
function classifyHidden(mask: boolean[][]): Array<Array<HiddenKind | null>> {
  return mask.map((frame, t) =>
    frame.map((hidden, cell) => {
      if (!hidden) return null;
      const row = Math.floor(cell / SIDE);
      const col = cell % SIDE;
      const copyable = [t - 1, t + 1].some(
        (n) => n >= 0 && n < FRAMES && !mask[n][cell] && cellContent(n, row, col) === cellContent(t, row, col),
      );
      return copyable ? "copy" : "predict";
    }),
  );
}

const SHORTCUT: Record<MaskMode, string> = {
  future: "Copying the last visible frame works for what stands still — the post and the background. The ball moved, so its new position has to be predicted.",
  random: "Most hidden patches show exactly what the same spot shows one frame earlier or later. The model can score well by copying instead of understanding the scene.",
  tube: "No hidden patch is visible at the same spot in a neighbouring frame. The only way to fill the hole is to model what moves through it — the ball.",
};

function MaskFrame({ frame, mask, kinds, peek }: { frame: number; mask: boolean[]; kinds: Array<HiddenKind | null>; peek: boolean }) {
  const [bx, by] = BALL[frame];
  return (
    <svg viewBox="0 0 40 40" className="w-full rounded-md border border-white/10 bg-black" aria-hidden="true">
      {[10, 20, 30].map((v) => (
        <g key={v}>
          <line x1={v} y1="0" x2={v} y2="40" stroke="rgba(255,255,255,0.06)" strokeWidth="0.4" />
          <line x1="0" y1={v} x2="40" y2={v} stroke="rgba(255,255,255,0.06)" strokeWidth="0.4" />
        </g>
      ))}
      <rect x="31" y="20.5" width="8" height="19" rx="1" fill="#52525b" />
      <circle cx={bx * 10} cy={by * 10} r="3.4" fill="#ededed" />
      {mask.map((hidden, cell) => {
        if (!hidden) return null;
        const x = (cell % SIDE) * 10;
        const y = Math.floor(cell / SIDE) * 10;
        const copy = kinds[cell] === "copy";
        return (
          <g key={cell}>
            <rect
              x={x + 0.4}
              y={y + 0.4}
              width="9.2"
              height="9.2"
              rx="1.2"
              fill={peek ? tint(ROLE.target, 0.22) : "#2a2106"}
              stroke={copy ? ROLE.loss : ROLE.target}
              strokeWidth={copy ? 0.9 : 0.6}
              className="transition-[fill] duration-300"
            />
            {!peek ? (
              copy ? (
                <text x={x + 5} y={y + 7.2} textAnchor="middle" fontSize="6" fontWeight="700" fill={ROLE.loss}>⧉</text>
              ) : (
                <text x={x + 5} y={y + 7.4} textAnchor="middle" fontSize="6.5" fontWeight="700" fill={ROLE.target}>?</text>
              )
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

export function MaskPlayground() {
  const [mode, setMode] = useState<MaskMode>("future");
  const [seed, setSeed] = useState(7);
  const [peek, setPeek] = useState(false);
  const mask = useMemo(() => buildMask(mode, seed), [mode, seed]);
  const kinds = useMemo(() => classifyHidden(mask), [mask]);
  const total = FRAMES * SIDE * SIDE;
  const hidden = mask.flat().filter(Boolean).length;
  const copyable = kinds.flat().filter((kind) => kind === "copy").length;
  const info = MODE_INFO[mode];

  return (
    <LabShell icon={<Grid3x3 size={15} />} title="Same clip, different masks">
      <p className="mb-4 text-[15px] leading-7 text-ink-soft">
        A ball bounces past a post in 6 frames. The <span style={{ color: ROLE.target }}>mask</span>{" "}decides which
        patches the model can&apos;t see. Pick a rule and look at <em>what</em>{" "}gets hidden — and whether the model
        could just copy it from the next frame.
      </p>
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
            <MaskFrame frame={frameIndex} mask={frame} kinds={kinds[frameIndex]} peek={peek} />
            <div className="mt-1 text-center kicker text-ink-fade">frame {frameIndex + 1}</div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12.5px] text-ink-soft">
        <span className="flex items-center gap-1.5">
          <span className="flex size-4 items-center justify-center rounded-[3px] border text-[10px] font-bold" style={{ borderColor: ROLE.target, color: ROLE.target, background: "#2a2106" }}>?</span>
          hidden — must be predicted
        </span>
        <span className="flex items-center gap-1.5">
          <span className="flex size-4 items-center justify-center rounded-[3px] border text-[10px] font-bold" style={{ borderColor: ROLE.loss, color: ROLE.loss, background: "#2a2106" }}>⧉</span>
          hidden, but the same spot is visible next door — copyable
        </span>
        <span className="ml-auto flex items-center gap-2">
          {mode === "random" ? (
            <button type="button" onClick={() => setSeed((value) => value + 1)} className="flex items-center gap-1 rounded-md px-2 py-1 text-ink hover:bg-raised">
              <Shuffle size={12} /> Reshuffle
            </button>
          ) : null}
          <label className="flex items-center gap-1.5 text-ink">
            <input type="checkbox" checked={peek} onChange={(event) => setPeek(event.target.checked)} className="accent-rubric" />
            Peek under the mask
          </label>
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-white/10 bg-raised/60 px-3 py-2">
          <div className="text-[12px] text-ink-fade">hidden</div>
          <div className="font-mono text-[18px] font-semibold text-white">{Math.round((hidden / total) * 100)}%</div>
        </div>
        <div className="rounded-xl border px-3 py-2" style={{ borderColor: tint(ROLE.loss, 0.35), background: tint(ROLE.loss, 0.06) }}>
          <div className="text-[12px] text-ink-fade">copyable shortcut</div>
          <div className="font-mono text-[18px] font-semibold" style={{ color: ROLE.loss }}>
            {copyable}<span className="text-[13px] text-ink-fade">/{hidden}</span>
          </div>
        </div>
        <div className="rounded-xl border px-3 py-2" style={{ borderColor: tint(ROLE.target, 0.35), background: tint(ROLE.target, 0.06) }}>
          <div className="text-[12px] text-ink-fade">must predict</div>
          <div className="font-mono text-[18px] font-semibold" style={{ color: ROLE.target }}>
            {hidden - copyable}<span className="text-[13px] text-ink-fade">/{hidden}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-white/10 bg-black/40 p-3.5">
        <div className="text-[14px] font-semibold text-white">{info.task}</div>
        <p className="mt-1 text-[14.5px] leading-6 text-ink-soft">{SHORTCUT[mode]}</p>
        <p className="mt-2 text-[13.5px] leading-6 text-ink-fade">{info.note}</p>
      </div>
    </LabShell>
  );
}

/* ───────────────────────── ch02 · blur lab: average the possible futures, for real ───────────────────────── */

const MAX_FUTURES = 200;
const INK_RGB = [237, 237, 237];
const PAPER_RGB = [9, 9, 11];
const DEFAULT_SPEC: FutureSpec = { mode: "fork", value: 0.5, ahead: 6, leaves: false };

function paint(canvas: HTMLCanvasElement | null, img: Float32Array | undefined) {
  const ctx = canvas?.getContext("2d");
  if (!ctx) return;
  const data = ctx.createImageData(FUTURE_W, FUTURE_H);
  for (let i = 0; i < FUTURE_W * FUTURE_H; i += 1) {
    const v = img ? Math.min(1, img[i]) : 0;
    for (let c = 0; c < 3; c += 1) data.data[i * 4 + c] = Math.round(PAPER_RGB[c] + (INK_RGB[c] - PAPER_RGB[c]) * v);
    data.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(data, 0, 0);
}

function summarize(futures: Future[]) {
  const n = futures.length || 1;
  const up = futures.filter((f) => f.angle < 0).length / n;
  const meanAngle = futures.reduce((s, f) => s + f.angle, 0) / n;
  const angleStd = Math.sqrt(futures.reduce((s, f) => s + (f.angle - meanAngle) ** 2, 0) / n);
  return { count: futures.length, last: futures[futures.length - 1], stats: averageFutures(futures), up, angleStd };
}

function sampleMany(spec: FutureSpec, n: number, rand: () => number) {
  return Array.from({ length: n }, () => sampleFuture(spec, rand));
}

export function BlurLab() {
  const [spec, setSpec] = useState<FutureSpec>(DEFAULT_SPEC);
  const [view, setView] = useState(() => summarize(sampleMany(DEFAULT_SPEC, MAX_FUTURES, mulberry32(7))));
  const [playing, setPlaying] = useState(false);
  const futuresRef = useRef<Future[]>([]);
  const randRef = useRef<(() => number) | null>(null);
  const lastCanvas = useRef<HTMLCanvasElement>(null);
  const meanCanvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    paint(lastCanvas.current, view.last?.img);
    paint(meanCanvas.current, view.count ? view.stats.mean : undefined);
  }, [view]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      randRef.current ??= mulberry32(11);
      const futures = futuresRef.current;
      futures.push(...sampleMany(spec, futures.length < 20 ? 1 : 6, randRef.current));
      setView(summarize(futures));
      if (futures.length >= MAX_FUTURES) setPlaying(false);
    }, 60);
    return () => window.clearInterval(timer);
  }, [playing, spec]);

  const restart = (next: FutureSpec) => {
    setSpec(next);
    futuresRef.current = [];
    setView(summarize([]));
    setPlaying(true);
  };

  const { stats } = view;
  const fork = spec.mode === "fork";

  return (
    <LabShell icon={<Sparkles size={15} />} title="Average the possible futures — watch the blur appear">
      <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
        A ball rolls to the right. Something makes its path uncertain. A pixel predictor trained with squared error
        ends up outputting the <b className="text-ink">average of every future it has seen</b> — so here we compute that
        average for real, one sampled future at a time.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Seg
          label="what makes the future uncertain"
          value={spec.mode}
          onChange={(mode) => restart({ ...spec, mode, value: mode === "fork" ? 0.5 : 30 })}
          options={[
            { value: "fork", label: "a fork: up or down" },
            { value: "fan", label: "a fan of directions" },
          ]}
        />
        <label className="block">
          <span className="mb-1 flex justify-between kicker text-ink-fade">
            <span>{fork ? "chance it goes up" : "spread of directions"}</span>
            <span className="text-ink">{fork ? `${Math.round(spec.value * 100)}% up` : `±${spec.value}°`}</span>
          </span>
          <input
            type="range"
            min={0}
            max={fork ? 100 : FAN_MAX}
            value={fork ? Math.round(spec.value * 100) : spec.value}
            onChange={(event) => restart({ ...spec, value: fork ? Number(event.target.value) / 100 : Number(event.target.value) })}
            className="w-full accent-rubric"
            aria-label={fork ? "chance the ball goes up" : "spread of directions in degrees"}
          />
        </label>
        <label className="block">
          <span className="mb-1 flex justify-between kicker text-ink-fade">
            <span>how far ahead we predict</span>
            <span className="text-ink">{spec.ahead} frames</span>
          </span>
          <input
            type="range"
            min={1}
            max={8}
            value={spec.ahead}
            onChange={(event) => restart({ ...spec, ahead: Number(event.target.value) })}
            className="w-full accent-rubric"
            aria-label="frames ahead"
          />
        </label>
        <label className="flex items-center gap-2 self-end text-sm text-ink">
          <input
            type="checkbox"
            checked={spec.leaves}
            onChange={(event) => restart({ ...spec, leaves: event.target.checked })}
            className="accent-rubric"
          />
          add flickering leaves (no model can predict them)
        </label>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-background p-2.5">
          <div className="mb-1.5 kicker text-ink-fade">one sampled future</div>
          <canvas ref={lastCanvas} width={FUTURE_W} height={FUTURE_H} className="w-full rounded" style={{ aspectRatio: `${FUTURE_W} / ${FUTURE_H}` }} role="img" aria-label="One possible future frame" />
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Always sharp — reality picks one.</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-2.5">
          <div className="mb-1.5 kicker text-rubric">pixel predictor&apos;s best guess</div>
          <canvas ref={meanCanvas} width={FUTURE_W} height={FUTURE_H} className="w-full rounded" style={{ aspectRatio: `${FUTURE_W} / ${FUTURE_H}` }} role="img" aria-label="Average of all sampled futures" />
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Mean of <b className="text-ink">{view.count}</b> futures = what minimises squared error.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background p-2.5 sm:col-span-2">
          <div className="mb-1.5 kicker" style={{ color: WM.olive }}>latent predictor&apos;s guess</div>
          <div className="space-y-1.5 font-mono text-[11px] text-ink">
            <div className="flex justify-between"><span>object</span><span>ball ✓</span></div>
            <div className="flex justify-between"><span>distance</span><span>{spec.ahead * 5}px ✓</span></div>
            {fork ? (
              <div>
                <div className="mb-0.5 flex justify-between"><span>branch</span><span>up {Math.round(view.up * 100)}% · down {Math.round((1 - view.up) * 100)}%</span></div>
                <div className="flex h-2 overflow-hidden rounded-full">
                  <div style={{ width: `${view.up * 100}%`, background: WM.ink }} />
                  <div style={{ width: `${(1 - view.up) * 100}%`, background: WM.olive }} />
                </div>
              </div>
            ) : (
              <div className="flex justify-between"><span>direction</span><span>0° ± {view.angleStd.toFixed(0)}°</span></div>
            )}
            <div className="flex justify-between text-ink-fade"><span>leaves</span><span>{spec.leaves ? "dropped" : "—"}</span></div>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Uncertainty becomes a clean number, not smeared pixels.</p>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Meter label="sharpness of the pixel guess" value={stats.peak} />
        <Meter label="pixel loss that can't go away" value={stats.pixelLoss / 0.02} display={stats.pixelLoss.toFixed(4)} />
        <Meter label="latent uncertainty (px²)" value={stats.latentLoss / 400} display={stats.latentLoss.toFixed(0)} tone="olive" />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            if (playing) setPlaying(false);
            else if (view.count > 0 && view.count < MAX_FUTURES) setPlaying(true);
            else restart(spec);
          }}
          className="flex min-h-9 items-center gap-1.5 rounded-md border border-b-3 chonk border-ledge bg-raised px-3 py-1.5 kicker text-ink hover:bg-[#232326]"
        >
          {playing ? <Pause size={12} /> : <Play size={12} />}{" "}
          {playing ? "pause" : view.count > 0 && view.count < MAX_FUTURES ? "continue sampling" : "sample the futures again"}
        </button>
        <span className="kicker text-ink-fade">{view.count} / {MAX_FUTURES} futures</span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-ink-fade">
        Real computation, toy world. Try: fork at 100% (certain) → sharp again. Leaves on → pixel loss jumps, latent uncertainty doesn&apos;t move.
      </p>
    </LabShell>
  );
}

/* ───────────────────────── ch03 · collapse lab: a real JEPA-style training run ───────────────────────── */

const STRATEGY_INFO: Record<Strategy, { name: string; how: string }> = {
  none: {
    name: "no protection",
    how: "Both sides come from the same learned encoder and the gradient flows into the target too. Nothing stops them agreeing on a constant: watch the loss hit zero while every point slides into one dot.",
  },
  contrastive: {
    name: "contrastive (SimCLR, MoCo)",
    how: "InfoNCE: each embedding must pick out its own second view among the 64 in the batch — the other 63 are negatives. A constant can't tell anything apart, so it's punished. Notice the loss never gets near zero.",
  },
  vicreg: {
    name: "VICReg (2022)",
    how: "Invariance (two views should match) + variance (each dimension keeps a spread of at least 1 across the batch) + covariance (the two dimensions shouldn't copy each other). A constant has zero variance, so it's punished; the covariance term keeps both dimensions in use.",
  },
  ema: {
    name: "EMA target + predictor + stop-grad",
    how: "The target is a slow moving average of the encoder and gets no gradient; a predictor sits on the online side only. BYOL, I-JEPA and V-JEPA use this. With some seeds the dots line up on one line: the spread survives, but one dimension goes unused — dimensional collapse, a milder failure. Try new seeds, then tick “remove the predictor” and watch the spread shrink.",
  },
  sigreg: {
    name: "SIGReg (LeJEPA, 2025)",
    how: "No EMA, no stop-gradient. The cloud of embeddings, seen along 8 directions, must look like a bell curve N(0, 1) — checked through its characteristic function. A single dot is far from a bell curve.",
  },
};
const MAX_STEPS = 1500;
const CLASS_COLORS = [WM.ink, WM.rubric, WM.olive];
const LABELS = collapseLabels();

function collapseView(run: CollapseRun, lossHist: number[] = [], spreadHist: number[] = []) {
  const snap = collapseSnapshot(run);
  return {
    ...snap,
    step: run.step,
    loss: run.loss,
    lossHist: Number.isFinite(run.loss) ? [...lossHist, run.loss].slice(-300) : lossHist,
    spreadHist: [...spreadHist, snap.spread].slice(-300),
  };
}

export function CollapseLab() {
  const [strategy, setStrategy] = useState<Strategy>("none");
  const [usePredictor, setUsePredictor] = useState(true);
  const [fast, setFast] = useState(false);
  const [seed, setSeed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [view, setView] = useState(() => collapseView(createCollapseRun("none")));
  const runRef = useRef<CollapseRun | null>(null);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      const run = runRef.current;
      if (!run) return;
      const n = Math.min(fast ? 30 : 10, MAX_STEPS - run.step);
      for (let i = 0; i < n; i += 1) collapseStep(run);
      setView((prev) => collapseView(run, prev.lossHist, prev.spreadHist));
      if (run.step >= MAX_STEPS) setPlaying(false);
    }, 50);
    return () => window.clearInterval(timer);
  }, [playing, fast]);

  const reset = (next: Strategy, withPredictor: boolean, nextSeed = seed) => {
    const run = createCollapseRun(next, withPredictor, nextSeed);
    runRef.current = run;
    setStrategy(next);
    setUsePredictor(withPredictor);
    setSeed(nextSeed);
    setView(collapseView(run));
    setPlaying(false);
  };

  const toggle = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (!runRef.current || runRef.current.step >= MAX_STEPS) {
      const run = createCollapseRun(strategy, usePredictor, seed);
      runRef.current = run;
      setView(collapseView(run));
    }
    setPlaying(true);
  };

  const collapsed = view.spread < 0.02;
  const info = STRATEGY_INFO[strategy];
  const clamp = (v: number) => Math.max(-3.1, Math.min(3.1, v));

  return (
    <LabShell icon={<Activity size={15} />} title="Train a tiny JEPA — and watch it cheat">
      <Seg
        label="anti-collapse strategy"
        value={strategy}
        onChange={(value) => reset(value, true)}
        options={[
          { value: "none", label: "none" },
          { value: "contrastive", label: "contrastive" },
          { value: "vicreg", label: "VICReg" },
          { value: "ema", label: "EMA + predictor" },
          { value: "sigreg", label: "SIGReg (2025)" },
        ]}
      />
      {strategy === "ema" ? (
        <label className="mt-2 flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={!usePredictor} onChange={(event) => reset("ema", !event.target.checked)} className="accent-rubric" />
          remove the predictor (BYOL&apos;s ablation)
        </label>
      ) : null}
      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_240px]">
        <div className="relative">
          <svg viewBox="-3.2 -3.2 6.4 6.4" className="aspect-square w-full rounded-lg border border-border bg-background" role="img" aria-label="Embeddings of 150 inputs in the 2-D representation space">
            <line x1="-3.2" y1="0" x2="3.2" y2="0" stroke={WM.faint} strokeWidth="0.015" />
            <line x1="0" y1="-3.2" x2="0" y2="3.2" stroke={WM.faint} strokeWidth="0.015" />
            {view.z.map((point, index) => (
              <circle key={index} cx={clamp(point[0])} cy={clamp(-point[1])} r="0.075" fill={CLASS_COLORS[LABELS[index]]} opacity="0.8" />
            ))}
          </svg>
          {collapsed ? (
            <div className="absolute inset-x-3 bottom-3 rounded-md bg-primary px-3 py-2 text-center kicker text-primary-foreground animate-fade-in">
              collapsed · loss ≈ 0 · every input → the same point
            </div>
          ) : null}
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={toggle}
              className="flex min-h-9 items-center gap-1.5 rounded-md border border-b-3 chonk border-ledge bg-raised px-3 py-1.5 kicker text-ink hover:bg-[#232326]"
            >
              {playing ? <Pause size={12} /> : <Play size={12} />} {playing ? "pause" : view.step >= MAX_STEPS ? "train again" : view.step ? "continue" : "train"}
            </button>
            <button type="button" onClick={() => reset(strategy, usePredictor)} className="flex min-h-9 items-center gap-1 kicker text-ink hover:text-rubric">
              <RotateCcw size={12} /> Reset
            </button>
            <button type="button" onClick={() => reset(strategy, usePredictor, seed + 1)} className="flex min-h-9 items-center gap-1 kicker text-ink hover:text-rubric">
              <Shuffle size={12} /> New seed
            </button>
            <label className="flex items-center gap-1.5 kicker text-ink">
              <input type="checkbox" checked={fast} onChange={(event) => setFast(event.target.checked)} className="accent-rubric" /> fast
            </label>
          </div>
          <div className="kicker text-ink-fade">step {view.step} / {MAX_STEPS} · seed {seed}</div>
          <Sparkline label="training loss" values={view.lossHist} min={0} display={Number.isFinite(view.loss) ? view.loss.toFixed(3) : "—"} />
          <Sparkline label="spread (collapse alarm)" values={view.spreadHist} min={0} max={1.6} color={WM.olive} display={view.spread.toFixed(3)} />
          <Meter label="probe accuracy (chance 33%)" value={view.probe} tone="ink" />
          <Meter label="dimensions in use (of 2)" value={Math.max(0, view.dims - 1)} display={view.dims ? view.dims.toFixed(2) : "—"} tone="olive" />
          <div className="flex flex-wrap gap-2 kicker text-ink-fade">
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
        Real training in your browser: 150 inputs with 8 numbers each (2 carry the class, 6 are nuisance re-drawn in every
        view, like colour jitter), a 2×8 linear encoder, batches of 64 view pairs, plain gradient descent. The model never
        sees the colours — a defense makes them separate on their own.
      </p>
    </LabShell>
  );
}
