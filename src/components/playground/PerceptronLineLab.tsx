"use client";

import { useMemo, useState } from "react";
import { RotateCcw, SlidersHorizontal } from "lucide-react";

type Point = { x: number; y: number };

const EXTENT = 5;
const SIZE = 320;
const PAD = 28;
const PLOT = SIZE - PAD * 2;

function score(point: Point, w1: number, w2: number, b: number) {
  return w1 * point.x + w2 * point.y + b;
}

function toSvg(point: Point) {
  return {
    x: PAD + ((point.x + EXTENT) / (EXTENT * 2)) * PLOT,
    y: PAD + ((EXTENT - point.y) / (EXTENT * 2)) * PLOT,
  };
}

function clipHalfPlane(w1: number, w2: number, b: number) {
  const corners: Point[] = [
    { x: -EXTENT, y: -EXTENT },
    { x: EXTENT, y: -EXTENT },
    { x: EXTENT, y: EXTENT },
    { x: -EXTENT, y: EXTENT },
  ];

  const clipped: Point[] = [];
  for (let i = 0; i < corners.length; i++) {
    const current = corners[i];
    const next = corners[(i + 1) % corners.length];
    const currentScore = score(current, w1, w2, b);
    const nextScore = score(next, w1, w2, b);
    const currentInside = currentScore >= 0;
    const nextInside = nextScore >= 0;

    if (currentInside && nextInside) {
      clipped.push(next);
    } else if (currentInside && !nextInside) {
      const t = currentScore / (currentScore - nextScore);
      clipped.push({
        x: current.x + (next.x - current.x) * t,
        y: current.y + (next.y - current.y) * t,
      });
    } else if (!currentInside && nextInside) {
      const t = currentScore / (currentScore - nextScore);
      clipped.push({
        x: current.x + (next.x - current.x) * t,
        y: current.y + (next.y - current.y) * t,
      });
      clipped.push(next);
    }
  }

  return clipped;
}

function lineSegment(w1: number, w2: number, b: number) {
  const candidates: Point[] = [];

  if (Math.abs(w2) > 0.001) {
    for (const x of [-EXTENT, EXTENT]) {
      const y = -(w1 * x + b) / w2;
      if (y >= -EXTENT && y <= EXTENT) candidates.push({ x, y });
    }
  }

  if (Math.abs(w1) > 0.001) {
    for (const y of [-EXTENT, EXTENT]) {
      const x = -(w2 * y + b) / w1;
      if (x >= -EXTENT && x <= EXTENT) candidates.push({ x, y });
    }
  }

  const unique = candidates.filter(
    (point, idx) =>
      candidates.findIndex(
        (other) =>
          Math.abs(other.x - point.x) < 0.001 &&
          Math.abs(other.y - point.y) < 0.001
      ) === idx
  );

  return unique.slice(0, 2);
}

function signed(value: number) {
  if (value > 0) return `+${value.toFixed(1)}`;
  return value.toFixed(1);
}

export default function PerceptronLineLab() {
  const [w1, setW1] = useState(1.5);
  const [w2, setW2] = useState(-1);
  const [b, setB] = useState(0.5);
  const [flipped, setFlipped] = useState(false);
  const [point, setPoint] = useState<Point>({ x: 2, y: 1 });

  const sign = flipped ? -1 : 1;
  const dw1 = w1 * sign;
  const dw2 = w2 * sign;
  const db = b * sign;
  const z = score(point, dw1, dw2, db);
  const output = z >= 0 ? 1 : 0;

  const positivePolygon = useMemo(
    () => clipHalfPlane(dw1, dw2, db).map(toSvg),
    [dw1, dw2, db]
  );

  const segment = useMemo(() => lineSegment(dw1, dw2, db).map(toSvg), [dw1, dw2, db]);
  const sampleSvg = toSvg(point);

  const reset = () => {
    setW1(1.5);
    setW2(-1);
    setB(0.5);
    setFlipped(false);
    setPoint({ x: 2, y: 1 });
  };

  return (
    <div className="my-6 bg-card border border-border rounded-sm p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-rubric shrink-0" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-rubric">
            laboratório — reta e lado positivo
          </span>
        </div>
        <button
          type="button"
          onClick={reset}
          className="h-9 w-9 rounded-sm border border-border bg-background text-ink-fade hover:text-rubric transition inline-flex items-center justify-center"
          aria-label="Repor valores"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="bg-background border border-border rounded-sm p-3">
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[420px] mx-auto block">
            <rect x={PAD} y={PAD} width={PLOT} height={PLOT} fill="rgba(245,239,227,0.75)" />
            {Array.from({ length: 11 }, (_, i) => {
              const v = -EXTENT + i;
              const startX = toSvg({ x: v, y: -EXTENT });
              const endX = toSvg({ x: v, y: EXTENT });
              const startY = toSvg({ x: -EXTENT, y: v });
              const endY = toSvg({ x: EXTENT, y: v });
              return (
                <g key={v}>
                  <line
                    x1={startX.x}
                    y1={startX.y}
                    x2={endX.x}
                    y2={endX.y}
                    stroke="rgba(26,21,18,0.08)"
                  />
                  <line
                    x1={startY.x}
                    y1={startY.y}
                    x2={endY.x}
                    y2={endY.y}
                    stroke="rgba(26,21,18,0.08)"
                  />
                </g>
              );
            })}
            <line
              x1={PAD}
              y1={SIZE / 2}
              x2={SIZE - PAD}
              y2={SIZE / 2}
              stroke="rgba(26,21,18,0.22)"
            />
            <line
              x1={SIZE / 2}
              y1={PAD}
              x2={SIZE / 2}
              y2={SIZE - PAD}
              stroke="rgba(26,21,18,0.22)"
            />

            {positivePolygon.length > 1 && (
              <polygon
                points={positivePolygon.map((p) => `${p.x},${p.y}`).join(" ")}
                fill="rgba(199,80,46,0.18)"
              />
            )}

            {segment.length === 2 && (
              <line
                x1={segment[0].x}
                y1={segment[0].y}
                x2={segment[1].x}
                y2={segment[1].y}
                stroke="#1a1512"
                strokeWidth={2.2}
                className="animate-flow"
              />
            )}

            <circle
              cx={sampleSvg.x}
              cy={sampleSvg.y}
              r={7}
              fill={output ? "#c7502e" : "#1a1512"}
              className="animate-pulse-slow"
            />
            <circle cx={sampleSvg.x} cy={sampleSvg.y} r={12} fill="none" stroke="rgba(199,80,46,0.35)" />
            <text x={sampleSvg.x + 12} y={sampleSvg.y - 10} className="fill-ink font-mono text-[11px]">
              x
            </text>
          </svg>
        </div>

        <div className="space-y-4">
          <div className="bg-background border border-border rounded-sm p-3">
            <div className="font-mono text-[9px] uppercase tracking-widest text-ink-fade mb-2">
              equação ativa
            </div>
            <div className="font-mono text-[12px] leading-relaxed text-ink">
              {dw1.toFixed(1)}*x1 {signed(dw2)}*x2 {signed(db)} = 0
            </div>
            <div className="font-serif italic text-[13px] text-muted-foreground mt-2">
              saída 1 quando {"w·x + b >= 0"}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setFlipped((value) => !value)}
            className="w-full min-h-11 rounded-sm border border-rubric/40 bg-background px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-rubric hover:bg-rubric/10 transition"
          >
            trocar sinal dos pesos
          </button>

          {[
            ["w1", w1, setW1],
            ["w2", w2, setW2],
            ["b", b, setB],
          ].map(([label, value, setter]) => (
            <label key={label as string} className="block">
              <span className="flex justify-between font-mono text-[10px] uppercase tracking-widest text-ink-fade mb-1">
                <span>{label as string}</span>
                <span>{(value as number).toFixed(1)}</span>
              </span>
              <input
                type="range"
                min={-4}
                max={4}
                step={0.5}
                value={value as number}
                onChange={(event) => (setter as (v: number) => void)(Number(event.target.value))}
                className="w-full accent-rubric"
              />
            </label>
          ))}

          <div className="grid grid-cols-2 gap-3">
            {[
              ["x1", point.x, (value: number) => setPoint((p) => ({ ...p, x: value }))],
              ["x2", point.y, (value: number) => setPoint((p) => ({ ...p, y: value }))],
            ].map(([label, value, setter]) => (
              <label key={label as string} className="block">
                <span className="flex justify-between font-mono text-[10px] uppercase tracking-widest text-ink-fade mb-1">
                  <span>{label as string}</span>
                  <span>{(value as number).toFixed(1)}</span>
                </span>
                <input
                  type="range"
                  min={-4}
                  max={4}
                  step={0.5}
                  value={value as number}
                  onChange={(event) => (setter as (v: number) => void)(Number(event.target.value))}
                  className="w-full accent-rubric"
                />
              </label>
            ))}
          </div>

          <div className="bg-background border border-border rounded-sm p-3">
            <div className="font-mono text-[9px] uppercase tracking-widest text-ink-fade">
              ponto-teste
            </div>
            <div className="font-serif text-2xl text-ink mt-1">
              y = {output}
            </div>
            <div className="font-mono text-[11px] text-muted-foreground mt-1">
              z = {z.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
