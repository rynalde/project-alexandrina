// Run: node scripts/world-models-sim.self-check.mjs
// Checks that the World Models labs show what their text claims, using the same code the browser runs.
import assert from "node:assert/strict";
import {
  FAN_MAX,
  FUTURE_H,
  FUTURE_W,
  averageFutures,
  collapseLossAndGrad,
  collapseSnapshot,
  collapseStep,
  createCollapseRun,
  createPlanner,
  mulberry32,
  plannerTick,
  sampleFuture,
  sigregLoss,
  surpriseSeries,
} from "../src/lib/world-models-sim.ts";

// ch02 — averaging sharp futures gives a blurry image; unpredictable leaves only hurt the pixel loss
const avg = (spec, n = 300) => {
  const rand = mulberry32(3);
  return averageFutures(Array.from({ length: n }, () => sampleFuture(spec, rand)));
};
const certain = avg({ mode: "fan", value: 0, ahead: 6, leaves: false });
const wide = avg({ mode: "fan", value: FAN_MAX, ahead: 6, leaves: false });
const fork = avg({ mode: "fork", value: 0.5, ahead: 6, leaves: false });
const forkLeafy = avg({ mode: "fork", value: 0.5, ahead: 6, leaves: true });
assert.ok(certain.peak > 0.95, `certain future stays sharp (${certain.peak})`);
assert.ok(wide.peak < 0.35, `uncertain future blurs (${wide.peak})`);
assert.ok(fork.peak > 0.4 && fork.peak < 0.6, `50/50 fork = two half ghosts (${fork.peak})`);
assert.ok(forkLeafy.pixelLoss > fork.pixelLoss * 2, `leaves inflate the pixel loss (${fork.pixelLoss} → ${forkLeafy.pixelLoss})`);
assert.equal(forkLeafy.latentLoss, fork.latentLoss, "leaves do not touch the latent loss");
{
  const rand = mulberry32(9);
  for (const spec of [{ mode: "fan", value: FAN_MAX, ahead: 8, leaves: false }, { mode: "fork", value: 0.5, ahead: 8, leaves: false }]) {
    for (let i = 0; i < 400; i += 1) {
      const f = sampleFuture(spec, rand);
      assert.ok(f.y > 3.6 && f.y < FUTURE_H - 3.6 && f.x < FUTURE_W - 3.6, `ball stays inside the frame (${f.x}, ${f.y})`);
    }
  }
}

// ch03 — analytic gradients match finite differences for every strategy
{
  const rand = mulberry32(8);
  const x1 = Array.from({ length: 12 }, () => Array.from({ length: 8 }, () => rand() * 2 - 1));
  const x2 = x1.map((row) => row.map((v) => v + 0.2 * (rand() - 0.5)));
  const cases = [
    ...["none", "ema", "vicreg", "contrastive", "sigreg"].map((strategy) => ({ strategy, usePredictor: true, scale: 1 })),
    { strategy: "none", usePredictor: false, scale: 1 },
    { strategy: "ema", usePredictor: false, scale: 1 },
    { strategy: "vicreg", usePredictor: true, scale: 4 }, // spread ≥ 1: the variance hinge is switched off
  ];
  for (const { strategy, usePredictor, scale } of cases) {
    const run = createCollapseRun(strategy, usePredictor, 4);
    run.params.w = run.params.w.map((row) => row.map((v) => v * scale));
    run.params.wt = run.params.wt.map((row) => row.map((v) => v + 0.1));
    const lossAt = (params) => collapseLossAndGrad(strategy, params, x1, x2, usePredictor).loss;
    const { gw, gp } = collapseLossAndGrad(strategy, run.params, x1, x2, usePredictor);
    const eps = 1e-6;
    const tag = `${strategy}${usePredictor ? "" : " (no predictor)"}${scale > 1 ? " (wide)" : ""}`;
    for (const [a, i] of [[0, 0], [1, 5], [0, 7]]) {
      const plus = structuredClone(run.params);
      const minus = structuredClone(run.params);
      plus.w[a][i] += eps;
      minus.w[a][i] -= eps;
      const num = (lossAt(plus) - lossAt(minus)) / (2 * eps);
      assert.ok(Math.abs(num - gw[a][i]) < 1e-4 * Math.max(1, Math.abs(num)), `${tag} dL/dW[${a}][${i}] ${num} vs ${gw[a][i]}`);
    }
    if ((strategy === "none" || strategy === "ema") && usePredictor) {
      const plus = structuredClone(run.params);
      const minus = structuredClone(run.params);
      plus.p[1][0] += eps;
      minus.p[1][0] -= eps;
      const num = (lossAt(plus) - lossAt(minus)) / (2 * eps);
      assert.ok(Math.abs(num - gp[1][0]) < 1e-4 * Math.max(1, Math.abs(num)), `${tag} dL/dP ${num} vs ${gp[1][0]}`);
    }
  }
  const z = Array.from({ length: 10 }, () => [rand() - 0.5, rand() * 2]);
  const { grad } = sigregLoss(z);
  const eps = 1e-6;
  const up = z.map((v) => [...v]);
  const down = z.map((v) => [...v]);
  up[3][1] += eps;
  down[3][1] -= eps;
  const num = (sigregLoss(up).value - sigregLoss(down).value) / (2 * eps);
  assert.ok(Math.abs(num - grad[3][1]) < 1e-5, `sigreg grad ${num} vs ${grad[3][1]}`);
}

// ch03 — no protection collapses; every defense keeps the spread and separates the classes
const train = (strategy, usePredictor = true, steps = 600) => {
  const run = createCollapseRun(strategy, usePredictor);
  const start = collapseSnapshot(run);
  for (let i = 0; i < steps; i += 1) collapseStep(run);
  return { start, end: collapseSnapshot(run), loss: run.loss };
};
const none = train("none");
assert.ok(none.end.spread < 0.01 && none.loss < 1e-3, `none collapses (spread ${none.end.spread}, loss ${none.loss})`);
assert.equal(none.end.dims, 0, "a collapsed cloud has no dimensions in use");
assert.ok(none.end.probe < 0.5, `collapsed embeddings are useless (${none.end.probe})`);
for (const strategy of ["contrastive", "vicreg", "ema", "sigreg"]) {
  const r = train(strategy);
  assert.ok(r.end.spread > 0.5, `${strategy} keeps its spread (${r.end.spread})`);
  assert.ok(r.end.probe > 0.85 && r.end.probe > r.start.probe + 0.1, `${strategy} learns the classes (${r.start.probe} → ${r.end.probe})`);
}
for (const strategy of ["contrastive", "vicreg", "sigreg"]) {
  assert.ok(train(strategy, true, 1500).end.dims > 1.9, `${strategy} uses both embedding dimensions`);
}
assert.ok(train("ema", true, 1500).end.dims < 1.2, "EMA (seed 0) shows dimensional collapse: one dimension unused");
const noPred = train("ema", false, 1500);
const withPred = train("ema", true, 1500);
assert.ok(noPred.end.spread < 0.6 * withPred.end.spread, `removing the predictor shrinks the spread (${noPred.end.spread} vs ${withPred.end.spread})`);

// ch07 — planning: open room works, a wall traps the planner, one sub-goal rescues it
const plan = (opts, maxTicks = 3 * 80) => {
  const pl = createPlanner({ samples: 48, ...opts });
  for (let i = 0; i < maxTicks && !pl.done; i += 1) plannerTick(pl);
  return pl;
};
const open = plan({ wall: false, subgoal: false });
const stuck = plan({ wall: true, subgoal: false });
const rescued = plan({ wall: true, subgoal: true });
assert.ok(open.done, "open room: reaches the goal");
assert.ok(!stuck.done && stuck.state.p.x < 51, `wall: stuck on the near side (x=${stuck.state.p.x.toFixed(1)})`);
assert.ok(rescued.done, "wall + sub-goal: reaches the goal");

// ch07 — surprise spikes only when physics is violated
const peak = (s) => Math.max(...surpriseSeries(s).map((f) => f.surprise));
assert.ok(peak("possible") < 0.3, `possible clip: low surprise (${peak("possible")})`);
assert.ok(peak("vanish") >= 1 && peak("teleport") >= 1, "impossible clips: surprise spike");

console.log("world-models sim self-check passed");
