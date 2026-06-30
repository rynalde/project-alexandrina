"use client";

import { useMemo, useState } from "react";
import { Box } from "lucide-react";

type Point3 = { x: number; y: number; z: number };
type Point2 = { x: number; y: number };

function dot(a: Point3, b: Point3) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function cross(a: Point3, b: Point3): Point3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function normalize(v: Point3): Point3 {
  const norm = Math.sqrt(dot(v, v));
  return { x: v.x / norm, y: v.y / norm, z: v.z / norm };
}

function add(a: Point3, b: Point3): Point3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function scale(v: Point3, amount: number): Point3 {
  return { x: v.x * amount, y: v.y * amount, z: v.z * amount };
}

function project(point: Point3): Point2 {
  return {
    x: 180 + 35 * (point.x - point.y),
    y: 170 + 19 * (point.x + point.y) - 42 * point.z,
  };
}

function polygonPoints(points: Point3[]) {
  return points.map(project).map((p) => `${p.x},${p.y}`).join(" ");
}

function signed(value: number) {
  return value >= 0 ? `+ ${value.toFixed(2)}` : `- ${Math.abs(value).toFixed(2)}`;
}

export default function PerceptronPlane3D() {
  const [angleDeg, setAngleDeg] = useState(35);
  const [width, setWidth] = useState(1.8);
  const [point, setPoint] = useState<Point3>({ x: 0.6, y: -0.2, z: 0.8 });

  const angle = (angleDeg * Math.PI) / 180;
  const normal = useMemo(
    () => normalize({ x: Math.cos(angle), y: Math.sin(angle), z: 0.65 }),
    [angle]
  );
  const u = useMemo(() => normalize({ x: -Math.sin(angle), y: Math.cos(angle), z: 0 }), [angle]);
  const v = useMemo(() => normalize(cross(normal, u)), [normal, u]);

  const lower = -width / 2;
  const upper = width / 2;
  const signedDistance = dot(normal, point);
  const p1 = signedDistance - lower >= 0 ? 1 : 0;
  const p2 = -signedDistance + upper >= 0 ? 1 : 0;
  const output = p1 && p2 ? 1 : 0;

  const plane = (offset: number) => {
    const center = scale(normal, offset);
    return [
      add(add(center, scale(u, -2.9)), scale(v, -1.8)),
      add(add(center, scale(u, 2.9)), scale(v, -1.8)),
      add(add(center, scale(u, 2.9)), scale(v, 1.8)),
      add(add(center, scale(u, -2.9)), scale(v, 1.8)),
    ];
  };

  const lowerPlane = plane(lower);
  const upperPlane = plane(upper);
  const point2 = project(point);

  return (
    <div className="my-6 bg-card border border-border rounded-sm p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Box size={14} className="text-rubric shrink-0" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-rubric">
          simulação — faixa entre dois planos 3D
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="bg-background border border-border rounded-sm p-3 overflow-hidden">
          <svg viewBox="0 0 360 320" className="w-full max-w-[560px] mx-auto block">
            <line x1="40" y1="260" x2="310" y2="260" stroke="rgba(26,21,18,0.16)" />
            <line x1="180" y1="300" x2="180" y2="35" stroke="rgba(26,21,18,0.16)" />
            <line x1="70" y1="300" x2="300" y2="70" stroke="rgba(26,21,18,0.1)" />

            <polygon
              points={polygonPoints(lowerPlane)}
              fill="rgba(26,21,18,0.08)"
              stroke="rgba(26,21,18,0.45)"
              strokeWidth={1.5}
            />
            <polygon
              points={polygonPoints(upperPlane)}
              fill="rgba(199,80,46,0.16)"
              stroke="#c7502e"
              strokeWidth={1.8}
            />

            {lowerPlane.map((corner, idx) => {
              const a = project(corner);
              const b = project(upperPlane[idx]);
              return (
                <line
                  key={idx}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="rgba(199,80,46,0.38)"
                  strokeDasharray="5 5"
                  className="animate-flow"
                />
              );
            })}

            <circle
              cx={point2.x}
              cy={point2.y}
              r={8}
              fill={output ? "#c7502e" : "#1a1512"}
              className="animate-pulse-slow"
            />
            <circle cx={point2.x} cy={point2.y} r={14} fill="none" stroke="rgba(199,80,46,0.35)" />
            <text x={point2.x + 13} y={point2.y - 10} className="fill-ink font-mono text-[11px]">
              x
            </text>
            <text x="38" y="277" className="fill-ink-fade font-mono text-[10px]">x1</text>
            <text x="298" y="72" className="fill-ink-fade font-mono text-[10px]">x2</text>
            <text x="188" y="43" className="fill-ink-fade font-mono text-[10px]">x3</text>
          </svg>
        </div>

        <div className="space-y-4">
          <div className="bg-background border border-border rounded-sm p-3">
            <div className="font-mono text-[9px] uppercase tracking-widest text-ink-fade mb-2">
              duas condições
            </div>
            <div className="space-y-2 font-mono text-[11px] text-ink">
              <div className="rounded-sm border border-border p-2">
                p1 = step(n·x {signed(-lower)})
                <span className="float-right text-rubric">{p1}</span>
              </div>
              <div className="rounded-sm border border-border p-2">
                p2 = step(-n·x {signed(upper)})
                <span className="float-right text-rubric">{p2}</span>
              </div>
              <div className="rounded-sm border border-rubric/50 p-2 text-rubric">
                saída = p1 AND p2
                <span className="float-right">{output}</span>
              </div>
            </div>
          </div>

          <div className="bg-background border border-border rounded-sm p-3">
            <div className="font-mono text-[9px] uppercase tracking-widest text-ink-fade mb-2">
              normal do plano
            </div>
            <div className="font-mono text-[11px] text-muted-foreground leading-relaxed">
              n = ({normal.x.toFixed(2)}, {normal.y.toFixed(2)}, {normal.z.toFixed(2)})
            </div>
            <div className="font-mono text-[11px] text-ink mt-2">
              n·x = {signedDistance.toFixed(2)}
            </div>
          </div>

          <label className="block">
            <span className="flex justify-between font-mono text-[10px] uppercase tracking-widest text-ink-fade mb-1">
              <span>ângulo</span>
              <span>{angleDeg}°</span>
            </span>
            <input
              type="range"
              min={0}
              max={80}
              step={5}
              value={angleDeg}
              onChange={(event) => setAngleDeg(Number(event.target.value))}
              className="w-full accent-rubric"
            />
          </label>

          <label className="block">
            <span className="flex justify-between font-mono text-[10px] uppercase tracking-widest text-ink-fade mb-1">
              <span>distância entre planos</span>
              <span>{width.toFixed(1)}</span>
            </span>
            <input
              type="range"
              min={0.8}
              max={3}
              step={0.2}
              value={width}
              onChange={(event) => setWidth(Number(event.target.value))}
              className="w-full accent-rubric"
            />
          </label>

          {[
            ["x1", point.x, (value: number) => setPoint((p) => ({ ...p, x: value }))],
            ["x2", point.y, (value: number) => setPoint((p) => ({ ...p, y: value }))],
            ["x3", point.z, (value: number) => setPoint((p) => ({ ...p, z: value }))],
          ].map(([label, value, setter]) => (
            <label key={label as string} className="block">
              <span className="flex justify-between font-mono text-[10px] uppercase tracking-widest text-ink-fade mb-1">
                <span>{label as string}</span>
                <span>{(value as number).toFixed(1)}</span>
              </span>
              <input
                type="range"
                min={-2.5}
                max={2.5}
                step={0.1}
                value={value as number}
                onChange={(event) => (setter as (v: number) => void)(Number(event.target.value))}
                className="w-full accent-rubric"
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
