"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Pause, Play } from "lucide-react";
import { snappy, spring } from "@/lib/motion";
import { ROLE, Seg, tint, type Role } from "./ui";

/*
 * Explanatory figures for the World Models chapters. Every figure uses the same
 * role colours (see ROLE) and only restates what the chapter text says.
 */

/* ───────────────────────── shared building blocks ───────────────────────── */

type NodeState = "idle" | "on" | "dim";

export function FigureShell({
  title,
  kicker = "Figure",
  legend,
  caption,
  controls,
  children,
}: {
  title: string;
  kicker?: string;
  legend?: Role[];
  caption?: ReactNode;
  controls?: ReactNode;
  children: ReactNode;
}) {
  return (
    <figure className="my-8 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0c]">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-white/5 px-4 py-3">
        <div>
          <div className="kicker text-ink-fade">{kicker}</div>
          <div className="text-[15px] font-semibold text-white">{title}</div>
        </div>
        {legend ? <Legend roles={legend} /> : null}
      </div>
      <div className="px-3 py-6 sm:px-5">
        {children}
      </div>
      {controls}
      {caption ? (
        <figcaption className="border-t border-white/5 px-4 py-3 text-[14.5px] leading-6 text-ink-soft">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

const ROLE_LABEL: Record<Role, string> = {
  context: "context — seen",
  target: "target — hidden",
  encoder: "encoder (trained)",
  predictor: "predictor",
  frozen: "EMA / no gradient",
  loss: "loss",
};

function Legend({ roles }: { roles: Role[] }) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1">
      {roles.map((role) => (
        <span key={role} className="flex items-center gap-1.5 text-[12px] text-ink-soft">
          <span className="size-2.5 rounded-[3px]" style={{ background: ROLE[role] }} />
          {ROLE_LABEL[role]}
        </span>
      ))}
    </div>
  );
}

function Node({
  role,
  title,
  sub,
  state = "idle",
  dashed = false,
  children,
}: {
  role: Role;
  title: ReactNode;
  sub?: ReactNode;
  state?: NodeState;
  dashed?: boolean;
  children?: ReactNode;
}) {
  const color = ROLE[role];
  const on = state === "on";
  return (
    <motion.div
      initial={false}
      animate={{ opacity: state === "dim" ? 0.35 : 1, scale: on ? 1.04 : 1 }}
      transition={snappy}
      className="relative rounded-xl border px-1.5 py-2 text-center transition-[background-color,border-color] duration-300 sm:px-3"
      style={{
        borderColor: tint(color, on ? 0.95 : 0.4),
        borderStyle: dashed ? "dashed" : "solid",
        borderWidth: on ? 2 : 1,
        background: tint(color, on ? 0.16 : 0.05),
      }}
    >
      <div className="text-[12px] font-semibold leading-tight text-white sm:text-[14px]">{title}</div>
      {sub ? (
        <div className="mt-0.5 text-[10.5px] leading-tight sm:text-[12px]" style={{ color }}>
          {sub}
        </div>
      ) : null}
      {children}
    </motion.div>
  );
}

/** Arrow with a flowing dash while its stage is active. */
function Arrow({
  dir = "right",
  role = "encoder",
  state = "idle",
  dashed = false,
  className = "",
}: {
  dir?: "right" | "down" | "up";
  role?: Role;
  state?: NodeState;
  dashed?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const color = state === "dim" ? "rgba(255,255,255,0.14)" : state === "on" ? ROLE[role] : tint(ROLE[role], 0.55);
  const flowing = state === "on" && !reduce;
  const vertical = dir !== "right";
  // own viewBox per orientation, so nothing is rotated out of its box
  const line = vertical ? (dir === "down" ? "M6 1 V19" : "M6 27 V9") : "M1 6 H20";
  const head = vertical ? (dir === "down" ? "M1.5 18 L6 26 L10.5 18 Z" : "M1.5 10 L6 2 L10.5 10 Z") : "M19 1.5 L27 6 L19 10.5 Z";
  return (
    <svg
      viewBox={vertical ? "0 0 12 28" : "0 0 28 12"}
      aria-hidden="true"
      className={`shrink-0 ${vertical ? "mx-auto h-6 w-3 sm:h-7" : "h-3 w-4 sm:w-7"} ${className}`}
    >
      <motion.path
        d={line}
        stroke={color}
        strokeWidth={state === "on" ? 2.2 : 1.6}
        strokeLinecap="round"
        strokeDasharray={dashed || flowing ? "4 3" : undefined}
        initial={false}
        animate={flowing ? { strokeDashoffset: [14, 0] } : { strokeDashoffset: 0 }}
        transition={flowing ? { repeat: Infinity, ease: "linear", duration: 0.7 } : { duration: 0 }}
      />
      <path d={head} fill={color} />
    </svg>
  );
}

/** A representation vector: a short column of cells, so "a list of numbers" is literally visible. */
function Vec({ role, label, state = "idle", values = [0.9, 0.35, 0.7, 0.2, 0.55] }: { role: Role; label: ReactNode; state?: NodeState; values?: number[] }) {
  const color = ROLE[role];
  return (
    <motion.div
      initial={false}
      animate={{ opacity: state === "dim" ? 0.35 : 1, scale: state === "on" ? 1.06 : 1 }}
      transition={snappy}
      className="flex flex-col items-center gap-1"
    >
      <div className="flex flex-col gap-[3px] rounded-md border p-1" style={{ borderColor: tint(color, 0.5) }}>
        {values.map((value, index) => (
          <span key={index} className="block h-[5px] w-6 rounded-[2px] sm:w-8" style={{ background: tint(color, 0.25 + value * 0.75) }} />
        ))}
      </div>
      <span className="text-[11px] font-medium leading-tight sm:text-[12.5px]" style={{ color }}>
        {label}
      </span>
    </motion.div>
  );
}

/** Patch grid: every cell tinted by the role it plays. */
function PatchGrid({ n, roleAt, className = "" }: { n: number; roleAt: (r: number, c: number) => Role | null; className?: string }) {
  return (
    <div className={`grid gap-[2px] rounded-md border border-white/10 bg-black p-[3px] ${className}`} style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
      {Array.from({ length: n * n }, (_, index) => {
        const role = roleAt(Math.floor(index / n), index % n);
        return (
          <span
            key={index}
            className="aspect-square rounded-[2px] transition-colors duration-500"
            style={{ background: role ? tint(ROLE[role], role === "target" ? 0.9 : 0.55) : "rgba(255,255,255,0.1)" }}
          />
        );
      })}
    </div>
  );
}

function useStepper(count: number, interval = 3200) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setStep((value) => (value + 1) % count), interval);
    return () => window.clearInterval(id);
  }, [playing, count, interval]);
  return {
    step,
    playing,
    go: (index: number) => {
      setPlaying(false);
      setStep(index);
    },
    toggle: () => setPlaying((value) => !value),
  };
}

type Stepper = ReturnType<typeof useStepper>;

function StepControls({ steps, stepper }: { steps: Array<{ title: string; text: string }>; stepper: Stepper }) {
  const current = steps[stepper.step];
  return (
    <div className="border-t border-white/5 px-4 py-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={stepper.toggle}
          aria-label={stepper.playing ? "Pause walkthrough" : "Play walkthrough"}
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-raised text-ink transition hover:border-rubric/60 hover:text-white"
        >
          {stepper.playing ? <Pause size={14} /> : <Play size={14} className="translate-x-px" />}
        </button>
        <div className="flex flex-1 gap-1" role="tablist" aria-label="Walkthrough steps">
          {steps.map((item, index) => (
            <button
              key={item.title}
              type="button"
              role="tab"
              aria-selected={index === stepper.step}
              aria-label={item.title}
              onClick={() => stepper.go(index)}
              className="flex-1 py-3"
            >
              <span className="block h-1.5 overflow-hidden rounded-full bg-white/10">
                <motion.span
                  className="block h-full origin-left rounded-full bg-primary"
                  initial={false}
                  animate={{ scaleX: index <= stepper.step ? 1 : 0 }}
                  transition={spring}
                />
              </span>
            </button>
          ))}
        </div>
        <span className="shrink-0 font-mono text-[12px] text-ink-fade">
          {stepper.step + 1}/{steps.length}
        </span>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={stepper.step}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={snappy}
          className="mt-1 min-h-[76px]"
        >
          <div className="text-[14px] font-semibold text-white">{current.title}</div>
          <p className="mt-0.5 text-[14.5px] leading-6 text-ink-soft">{current.text}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** Tiny frame of the bouncing-ball clip. `ghost` draws the blurry average of two futures. */
function BallFrame({ x, y, role, masked = false, ghost = false, label }: { x: number; y: number; role: Role; masked?: boolean; ghost?: boolean; label?: string }) {
  const color = ROLE[role];
  return (
    <div className="flex flex-col items-center gap-1">
      <svg viewBox="0 0 40 40" className="w-full rounded-md border" style={{ borderColor: tint(color, 0.6), background: "#050506" }} aria-hidden="true">
        <line x1="2" y1="36" x2="38" y2="36" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
        {masked ? (
          <>
            <rect x="0" y="0" width="40" height="40" fill={tint(color, 0.16)} />
            <text x="20" y="26" textAnchor="middle" fontSize="16" fontWeight="700" fill={color}>?</text>
          </>
        ) : ghost ? (
          <g style={{ filter: "blur(1.4px)" }}>
            <circle cx={x} cy={y - 9} r="5" fill="#ededed" opacity="0.45" />
            <circle cx={x} cy={y + 9} r="5" fill="#ededed" opacity="0.45" />
          </g>
        ) : (
          <circle cx={x} cy={y} r="5" fill="#ededed" />
        )}
      </svg>
      {label ? <span className="text-[10.5px] leading-none sm:text-[11.5px]" style={{ color }}>{label}</span> : null}
    </div>
  );
}

/* ───────────────────────── ch01 · the three ingredients ───────────────────────── */

const CLIP = [
  [8, 10], [11, 16], [14, 23], [17, 30], [20, 25], [23, 20], [26, 17], [29, 19], [32, 23],
] as const;

const INGREDIENT_STEPS = [
  { title: "1 · Mask", text: "The mask splits one clip into two parts of the same input: the context (frames 1–8, seen) and the target (frame 9, hidden)." },
  { title: "2 · Encoder", text: "z = f(x). The encoder turns the context into a representation — a vector that summarizes what is going on (a ball, moving right, falling)." },
  { title: "3 · Predictor", text: "ẑ = g(z_context, where). The predictor guesses the target from the context's representation. It is also told where/when the target is: frame 9." },
  { title: "4 · Loss", text: "The loss compares the guess with the real target and returns one number. What \"the real target\" is — raw pixels or their representation — is chapter 02's decision." },
  { title: "5 · Update", text: "Backpropagate and nudge the encoder and predictor to make the loss smaller. Repeat millions of times. Afterwards the encoder is usually kept; the predictor was scaffolding." },
];

export function IngredientsFigure() {
  const stepper = useStepper(INGREDIENT_STEPS.length);
  const s = stepper.step;
  const st = (active: boolean): NodeState => (active ? "on" : "idle");

  return (
    <FigureShell
      title="The whole machine at a glance"
      legend={["context", "target", "encoder", "predictor", "loss"]}
      controls={<StepControls steps={INGREDIENT_STEPS} stepper={stepper} />}
    >
      {/* the clip */}
      <div className="grid grid-cols-9 gap-1 sm:gap-1.5">
        {CLIP.map(([x, y], index) => (
          <BallFrame key={index} x={x} y={y} role={index === 8 ? "target" : "context"} masked={index === 8} label={`${index + 1}`} />
        ))}
      </div>
      <div className="mt-1.5 grid grid-cols-9 gap-1 sm:gap-1.5">
        <motion.div
          initial={false}
          animate={{ opacity: s === 0 || s === 1 ? 1 : 0.55 }}
          className="col-span-8 border-t-2 pt-1 text-center text-[11.5px] font-medium sm:text-[12.5px]"
          style={{ borderColor: ROLE.context, color: ROLE.context }}
        >
          context · seen
        </motion.div>
        <motion.div
          initial={false}
          animate={{ opacity: s === 0 || s === 3 ? 1 : 0.55 }}
          className="border-t-2 pt-1 text-center text-[11.5px] font-medium sm:text-[12.5px]"
          style={{ borderColor: ROLE.target, color: ROLE.target }}
        >
          target
        </motion.div>
      </div>

      {/* the three ingredients */}
      <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-1 sm:gap-x-2">
        <Arrow dir="down" role="context" state={st(s === 1)} />
        <span />
        <span />
        <span />
        <Arrow dir="down" role="target" state={st(s === 3)} />

        <Node role="encoder" title="Encoder" sub="z = f(x)" state={st(s === 1 || s === 4)} />
        <Arrow role="encoder" state={st(s === 2)} />
        <Node role="predictor" title="Predictor" sub={<>ẑ = g(z, <span className="text-white">where</span>)</>} state={st(s === 2 || s === 4)} />
        <Arrow role="predictor" state={st(s === 3)} />
        <Node role="loss" title="Loss" sub="how wrong?" state={st(s === 3 || s === 4)} />
      </div>

      {/* backprop loop */}
      <motion.div initial={false} animate={{ opacity: s === 4 ? 1 : 0.25 }} transition={spring} className="relative mt-2 h-7">
        <div
          className="absolute left-[16%] right-[16%] top-4 border-t-2 border-dashed"
          style={{ borderColor: ROLE.loss }}
        />
        <div className="absolute left-[16%] top-0 h-4 border-l-2 border-dashed" style={{ borderColor: ROLE.loss }} />
        <div className="absolute left-1/2 top-0 h-4 border-l-2 border-dashed" style={{ borderColor: ROLE.loss }} />
        <div className="absolute right-[16%] top-0 h-4 border-l-2 border-dashed" style={{ borderColor: ROLE.loss }} />
        <span className="absolute left-1/2 top-[18px] -translate-x-1/2 bg-[#0a0a0c] px-2 text-[11.5px] font-medium sm:text-[12.5px]" style={{ color: ROLE.loss }}>
          gradient → update weights, repeat
        </span>
      </motion.div>
    </FigureShell>
  );
}

/* ───────────────────────── ch02 · pixel vs latent target ───────────────────────── */

type TargetMode = "pixel" | "latent";

export function PixelVsLatentFigure() {
  const [mode, setMode] = useState<TargetMode>("pixel");
  const latent = mode === "latent";

  return (
    <FigureShell
      title="Same machine, two ways to grade the guess"
      legend={["context", "target", "encoder", "predictor", "loss"]}
      controls={
        <div className="border-t border-white/5 px-4 py-3">
          <Seg
            value={mode}
            onChange={setMode}
            options={[
              { value: "pixel", label: "Pixel target" },
              { value: "latent", label: "Latent target (JEPA)" },
            ]}
          />
        </div>
      }
      caption={
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={snappy} className="block">
            {latent
              ? "The target goes through an encoder too, and the loss compares representations. That encoder can drop what can't be predicted (leaf texture, sensor noise) — but because the target is now learned, collapse has to be prevented (chapter 03)."
              : "The loss compares predicted pixels with real pixels. When the future is uncertain, the squared-error optimum is the average of the possible futures — a blurry ghost — and every unpredictable pixel is charged."}
          </motion.span>
        </AnimatePresence>
      }
    >
      <div className="grid grid-cols-[minmax(0,0.8fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,0.8fr)] items-center gap-x-1 gap-y-1 sm:gap-x-2">
        {/* row 1: context → encoder → predictor → prediction */}
        <div className="grid grid-cols-2 gap-1">
          {CLIP.slice(4, 8).map(([x, y], index) => (
            <BallFrame key={index} x={x} y={y} role="context" />
          ))}
        </div>
        <Arrow role="context" state="on" />
        <Node role="encoder" title="Encoder" sub="context → z" />
        <Arrow role="encoder" />
        <Node role="predictor" title={latent ? "Predictor" : "Predictor / decoder"} sub={latent ? "outputs a representation" : "outputs pixels"} />
        <Arrow role="predictor" />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={`pred-${mode}`} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} transition={snappy}>
            {latent ? <Vec role="predictor" label="ẑ predicted" /> : <BallFrame x={30} y={20} role="predictor" ghost label="predicted" />}
          </motion.div>
        </AnimatePresence>

        {/* row 2: loss between prediction and target */}
        <div className="col-span-6" />
        <div className="flex flex-col items-center">
          <Arrow dir="down" role="predictor" state="on" className="!h-4" />
          <Node role="loss" title="Loss" sub={latent ? "in representation space" : "squared error on pixels"} state="on" />
          <Arrow dir="up" role="target" state="on" className="!h-4" />
        </div>

        {/* row 3: real frame → (target encoder) → target */}
        <BallFrame x={30} y={12} role="target" label="real frame" />
        <Arrow role="target" />
        <AnimatePresence mode="wait" initial={false}>
          {latent ? (
            <motion.div key="tgt-enc" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={spring}>
              <Node role="frozen" title="Target encoder" sub="also an encoder" />
            </motion.div>
          ) : (
            <motion.div key="no-enc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={snappy}>
              <Node role="frozen" title="no encoder" sub="raw pixels" state="dim" dashed />
            </motion.div>
          )}
        </AnimatePresence>
        <Arrow role="target" />
        <div className="h-0.5 w-full rounded-full" style={{ background: tint(ROLE.target, 0.55) }} />
        <Arrow role="target" />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={`tgt-${mode}`} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} transition={snappy}>
            {latent ? <Vec role="target" label="z target" values={[0.85, 0.4, 0.65, 0.25, 0.5]} /> : <BallFrame x={30} y={12} role="target" label="real pixels" />}
          </motion.div>
        </AnimatePresence>
      </div>
    </FigureShell>
  );
}

/* ───────────────────────── ch03 · collapse ───────────────────────── */

const CLOUD = [
  { label: "cat", role: "context" as Role, at: [22, 26] },
  { label: "cat", role: "context" as Role, at: [28, 32] },
  { label: "car", role: "target" as Role, at: [74, 22] },
  { label: "car", role: "target" as Role, at: [80, 30] },
  { label: "ball", role: "encoder" as Role, at: [50, 56] },
  { label: "ball", role: "encoder" as Role, at: [43, 62] },
  { label: "tree", role: "predictor" as Role, at: [20, 78] },
  { label: "tree", role: "predictor" as Role, at: [27, 72] },
  { label: "cup", role: "loss" as Role, at: [78, 76] },
  { label: "cup", role: "loss" as Role, at: [72, 82] },
];

export function CollapseFigure() {
  const [collapsed, setCollapsed] = useState(false);
  const metrics = collapsed
    ? [
        { name: "Loss", value: "0.0001", note: "looks perfect", bad: true },
        { name: "Spread per dimension", value: "0.008", note: "every input → the same vector", bad: true, bar: 0.02 },
        { name: "Linear probe", value: "worse than untrained", note: "nothing was learned", bad: true },
      ]
    : [
        { name: "Loss", value: "> 0", note: "falls slowly", bad: false },
        { name: "Spread per dimension", value: "0.35", note: "inputs stay apart", bad: false, bar: 0.9 },
        { name: "Linear probe", value: "above chance", note: "the embedding is useful", bad: false },
      ];

  return (
    <FigureShell
      title="Representation space: healthy vs collapsed"
      controls={
        <div className="border-t border-white/5 px-4 py-3">
          <Seg
            value={collapsed ? "collapsed" : "healthy"}
            onChange={(value) => setCollapsed(value === "collapsed")}
            options={[
              { value: "healthy", label: "Healthy" },
              { value: "collapsed", label: "Collapsed (the cheat)" },
            ]}
          />
        </div>
      }
      caption="Each dot is one input after the encoder; two dots of a colour are two views of the same thing. Collapse moves every input to the same point: prediction = target, loss ≈ 0, and the representation says nothing. Numbers from chapter 08's lab with the stop-gradient and EMA removed."
    >
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <svg viewBox="0 0 100 100" className="w-full rounded-xl border border-white/10 bg-black" role="img" aria-label={collapsed ? "All embeddings squeezed into one point" : "Embeddings spread out, same objects close together"}>
          {[25, 50, 75].map((v) => (
            <g key={v}>
              <line x1={v} y1="4" x2={v} y2="96" stroke="rgba(255,255,255,0.06)" />
              <line x1="4" y1={v} x2="96" y2={v} stroke="rgba(255,255,255,0.06)" />
            </g>
          ))}
          {CLOUD.map((point, index) => (
            <motion.circle
              key={index}
              r="3.2"
              fill={ROLE[point.role]}
              initial={false}
              animate={{
                cx: collapsed ? 50 + ((index % 3) - 1) * 0.6 : point.at[0],
                cy: collapsed ? 50 + ((index % 2) - 0.5) * 0.6 : point.at[1],
              }}
              transition={{ ...spring, delay: collapsed ? index * 0.03 : 0 }}
            />
          ))}
          <AnimatePresence>
            {!collapsed
              ? CLOUD.filter((_, index) => index % 2 === 0).map((point) => (
                  <motion.text
                    key={point.label}
                    x={point.at[0] + 5}
                    y={point.at[1] - 4}
                    fontSize="5"
                    fill={ROLE[point.role]}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {point.label}
                  </motion.text>
                ))
              : (
                  <motion.text key="one" x="50" y="40" fontSize="5" textAnchor="middle" fill={ROLE.loss} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    one vector for everything
                  </motion.text>
                )}
          </AnimatePresence>
        </svg>
        <div className="grid content-center gap-2">
          {metrics.map((metric) => (
            <div key={metric.name} className="rounded-xl border border-white/10 bg-raised/60 px-3 py-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[12.5px] text-ink-soft">{metric.name}</span>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={metric.value}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={snappy}
                    className="font-mono text-[14px] font-semibold"
                    style={{ color: metric.bad ? ROLE.loss : ROLE.encoder }}
                  >
                    {metric.value}
                  </motion.span>
                </AnimatePresence>
              </div>
              {"bar" in metric && metric.bar !== undefined ? (
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full origin-left rounded-full"
                    style={{ background: metric.bad ? ROLE.loss : ROLE.encoder }}
                    initial={false}
                    animate={{ scaleX: metric.bar }}
                    transition={spring}
                  />
                </div>
              ) : null}
              <div className="mt-1 text-[12px] text-ink-fade">{metric.note}</div>
            </div>
          ))}
        </div>
      </div>
    </FigureShell>
  );
}

/* ───────────────────────── ch05 / ch06 · twin-encoder pipeline (I-JEPA, V-JEPA) ───────────────────────── */

export type PipePart = "input" | "mask" | "ctx" | "tgt" | "reps" | "tokens" | "pred" | "loss" | "ema";

export function TwinPipeline({
  on,
  grad,
  topInput,
  bottomInput,
  ctx,
  tgt,
  pred,
  select,
  lossSub,
}: {
  on: (part: PipePart) => boolean;
  grad: boolean;
  topInput: ReactNode;
  bottomInput: ReactNode;
  ctx: { title: string; sub: string };
  tgt: { title: string; sub: string };
  pred: { title: string; sub: string; tokens: string };
  select: { title: string; sub: string };
  lossSub: string;
}) {
  const st = (part: PipePart): NodeState => (on(part) ? "on" : "idle");
  // gradient view: the trained path lights up, the target path goes grey and dashed
  const flow = (part: PipePart, role: Role): { role: Role; state: NodeState; dashed?: boolean } =>
    grad ? (role === "frozen" || role === "target" ? { role: "frozen", state: "on", dashed: true } : { role: "encoder", state: "on" }) : { role, state: st(part) };

  return (
    <div className="grid grid-cols-[minmax(0,0.9fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,0.7fr)] items-center gap-x-1 gap-y-1 sm:gap-x-2">
      {/* row 1 — trained path */}
      <motion.div initial={false} animate={{ scale: on("input") || on("mask") ? 1.04 : 1 }} transition={snappy}>
        {topInput}
      </motion.div>
      <Arrow {...flow("ctx", "context")} />
      <Node role="encoder" title={ctx.title} sub={ctx.sub} state={grad ? "on" : st("ctx")} />
      <Arrow {...flow("pred", "encoder")} />
      <Node role="predictor" title={pred.title} sub={pred.sub} state={grad ? "on" : st("pred")}>
        <motion.div initial={false} animate={{ opacity: on("tokens") || on("pred") ? 1 : 0.45 }} className="mt-1.5 flex flex-col items-center gap-1">
          <div className="flex gap-[3px]">
            {[0, 1, 2, 3].map((index) => (
              <span key={index} className="size-2 rounded-[2px] sm:size-2.5" style={{ background: tint(ROLE.target, 0.85) }} />
            ))}
          </div>
          <span className="text-[10px] leading-tight text-ink-soft sm:text-[11px]">{pred.tokens}</span>
        </motion.div>
      </Node>
      <Arrow {...flow("pred", "predictor")} />
      <Vec role="predictor" label="predicted" state={on("pred") || on("loss") ? "on" : "idle"} />

      {/* row 2 — EMA link and the loss */}
      <div />
      <div />
      <div className="flex flex-col items-center">
        <Arrow dir="down" role="frozen" state={on("ema") ? "on" : "idle"} dashed className="!h-5" />
        <span className="text-[10.5px] font-semibold sm:text-[12px]" style={{ color: on("ema") ? ROLE.frozen : tint(ROLE.frozen, 0.7) }}>
          EMA copy
        </span>
        <Arrow dir="down" role="frozen" state={on("ema") ? "on" : "idle"} dashed className="!h-5" />
      </div>
      <div />
      <div />
      <div />
      <div className="flex flex-col items-center">
        <Arrow dir="down" role="predictor" state={st("loss")} className="!h-4" />
        <Node role="loss" title="Loss" sub={lossSub} state={st("loss")} />
        <Arrow dir="up" role="target" state={st("loss")} className="!h-4" />
      </div>

      {/* row 3 — target path */}
      <motion.div initial={false} animate={{ scale: on("input") ? 1.04 : 1 }} transition={snappy}>
        {bottomInput}
      </motion.div>
      <Arrow {...flow("tgt", "target")} />
      <Node role="frozen" title={tgt.title} sub={tgt.sub} state={grad ? "on" : st("tgt")} dashed={grad} />
      <Arrow {...flow("reps", "frozen")} />
      <Node role="target" title={select.title} sub={select.sub} state={st("reps")} />
      <div className="relative">
        <Arrow {...flow("reps", "target")} />
        <AnimatePresence>
          {grad ? (
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[11px] font-semibold sm:block"
              style={{ borderColor: tint(ROLE.frozen, 0.6), color: ROLE.frozen, background: "#0a0a0c" }}
            >
              stop-grad
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>
      <Vec role="target" label="target" values={[0.85, 0.4, 0.65, 0.25, 0.5]} state={on("reps") || on("loss") ? "on" : "idle"} />
    </div>
  );
}

export function GradientLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-ink-soft">
      <span className="flex items-center gap-1.5">
        <span className="h-0.5 w-5 rounded" style={{ background: ROLE.encoder }} /> gets gradient
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-0.5 w-5 rounded border-t-2 border-dashed" style={{ borderColor: ROLE.frozen }} /> no gradient (stop-grad / EMA)
      </span>
    </div>
  );
}

export { useStepper, StepControls, PatchGrid };

/* ───────────────────────── ch06 · V-JEPA ───────────────────────── */

const VJEPA_STEPS: Array<{ title: string; text: string; parts: PipePart[]; grad?: boolean }> = [
  { title: "1 · Clip → tubelets", text: "16 frames (every 4th, about 3 s) at 224×224, cut into 2×16×16 tubelets: 8 time steps × 14 × 14 = 1,568 tokens.", parts: ["input"] },
  { title: "2 · Tube mask", text: "A short-range mask (8 blocks, ~15% of a frame each) and a long-range one (2 blocks, ~70% each), repeated through time — about 90% of the clip is hidden.", parts: ["input", "mask"] },
  { title: "3 · x-encoder", text: "A ViT sees only the visible tokens: the masked ones are simply dropped from its input.", parts: ["input", "ctx"] },
  { title: "4 · y-encoder", text: "A second encoder sees the whole clip. The targets are its outputs at the masked positions, behind a stop-gradient.", parts: ["tgt", "reps"] },
  { title: "5 · Predictor", text: "A narrow transformer (12 blocks, width 384) gets the x-encoder output plus learnable mask tokens carrying the space-time positions it must predict.", parts: ["ctx", "tokens", "pred"] },
  { title: "6 · L1 loss", text: "Average L1 distance between predicted and target features — over the masked positions only. (I-JEPA used L2.)", parts: ["pred", "reps", "loss"] },
  { title: "7 · Update", text: "Gradients train the x-encoder and the predictor. The y-encoder gets none: it follows as an EMA of the x-encoder, momentum 0.998 → 1.0.", parts: ["ctx", "pred", "loss", "ema", "tgt"], grad: true },
];

/** Three stacked frames with the same spatial block hidden in each: a tube through time. */
function TubeClip({ masked, full = false }: { masked: boolean; full?: boolean }) {
  const inTube = (r: number, c: number) => r >= 1 && r <= 3 && c >= 1 && c <= 2;
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[92px]">
      {[2, 1, 0].map((depth) => (
        <div key={depth} className="absolute w-[76%]" style={{ left: `${depth * 12}%`, top: `${depth * 12}%`, opacity: 1 - depth * 0.25 }}>
          <PatchGrid
            n={5}
            // the x-encoder never sees masked tokens: they are dropped, so they show as empty
            roleAt={(r, c) => (full ? (masked && inTube(r, c) ? "target" : "frozen") : masked && inTube(r, c) ? null : "context")}
          />
        </div>
      ))}
    </div>
  );
}

export function VJepaFigure() {
  const stepper = useStepper(VJEPA_STEPS.length);
  const [showGrad, setShowGrad] = useState(false);
  const current = VJEPA_STEPS[stepper.step];
  const grad = showGrad || Boolean(current.grad);
  const masked = stepper.step >= 1;

  return (
    <FigureShell
      title="V-JEPA, end to end"
      legend={["context", "target", "encoder", "predictor", "frozen", "loss"]}
      controls={
        <>
          <StepControls steps={VJEPA_STEPS} stepper={stepper} />
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/5 px-4 py-2.5">
            {grad ? <GradientLegend /> : <span className="text-[12px] text-ink-fade">Top row is trained; bottom row only makes the targets.</span>}
            <label className="flex items-center gap-2 text-[12.5px] text-ink-soft">
              <input type="checkbox" checked={grad} disabled={Boolean(current.grad)} onChange={(event) => setShowGrad(event.target.checked)} className="accent-rubric" />
              Show gradient flow
            </label>
          </div>
        </>
      }
    >
      <TwinPipeline
        on={(part) => current.parts.includes(part)}
        grad={grad}
        topInput={
          <div className="flex flex-col items-center gap-1">
            <TubeClip masked={masked} />
            <span className="text-[10.5px] text-ink-soft sm:text-[11.5px]">{masked ? "visible tokens" : "16-frame clip"}</span>
          </div>
        }
        bottomInput={
          <div className="flex flex-col items-center gap-1">
            <TubeClip masked={masked} full />
            <span className="text-[10.5px] text-ink-soft sm:text-[11.5px]">whole clip</span>
          </div>
        }
        ctx={{ title: "x-encoder", sub: "ViT · visible only" }}
        tgt={{ title: "y-encoder", sub: "EMA · no grad" }}
        pred={{ title: "Predictor", sub: "12 blocks · w 384", tokens: "mask tokens (t, h, w)" }}
        select={{ title: "Masked spots", sub: "outputs at hidden positions" }}
        lossSub="L1 · masked only"
      />
    </FigureShell>
  );
}
