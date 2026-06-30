"use client";

import { useMemo, useState } from "react";
import { Shapes } from "lucide-react";

type Point = { x: number; y: number };
type Constraint = { w1: number; w2: number; b: number; label: string };
type ModeKey = "triangle" | "strip" | "wedge" | "ellipse" | "union";
type Strategy = "correct" | "global-and";

const EXTENT = 4;
const WIDTH = 360;
const HEIGHT = 300;
const PAD = 24;
const PLOT_W = WIDTH - PAD * 2;
const PLOT_H = HEIGHT - PAD * 2;

const MODES: Record<ModeKey, { label: string; title: string; summary: string }> = {
  triangle: {
    label: "triângulo",
    title: "Três lados, três perceptrons, um AND",
    summary: "O interior precisa passar nas três meias-regiões.",
  },
  strip: {
    label: "faixa",
    title: "Entre retas paralelas",
    summary: "Acima da reta inferior AND abaixo da reta superior.",
  },
  wedge: {
    label: "duas retas",
    title: "Acima de uma reta e abaixo de outra",
    summary: "A região fica no corredor onde as duas condições são verdadeiras.",
  },
  ellipse: {
    label: "elipse",
    title: "Elipse aproximada por tangentes",
    summary: "Cada tangente corta o exterior; o AND dos lados internos forma um polígono.",
  },
  union: {
    label: "duas elipses",
    title: "União de sub-regiões",
    summary: "Cada elipse é um AND próprio; a camada final faz OR entre elas.",
  },
};

function score(point: Point, c: Constraint) {
  return c.w1 * point.x + c.w2 * point.y + c.b;
}

function toSvg(point: Point) {
  return {
    x: PAD + ((point.x + EXTENT) / (EXTENT * 2)) * PLOT_W,
    y: PAD + ((EXTENT - point.y) / (EXTENT * 2)) * PLOT_H,
  };
}

function lineSegment(c: Constraint) {
  const candidates: Point[] = [];

  if (Math.abs(c.w2) > 0.001) {
    for (const x of [-EXTENT, EXTENT]) {
      const y = -(c.w1 * x + c.b) / c.w2;
      if (y >= -EXTENT && y <= EXTENT) candidates.push({ x, y });
    }
  }

  if (Math.abs(c.w1) > 0.001) {
    for (const y of [-EXTENT, EXTENT]) {
      const x = -(c.w2 * y + c.b) / c.w1;
      if (x >= -EXTENT && x <= EXTENT) candidates.push({ x, y });
    }
  }

  return candidates
    .filter(
      (point, idx) =>
        candidates.findIndex(
          (other) =>
            Math.abs(other.x - point.x) < 0.001 &&
            Math.abs(other.y - point.y) < 0.001
        ) === idx
    )
    .slice(0, 2)
    .map(toSvg);
}

function ellipseConstraints(cx: number, cy: number, rx: number, ry: number, count: number) {
  return Array.from({ length: count }, (_, idx) => {
    const angle = (Math.PI * 2 * idx) / count;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      w1: -cos / rx,
      w2: -sin / ry,
      b: 1 + (cos * cx) / rx + (sin * cy) / ry,
      label: `t${idx + 1}`,
    };
  });
}

function baseConstraints(mode: ModeKey) {
  if (mode === "triangle") {
    return [
      { w1: 0, w2: 1, b: 2.6, label: "p1: x2 >= -2.6" },
      { w1: -0.7, w2: -1, b: 2.2, label: "p2: x2 <= -0.7*x1 + 2.2" },
      { w1: 0.9, w2: -1, b: 2.0, label: "p3: x2 <= 0.9*x1 + 2.0" },
    ];
  }

  if (mode === "strip") {
    return [
      { w1: -0.65, w2: 1, b: 1.0, label: "p1: acima da inferior" },
      { w1: 0.65, w2: -1, b: 1.3, label: "p2: abaixo da superior" },
    ];
  }

  if (mode === "wedge") {
    return [
      { w1: 0.9, w2: 1, b: 1.1, label: "p1: acima de r1" },
      { w1: 0.55, w2: -1, b: 2.2, label: "p2: abaixo de r2" },
    ];
  }

  if (mode === "ellipse") {
    return ellipseConstraints(0, 0, 2.75, 1.55, 12);
  }

  return [];
}

function allPass(point: Point, constraints: Constraint[]) {
  return constraints.every((constraint) => score(point, constraint) >= 0);
}

function formatConstraint(c: Constraint) {
  const w2 = c.w2 >= 0 ? `+ ${c.w2.toFixed(2)}*x2` : `- ${Math.abs(c.w2).toFixed(2)}*x2`;
  const b = c.b >= 0 ? `+ ${c.b.toFixed(2)}` : `- ${Math.abs(c.b).toFixed(2)}`;
  return `${c.w1.toFixed(2)}*x1 ${w2} ${b} >= 0`;
}

export default function PerceptronRegionPlayground({
  initialMode = "triangle",
}: {
  initialMode?: ModeKey;
}) {
  const [mode, setMode] = useState<ModeKey>(initialMode);
  const [strategy, setStrategy] = useState<Strategy>("correct");

  const ellipseA = useMemo(() => ellipseConstraints(-1.15, 0, 1.75, 1.2, 12), []);
  const ellipseB = useMemo(() => ellipseConstraints(1.15, 0, 1.75, 1.2, 12), []);
  const constraints = useMemo(() => baseConstraints(mode), [mode]);

  const points = useMemo(() => {
    const values = Array.from({ length: 33 }, (_, idx) => -EXTENT + idx * (EXTENT * 2) / 32);
    return values.flatMap((x) => values.map((y) => ({ x, y })));
  }, []);

  const activeConstraints = mode === "union" ? [...ellipseA, ...ellipseB] : constraints;

  const isInside = (point: Point) => {
    if (mode !== "union") return allPass(point, constraints);
    const inA = allPass(point, ellipseA);
    const inB = allPass(point, ellipseB);
    return strategy === "correct" ? inA || inB : inA && inB;
  };

  const insideCount = points.filter(isInside).length;
  const modeMeta = MODES[mode];

  return (
    <div className="my-6 bg-card border border-border rounded-sm p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shapes size={14} className="text-rubric shrink-0" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-rubric">
          simulador — regiões por composição
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {(Object.keys(MODES) as ModeKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setMode(key);
              setStrategy("correct");
            }}
            className={`min-h-10 rounded-sm border px-3 py-2 font-mono text-[10px] uppercase tracking-widest transition ${
              mode === key
                ? "border-rubric bg-rubric/10 text-rubric"
                : "border-border bg-background text-ink-fade hover:text-ink"
            }`}
          >
            {MODES[key].label}
          </button>
        ))}
      </div>

      {mode === "union" && (
        <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setStrategy("correct")}
            className={`min-h-11 rounded-sm border px-3 py-2 font-mono text-[10px] uppercase tracking-widest transition ${
              strategy === "correct"
                ? "border-rubric bg-rubric/10 text-rubric"
                : "border-border bg-background text-ink-fade hover:text-ink"
            }`}
          >
            correto: AND por elipse, depois OR
          </button>
          <button
            type="button"
            onClick={() => setStrategy("global-and")}
            className={`min-h-11 rounded-sm border px-3 py-2 font-mono text-[10px] uppercase tracking-widest transition ${
              strategy === "global-and"
                ? "border-rubric bg-rubric/10 text-rubric"
                : "border-border bg-background text-ink-fade hover:text-ink"
            }`}
          >
            erro comum: AND global
          </button>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="bg-background border border-border rounded-sm p-3 overflow-hidden">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full max-w-[560px] mx-auto block">
            <rect x={PAD} y={PAD} width={PLOT_W} height={PLOT_H} fill="rgba(245,239,227,0.75)" />
            {Array.from({ length: 9 }, (_, i) => {
              const v = -EXTENT + i;
              const sx = toSvg({ x: v, y: -EXTENT });
              const ex = toSvg({ x: v, y: EXTENT });
              const sy = toSvg({ x: -EXTENT, y: v });
              const ey = toSvg({ x: EXTENT, y: v });
              return (
                <g key={v}>
                  <line x1={sx.x} y1={sx.y} x2={ex.x} y2={ex.y} stroke="rgba(26,21,18,0.08)" />
                  <line x1={sy.x} y1={sy.y} x2={ey.x} y2={ey.y} stroke="rgba(26,21,18,0.08)" />
                </g>
              );
            })}

            {points.map((point) => {
              const svg = toSvg(point);
              const inside = isInside(point);
              return (
                <circle
                  key={`${point.x}-${point.y}`}
                  cx={svg.x}
                  cy={svg.y}
                  r={1.65}
                  fill={inside ? "#c7502e" : "rgba(26,21,18,0.16)"}
                  opacity={inside ? 0.8 : 0.42}
                />
              );
            })}

            {activeConstraints.map((constraint, idx) => {
              const segment = lineSegment(constraint);
              if (segment.length !== 2) return null;
              return (
                <line
                  key={`${constraint.label}-${idx}`}
                  x1={segment[0].x}
                  y1={segment[0].y}
                  x2={segment[1].x}
                  y2={segment[1].y}
                  stroke={mode === "union" && idx >= ellipseA.length ? "rgba(26,21,18,0.52)" : "#1a1512"}
                  strokeWidth={mode === "ellipse" || mode === "union" ? 1 : 1.8}
                  strokeDasharray={mode === "ellipse" || mode === "union" ? "4 4" : undefined}
                />
              );
            })}
          </svg>
        </div>

        <div className="space-y-4">
          <div className="bg-background border border-border rounded-sm p-3">
            <div className="font-mono text-[9px] uppercase tracking-widest text-rubric">
              {modeMeta.title}
            </div>
            <p className="font-serif italic text-[13px] text-muted-foreground leading-relaxed mt-2">
              {modeMeta.summary}
            </p>
            <div className="font-mono text-[11px] text-ink mt-3">
              pontos aceitos: <span className="text-rubric">{insideCount}</span>/{points.length}
            </div>
          </div>

          <div className="bg-background border border-border rounded-sm p-3">
            <div className="font-mono text-[9px] uppercase tracking-widest text-ink-fade mb-2">
              rede lógica
            </div>
            {mode === "union" ? (
              <div className="space-y-2 font-mono text-[11px] text-ink">
                <div className="rounded-sm border border-border p-2">Elipse A = AND(t1...t12)</div>
                <div className="rounded-sm border border-border p-2">Elipse B = AND(t1...t12)</div>
                <div className="rounded-sm border border-rubric/50 p-2 text-rubric">
                  saída = {strategy === "correct" ? "A OR B" : "A AND B"}
                </div>
              </div>
            ) : (
              <div className="space-y-2 font-mono text-[11px] text-ink">
                <div className="rounded-sm border border-border p-2">
                  p1...p{constraints.length} = lados corretos
                </div>
                <div className="rounded-sm border border-rubric/50 p-2 text-rubric">
                  saída = AND(p1...p{constraints.length})
                </div>
              </div>
            )}
          </div>

          <div className="bg-background border border-border rounded-sm p-3">
            <div className="font-mono text-[9px] uppercase tracking-widest text-ink-fade mb-2">
              restrições
            </div>
            <div className="space-y-1.5 max-h-32 overflow-auto custom-scrollbar pr-1">
              {(mode === "union" ? ellipseA.slice(0, 4) : constraints.slice(0, 5)).map((constraint, idx) => (
                <div key={`${constraint.label}-${idx}`} className="font-mono text-[10px] text-muted-foreground leading-relaxed">
                  {constraint.label}: {formatConstraint(constraint)}
                </div>
              ))}
              {(mode === "ellipse" || mode === "union") && (
                <div className="font-serif italic text-[12px] text-ink-fade">
                  mostrando amostra; as tangentes restantes seguem o mesmo padrão.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
