/**
 * Pure simulation code behind the World Models labs (vol. x).
 * No React and no DOM, so `scripts/world-models-sim.self-check.mjs` can run it in Node.
 * Every lab that says "real" in its UI computes its numbers here.
 */

/** Small deterministic PRNG so SSR and client render the same "random" numbers. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Standard normal sample (Box–Muller). */
export function gaussian(rand: () => number) {
  let u = 0;
  while (u === 0) u = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
}

/* ─────────────────────────── ch02 · average of possible futures ─────────────────────────── */

export const FUTURE_W = 64;
export const FUTURE_H = 68;
export const LEAF_ROWS = 8;
export const FAN_MAX = 40; // degrees; with 8 frames ahead the ball still stays inside the frame
const BALL_START = { x: 8, y: 37 };
const BALL_SIGMA = 1.8;
const STEP_PX = 5;

export type FutureMode = "fork" | "fan";

export interface FutureSpec {
  mode: FutureMode;
  /** fork: chance (0–1) the ball takes the upper branch. fan: half-width of the cone, in degrees. */
  value: number;
  /** how many frames ahead we predict */
  ahead: number;
  /** flickering leaves: random texture that no model can predict */
  leaves: boolean;
}

/** Sample one possible future: where the ball ends up, plus a fresh leaf texture. */
export function sampleFuture(spec: FutureSpec, rand: () => number) {
  let angle: number;
  if (spec.mode === "fork") angle = rand() < spec.value ? -24 : 24;
  else angle = (rand() * 2 - 1) * spec.value;
  // leaves get their own generator, so switching them on never changes which ball futures are drawn
  const leafRand = mulberry32(Math.floor(rand() * 4294967296));
  const rad = (angle * Math.PI) / 180;
  const dist = spec.ahead * STEP_PX;
  const x = BALL_START.x + Math.cos(rad) * dist;
  const y = BALL_START.y + Math.sin(rad) * dist;
  const img = new Float32Array(FUTURE_W * FUTURE_H);
  for (let r = 0; r < FUTURE_H; r += 1) {
    for (let c = 0; c < FUTURE_W; c += 1) {
      const d2 = (c - x) ** 2 + (r - y) ** 2;
      let v = Math.exp(-d2 / (2 * BALL_SIGMA * BALL_SIGMA));
      // leaves live in the top band; each future flickers differently
      if (spec.leaves && r < LEAF_ROWS) v = Math.max(v, leafRand() < 0.35 ? 0.35 + 0.4 * leafRand() : 0);
      img[r * FUTURE_W + c] = v;
    }
  }
  return { x, y, angle, img };
}

/** Pixelwise running mean of sampled futures = the image that minimises squared error on them. */
export type Future = ReturnType<typeof sampleFuture>;

export function averageFutures(futures: Future[]) {
  const n = futures.length;
  const mean = new Float32Array(FUTURE_W * FUTURE_H);
  if (!n) return { mean, peak: 0, pixelLoss: 0, latentLoss: 0, meanX: BALL_START.x, meanY: BALL_START.y };
  for (const f of futures) for (let i = 0; i < mean.length; i += 1) mean[i] += f.img[i] / n;
  let peak = 0;
  for (let r = LEAF_ROWS; r < FUTURE_H; r += 1) for (let c = 0; c < FUTURE_W; c += 1) peak = Math.max(peak, mean[r * FUTURE_W + c]);
  // pixel loss of the best possible pixel prediction (the mean): average squared error, per pixel
  let pixelLoss = 0;
  for (const f of futures) for (let i = 0; i < mean.length; i += 1) pixelLoss += (f.img[i] - mean[i]) ** 2;
  pixelLoss /= n * mean.length;
  // latent loss of the best latent prediction: the ball position is the only thing to predict
  const meanX = futures.reduce((s, f) => s + f.x, 0) / n;
  const meanY = futures.reduce((s, f) => s + f.y, 0) / n;
  const latentLoss = futures.reduce((s, f) => s + (f.x - meanX) ** 2 + (f.y - meanY) ** 2, 0) / n;
  return { mean, peak, pixelLoss, latentLoss, meanX, meanY };
}

/* ─────────────────────────── ch03 · a JEPA you can train in the browser ─────────────────────────── */

export type Strategy = "none" | "contrastive" | "vicreg" | "ema" | "sigreg";

const IN = 8; // input dims: 2 carry the class signal, 6 are nuisance re-drawn in every view
const OUT = 2; // embedding dims, so we can plot them directly
const N_POINTS = 150;
const BATCH = 64;
const LR = 0.05;
const TAU = 0.99;
const READOUT_NOISE = 0.05;
const CENTERS = [
  [0, 2],
  [1.73, -1],
  [-1.73, -1],
];

type Mat = number[][];

function zeros(r: number, c: number): Mat {
  return Array.from({ length: r }, () => new Array<number>(c).fill(0));
}

/** Random orthogonal matrix (Gram–Schmidt on a Gaussian matrix). */
function randomRotation(n: number, rand: () => number): Mat {
  const q: Mat = [];
  while (q.length < n) {
    const v = Array.from({ length: n }, () => gaussian(rand));
    for (const u of q) {
      const dot = u.reduce((s, x, i) => s + x * v[i], 0);
      for (let i = 0; i < n; i += 1) v[i] -= dot * u[i];
    }
    const norm = Math.hypot(...v);
    if (norm > 1e-6) q.push(v.map((x) => x / norm));
  }
  return q;
}

function matVec(m: Mat, v: number[]) {
  return m.map((row) => row.reduce((s, x, i) => s + x * v[i], 0));
}

/** Fixed toy dataset: 150 "images" from 3 classes the model never sees. */
function makeDataset() {
  const rand = mulberry32(1);
  const rot = randomRotation(IN, rand);
  const labels = Array.from({ length: N_POINTS }, (_, i) => i % 3);
  const signal = labels.map((l) => [CENTERS[l][0] + 0.35 * gaussian(rand), CENTERS[l][1] + 0.35 * gaussian(rand)]);
  const view = (i: number, r: () => number) => {
    const raw = [signal[i][0] + 0.3 * gaussian(r), signal[i][1] + 0.3 * gaussian(r)];
    for (let j = 2; j < IN; j += 1) raw.push(gaussian(r)); // nuisance: like colour jitter, changes every view
    return matVec(rot, raw);
  };
  const evalRand = mulberry32(99);
  const evalX = labels.map((_, i) => view(i, evalRand));
  const noiseRand = mulberry32(5);
  const readout = labels.map(() => [gaussian(noiseRand), gaussian(noiseRand)]);
  return { labels, view, evalX, readout };
}

let dataset: ReturnType<typeof makeDataset> | null = null;
function data() {
  dataset ??= makeDataset();
  return dataset;
}

export function collapseLabels() {
  return data().labels;
}

function embed(w: Mat, xs: Mat): Mat {
  return xs.map((x) => w.map((row) => row.reduce((s, v, i) => s + v * x[i], 0)));
}

/** dL/dW = Σ_n g_n x_nᵀ */
function outerSum(g: Mat, xs: Mat): Mat {
  const out = zeros(OUT, IN);
  for (let n = 0; n < g.length; n += 1) for (let a = 0; a < OUT; a += 1) for (let i = 0; i < IN; i += 1) out[a][i] += g[n][a] * xs[n][i];
  return out;
}

/* SIGReg (LeJEPA, 2025): push each 1-D projection of the embeddings toward N(0, 1) via its characteristic function. */
const SIG_T = Array.from({ length: 17 }, (_, i) => -4 + i * 0.5);
const SIG_E = SIG_T.map((t) => Math.exp(-(t * t) / 2));
const SIG_W = SIG_T.map((_, i) => (i === 0 || i === SIG_T.length - 1 ? 0.25 : 0.5)); // trapezoid weights, step 0.5
const SIG_DIRS = Array.from({ length: 8 }, (_, i) => [Math.cos((i * Math.PI) / 8), Math.sin((i * Math.PI) / 8)]);

export function sigregLoss(z: Mat): { value: number; grad: Mat } {
  const n = z.length;
  const grad = zeros(n, OUT);
  let value = 0;
  for (const dir of SIG_DIRS) {
    const s = z.map((v) => v[0] * dir[0] + v[1] * dir[1]);
    for (let k = 0; k < SIG_T.length; k += 1) {
      const t = SIG_T[k];
      let re = 0;
      let im = 0;
      for (let i = 0; i < n; i += 1) {
        re += Math.cos(t * s[i]);
        im += Math.sin(t * s[i]);
      }
      re = re / n - SIG_E[k];
      im /= n;
      value += n * SIG_W[k] * SIG_E[k] * (re * re + im * im);
      const coef = SIG_W[k] * SIG_E[k] * 2 * t;
      for (let i = 0; i < n; i += 1) {
        const ds = coef * (-re * Math.sin(t * s[i]) + im * Math.cos(t * s[i]));
        grad[i][0] += ds * dir[0];
        grad[i][1] += ds * dir[1];
      }
    }
  }
  const m = SIG_DIRS.length;
  return { value: value / m, grad: grad.map((g) => g.map((v) => v / m)) };
}

export interface CollapseParams {
  w: Mat; // online encoder, OUT × IN
  p: Mat; // predictor, OUT × OUT
  wt: Mat; // EMA target encoder
}

/** Loss and gradients for one batch of view pairs. Exported so the self-check can compare with finite differences. */
export function collapseLossAndGrad(strategy: Strategy, params: CollapseParams, x1: Mat, x2: Mat, usePredictor = true) {
  const { w, p, wt } = params;
  const b = x1.length;
  const z1 = embed(w, x1);
  const z2 = embed(w, x2);
  const gp = zeros(OUT, OUT);
  let gw = zeros(OUT, IN);
  let loss = 0;

  if (strategy === "none" || strategy === "ema") {
    // predictor on the online side; target = same encoder (none) or its EMA copy (ema)
    const pred = usePredictor ? z1.map((z) => matVec(p, z)) : z1;
    const tgt = strategy === "ema" ? embed(wt, x2) : z2;
    const gPred = pred.map((v, n) => v.map((x, a) => (2 * (x - tgt[n][a])) / b));
    loss = pred.reduce((s, v, n) => s + v.reduce((t, x, a) => t + (x - tgt[n][a]) ** 2, 0), 0) / b;
    const gz1 = usePredictor
      ? gPred.map((g) => [0, 1].map((i) => g[0] * p[0][i] + g[1] * p[1][i]))
      : gPred;
    if (usePredictor) {
      for (let n = 0; n < b; n += 1) for (let a = 0; a < OUT; a += 1) for (let i = 0; i < OUT; i += 1) gp[a][i] += gPred[n][a] * z1[n][i];
    }
    gw = outerSum(gz1, x1);
    if (strategy === "none") {
      // no stop-gradient: the target branch is pushed too — this is what lets it cheat
      const gTarget = outerSum(gPred.map((g) => g.map((v) => -v)), x2);
      for (let a = 0; a < OUT; a += 1) for (let i = 0; i < IN; i += 1) gw[a][i] += gTarget[a][i];
    }
  } else if (strategy === "vicreg" || strategy === "sigreg") {
    const inv = strategy === "sigreg" ? 0.95 : 1; // LeJEPA weights prediction by (1 − λ), λ = 0.05
    const gz1 = z1.map((v, n) => v.map((x, a) => (inv * 2 * (x - z2[n][a])) / b));
    const gz2 = gz1.map((g) => g.map((v) => -v));
    loss = (inv * z1.reduce((s, v, n) => s + v.reduce((t, x, a) => t + (x - z2[n][a]) ** 2, 0), 0)) / b;
    for (const [z, g] of [
      [z1, gz1],
      [z2, gz2],
    ] as const) {
      if (strategy === "sigreg") {
        const reg = sigregLoss(z);
        loss += (0.05 * reg.value) / 2;
        for (let n = 0; n < b; n += 1) for (let a = 0; a < OUT; a += 1) g[n][a] += (0.05 * reg.grad[n][a]) / 2;
        continue;
      }
      const mean = [0, 1].map((a) => z.reduce((s, v) => s + v[a], 0) / b);
      const zc = z.map((v) => v.map((x, a) => x - mean[a]));
      const std = [0, 1].map((a) => Math.sqrt(zc.reduce((s, v) => s + v[a] * v[a], 0) / b + 1e-4));
      const cov = zc.reduce((s, v) => s + v[0] * v[1], 0) / (b - 1);
      // variance: every embedding dimension must keep a spread of at least 1 across the batch
      loss += std.reduce((s, sd) => s + Math.max(0, 1 - sd), 0) / OUT;
      // covariance: the two dimensions should not carry the same information (off-diagonal² / dims)
      loss += (0.5 * 2 * cov * cov) / OUT;
      for (let n = 0; n < b; n += 1) {
        for (let a = 0; a < OUT; a += 1) {
          if (std[a] < 1) g[n][a] -= zc[n][a] / (b * std[a] * OUT);
          g[n][a] += (2 * cov * zc[n][1 - a]) / ((b - 1) * OUT);
        }
      }
    }
    gw = outerSum(gz1, x1);
    const g2 = outerSum(gz2, x2);
    for (let a = 0; a < OUT; a += 1) for (let i = 0; i < IN; i += 1) gw[a][i] += g2[a][i];
  } else {
    // contrastive (InfoNCE, cosine similarity, temperature 0.2): match your own second view among the batch
    const temp = 0.2;
    const norm = (z: Mat) => z.map((v) => Math.hypot(v[0], v[1]) + 1e-8);
    const n1 = norm(z1);
    const n2 = norm(z2);
    const u = z1.map((v, i) => v.map((x) => x / n1[i]));
    const v = z2.map((v2, i) => v2.map((x) => x / n2[i]));
    const g = zeros(b, b);
    for (let i = 0; i < b; i += 1) {
      const logits = v.map((vj) => (u[i][0] * vj[0] + u[i][1] * vj[1]) / temp);
      const max = Math.max(...logits);
      const exps = logits.map((l) => Math.exp(l - max));
      const sum = exps.reduce((s, e) => s + e, 0);
      loss -= Math.log(exps[i] / sum) / b;
      for (let j = 0; j < b; j += 1) g[i][j] = (exps[j] / sum - (i === j ? 1 : 0)) / b;
    }
    const gu = u.map((_, i) => [0, 1].map((a) => v.reduce((s, vj, j) => s + g[i][j] * vj[a], 0) / temp));
    const gv = v.map((_, j) => [0, 1].map((a) => u.reduce((s, ui, i) => s + g[i][j] * ui[a], 0) / temp));
    const back = (gd: Mat, dir: Mat, len: number[]) =>
      gd.map((gi, i) => {
        const along = gi[0] * dir[i][0] + gi[1] * dir[i][1];
        return gi.map((x, a) => (x - along * dir[i][a]) / len[i]);
      });
    gw = outerSum(back(gu, u, n1), x1);
    const g2 = outerSum(back(gv, v, n2), x2);
    for (let a = 0; a < OUT; a += 1) for (let i = 0; i < IN; i += 1) gw[a][i] += g2[a][i];
  }
  return { loss, gw, gp };
}

export interface CollapseRun {
  strategy: Strategy;
  usePredictor: boolean;
  params: CollapseParams;
  step: number;
  loss: number;
  rand: () => number;
}

export function createCollapseRun(strategy: Strategy, usePredictor = true, seed = 0): CollapseRun {
  const rand = mulberry32(1000 + seed);
  const w = Array.from({ length: OUT }, () => Array.from({ length: IN }, () => 0.3 * gaussian(rand)));
  const p = [
    [1 + 0.1 * gaussian(rand), 0.1 * gaussian(rand)],
    [0.1 * gaussian(rand), 1 + 0.1 * gaussian(rand)],
  ];
  return { strategy, usePredictor, params: { w, p, wt: w.map((row) => [...row]) }, step: 0, loss: NaN, rand };
}

/** One SGD step on a fresh batch of 64 view pairs. Mutates and returns the run. */
export function collapseStep(run: CollapseRun) {
  const { view } = data();
  const order = Array.from({ length: N_POINTS }, (_, i) => i);
  for (let i = 0; i < BATCH; i += 1) {
    const j = i + Math.floor(run.rand() * (N_POINTS - i));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const idx = order.slice(0, BATCH);
  const x1 = idx.map((i) => view(i, run.rand));
  const x2 = idx.map((i) => view(i, run.rand));
  const { loss, gw, gp } = collapseLossAndGrad(run.strategy, run.params, x1, x2, run.usePredictor);
  const { w, p, wt } = run.params;
  for (let a = 0; a < OUT; a += 1) {
    for (let i = 0; i < IN; i += 1) w[a][i] -= LR * gw[a][i];
    for (let i = 0; i < OUT; i += 1) p[a][i] -= LR * gp[a][i];
  }
  if (run.strategy === "ema") {
    for (let a = 0; a < OUT; a += 1) for (let i = 0; i < IN; i += 1) wt[a][i] = TAU * wt[a][i] + (1 - TAU) * w[a][i];
  }
  run.step += 1;
  run.loss = loss;
  return run;
}

/** Embeddings of one fixed view of all 150 points, plus the two health checks from the chapter. */
export function collapseSnapshot(run: CollapseRun) {
  const { evalX, labels, readout } = data();
  const z = embed(run.params.w, evalX);
  const mean = [0, 1].map((a) => z.reduce((s, v) => s + v[a], 0) / z.length);
  const spread = [0, 1].reduce((s, a) => s + Math.sqrt(z.reduce((t, v) => t + (v[a] - mean[a]) ** 2, 0) / z.length), 0) / OUT;
  // linear-probe stand-in: nearest class centroid, read through a little fixed noise
  const zn = z.map((v, i) => [v[0] + READOUT_NOISE * readout[i][0], v[1] + READOUT_NOISE * readout[i][1]]);
  const centroids = [0, 1, 2].map((c) => {
    const members = zn.filter((_, i) => labels[i] === c);
    return [0, 1].map((a) => members.reduce((s, v) => s + v[a], 0) / members.length);
  });
  const correct = zn.filter((v, i) => {
    const d = centroids.map((m) => (v[0] - m[0]) ** 2 + (v[1] - m[1]) ** 2);
    return d.indexOf(Math.min(...d)) === labels[i];
  }).length;
  // dimensions in use: effective rank of the 2×2 covariance (1 = everything on one line, 2 = both axes used)
  const cxx = z.reduce((t, v) => t + (v[0] - mean[0]) ** 2, 0) / z.length;
  const cyy = z.reduce((t, v) => t + (v[1] - mean[1]) ** 2, 0) / z.length;
  const cxy = z.reduce((t, v) => t + (v[0] - mean[0]) * (v[1] - mean[1]), 0) / z.length;
  const half = Math.sqrt(((cxx - cyy) / 2) ** 2 + cxy * cxy);
  const eig = [(cxx + cyy) / 2 + half, Math.max(0, (cxx + cyy) / 2 - half)];
  const total = eig[0] + eig[1];
  // a collapsed cloud has no directions worth counting (same threshold as the lab's "collapsed" banner)
  const dims = spread < 0.02 || total < 1e-12 ? 0 : Math.exp(-eig.reduce((t, l) => (l > 0 ? t + (l / total) * Math.log(l / total) : t), 0));
  return { z, spread, probe: correct / z.length, dims };
}

/* ─────────────────────────── ch07 · planning in a world model (CEM + MPC) ─────────────────────────── */

export const PLAN_W = 100;
export const PLAN_H = 70;
export const PLAN_WALL = { x: 50, gapTop: 48 }; // wall from y = 0 down to gapTop; the gap is below it
const PLAN_DAMP = 0.8;
const PLAN_GAIN = 1.4;
const PLAN_VMAX = 4;
const PLAN_HORIZON = 10;
const PLAN_ELITES = 6;
export const PLAN_ITERS = 3;
const PLAN_REACHED = 3.5;

export interface Pt {
  x: number;
  y: number;
}
export interface PlanState {
  p: Pt;
  v: Pt;
}

/** The "physics" of the toy world. The planner below uses this same function as its imagination. */
export function planDynamics(s: PlanState, a: Pt, wall: boolean): PlanState {
  const ax = Math.max(-1, Math.min(1, a.x));
  const ay = Math.max(-1, Math.min(1, a.y));
  let vx = PLAN_DAMP * s.v.x + PLAN_GAIN * ax;
  let vy = PLAN_DAMP * s.v.y + PLAN_GAIN * ay;
  const sp = Math.hypot(vx, vy);
  if (sp > PLAN_VMAX) {
    vx = (vx / sp) * PLAN_VMAX;
    vy = (vy / sp) * PLAN_VMAX;
  }
  let x = s.p.x + vx;
  let y = s.p.y + vy;
  if (wall) {
    const crossing = (s.p.x - PLAN_WALL.x) * (x - PLAN_WALL.x) <= 0 && s.p.x !== x;
    if (crossing) {
      const f = (PLAN_WALL.x - s.p.x) / (x - s.p.x);
      const yHit = s.p.y + f * (y - s.p.y);
      if (yHit < PLAN_WALL.gapTop) {
        x = PLAN_WALL.x - Math.sign(x - s.p.x) * 0.6;
        vx = 0;
      }
    }
  }
  if (x < 2 || x > PLAN_W - 2) {
    x = Math.max(2, Math.min(PLAN_W - 2, x));
    vx = 0;
  }
  if (y < 2 || y > PLAN_H - 2) {
    y = Math.max(2, Math.min(PLAN_H - 2, y));
    vy = 0;
  }
  return { p: { x, y }, v: { x: vx, y: vy } };
}

export interface Planner {
  state: PlanState;
  goal: Pt;
  subgoal: Pt | null;
  wall: boolean;
  samples: number;
  mean: Pt[];
  std: Pt[];
  iter: number;
  trail: Pt[];
  energy: number[];
  imagined: number;
  done: boolean;
  rand: () => number;
  /** latest CEM iteration, for drawing */
  lastRollouts: Pt[][];
  lastElites: Pt[][];
}

export function createPlanner(opts: { wall: boolean; subgoal: boolean; samples: number; seed?: number }): Planner {
  const start = { x: 16, y: 18 };
  return {
    state: { p: start, v: { x: 0, y: 0 } },
    goal: { x: 86, y: 18 },
    subgoal: opts.wall && opts.subgoal ? { x: PLAN_WALL.x, y: 60 } : null,
    wall: opts.wall,
    samples: opts.samples,
    mean: Array.from({ length: PLAN_HORIZON }, () => ({ x: 0, y: 0 })),
    std: Array.from({ length: PLAN_HORIZON }, () => ({ x: 0.9, y: 0.9 })),
    iter: 0,
    trail: [start],
    energy: [],
    imagined: 0,
    done: false,
    rand: mulberry32(opts.seed ?? 11),
    lastRollouts: [],
    lastElites: [],
  };
}

/** L1 distance to the (sub-)goal — V-JEPA 2-AC measures the same kind of L1 distance, but between representations. */
function energyOf(end: Pt, target: Pt) {
  return Math.abs(end.x - target.x) + Math.abs(end.y - target.y);
}

/** One CEM iteration; after PLAN_ITERS iterations, execute the first action and shift the plan (receding horizon). */
export function plannerTick(pl: Planner) {
  if (pl.done) return pl;
  const target = pl.subgoal ?? pl.goal;
  const plans: Pt[][] = [];
  const rollouts: Pt[][] = [];
  const scores: number[] = [];
  for (let k = 0; k < pl.samples; k += 1) {
    const actions = pl.mean.map((m, t) => ({
      x: Math.max(-1, Math.min(1, m.x + pl.std[t].x * gaussian(pl.rand))),
      y: Math.max(-1, Math.min(1, m.y + pl.std[t].y * gaussian(pl.rand))),
    }));
    let s = pl.state;
    const path = [s.p];
    let energy = 0;
    for (const a of actions) {
      s = planDynamics(s, a, pl.wall);
      path.push(s.p);
      energy += energyOf(s.p, target) / actions.length; // summed over the imagined steps: get there, then stay
    }
    plans.push(actions);
    rollouts.push(path);
    scores.push(energy);
  }
  pl.imagined += pl.samples;
  const order = scores.map((e, i) => [e, i] as const).sort((a, b) => a[0] - b[0]);
  const elites = order.slice(0, PLAN_ELITES).map(([, i]) => i);
  pl.mean = pl.mean.map((_, t) => ({
    x: elites.reduce((s, i) => s + plans[i][t].x, 0) / elites.length,
    y: elites.reduce((s, i) => s + plans[i][t].y, 0) / elites.length,
  }));
  pl.std = pl.std.map((_, t) => ({
    x: Math.max(0.05, Math.sqrt(elites.reduce((s, i) => s + (plans[i][t].x - pl.mean[t].x) ** 2, 0) / elites.length)),
    y: Math.max(0.05, Math.sqrt(elites.reduce((s, i) => s + (plans[i][t].y - pl.mean[t].y) ** 2, 0) / elites.length)),
  }));
  pl.lastRollouts = rollouts;
  pl.lastElites = elites.map((i) => rollouts[i]);
  pl.iter += 1;
  if (pl.iter < PLAN_ITERS) return pl;

  // act: only the first action of the refit plan (the elites' mean) is executed, then we look again and replan
  pl.state = planDynamics(pl.state, pl.mean[0], pl.wall);
  pl.trail.push(pl.state.p);
  pl.energy.push(energyOf(pl.state.p, pl.goal));
  pl.mean = [...pl.mean.slice(1), { x: 0, y: 0 }];
  pl.std = pl.std.map(() => ({ x: 0.9, y: 0.9 }));
  pl.iter = 0;
  if (pl.subgoal && energyOf(pl.state.p, pl.subgoal) < 8) pl.subgoal = null;
  if (Math.hypot(pl.state.p.x - pl.goal.x, pl.state.p.y - pl.goal.y) < PLAN_REACHED) pl.done = true;
  return pl;
}

/* ─────────────────────────── ch07 · surprise = prediction error (violation of expectation) ─────────────────────────── */

export type SurpriseScenario = "possible" | "vanish" | "teleport";
export const OCCLUDER = { from: 42, to: 62 };
export const SURPRISE_FRAMES = 40;

/**
 * A hand-built predictor with object permanence: it keeps tracking the ball's position while it is hidden.
 * Surprise(t) = distance between what it predicted for frame t and what frame t actually shows.
 */
export function surpriseSeries(scenario: SurpriseScenario) {
  const speed = 2.5;
  const truth = Array.from({ length: SURPRISE_FRAMES }, (_, t) => {
    let x = 6 + speed * t;
    let exists = true;
    if (scenario === "vanish" && x > OCCLUDER.from + 4) exists = false;
    if (scenario === "teleport" && x > OCCLUDER.from + 2) x += 26;
    return { x, exists };
  });
  const hidden = (x: number) => x > OCCLUDER.from && x < OCCLUDER.to;
  const visible = truth.map((f) => f.exists && !hidden(f.x) && f.x < 100);
  let belief = { x: truth[0].x, v: 0 };
  const series = truth.map((f, t) => {
    const predX = belief.x + belief.v;
    const predVisible = !hidden(predX) && predX < 100;
    const obsVisible = visible[t];
    let surprise = Math.abs(Number(predVisible) - Number(obsVisible));
    if (predVisible && obsVisible) surprise += Math.min(1, Math.abs(predX - f.x) / 10);
    if (t > 0 && obsVisible && visible[t - 1]) belief = { x: f.x, v: f.x - truth[t - 1].x };
    else if (obsVisible) belief = { x: f.x, v: belief.v };
    else belief = { x: predX, v: belief.v }; // object permanence: keep moving the hidden ball
    return { t, x: f.x, visible: obsVisible, predX, predVisible, surprise: t === 0 ? 0 : surprise };
  });
  return series;
}
