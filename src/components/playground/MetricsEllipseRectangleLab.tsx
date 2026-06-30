"use client";

import { useMemo, useState } from "react";
import { evaluate, round } from "mathjs";
import { AnimatePresence, motion } from "motion/react";
import { BarChart3, RotateCcw } from "lucide-react";

type Point = { x: number; y: number };
type CountKey = "PV" | "PF" | "NV" | "NF";

const WIDTH = 380;
const HEIGHT = 300;
const PAD = 28;
const EXTENT_X = 4.5;
const EXTENT_Y = 3.2;
const PLOT_W = WIDTH - PAD * 2;
const PLOT_H = HEIGHT - PAD * 2;

const PRESETS = {
  balanced: {
    label: "equilibrado",
    rectW: 4.8,
    rectH: 2.3,
    rectX: 0,
    rectY: 0,
    note: "Mostra os quatro grupos: acertos, falsos positivos e falsos negativos.",
  },
  wide: {
    label: "retângulo grande",
    rectW: 5.4,
    rectH: 2.8,
    rectX: 0,
    rectY: 0,
    note: "Aumenta recall, mas traz mais falsos positivos.",
  },
  tight: {
    label: "conservador",
    rectW: 3.0,
    rectH: 1.55,
    rectX: 0,
    rectY: 0,
    note: "Aumenta precision, mas deixa partes da elipse de fora.",
  },
  shifted: {
    label: "deslocado",
    rectW: 4.0,
    rectH: 2.0,
    rectX: 0.75,
    rectY: -0.35,
    note: "Cria falsos positivos de um lado e falsos negativos do outro.",
  },
};

const LEGEND: Record<
  CountKey,
  { label: string; description: string; color: string; bg: string }
> = {
  PV: {
    label: "PV / TP",
    description: "dentro da elipse e classificado como dentro",
    color: "#5c8c5c",
    bg: "rgba(92,140,92,0.16)",
  },
  PF: {
    label: "PF / FP",
    description: "fora da elipse, mas classificado como dentro",
    color: "#c7502e",
    bg: "rgba(199,80,46,0.17)",
  },
  NV: {
    label: "NV / TN",
    description: "fora da elipse e classificado como fora",
    color: "rgba(26,21,18,0.32)",
    bg: "rgba(26,21,18,0.08)",
  },
  NF: {
    label: "NF / FN",
    description: "dentro da elipse, mas classificado como fora",
    color: "#9d7a2f",
    bg: "rgba(157,122,47,0.16)",
  },
};

function toSvg(point: Point) {
  return {
    x: PAD + ((point.x + EXTENT_X) / (EXTENT_X * 2)) * PLOT_W,
    y: PAD + ((EXTENT_Y - point.y) / (EXTENT_Y * 2)) * PLOT_H,
  };
}

function toSvgX(x: number) {
  return PAD + ((x + EXTENT_X) / (EXTENT_X * 2)) * PLOT_W;
}

function toSvgY(y: number) {
  return PAD + ((EXTENT_Y - y) / (EXTENT_Y * 2)) * PLOT_H;
}

function metric(expr: string, scope: Record<string, number>) {
  const value = Number(evaluate(expr, scope));
  if (!Number.isFinite(value)) return 0;
  return Number(round(value, 3));
}

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export default function MetricsEllipseRectangleLab() {
  const [rectW, setRectW] = useState(PRESETS.balanced.rectW);
  const [rectH, setRectH] = useState(PRESETS.balanced.rectH);
  const [rectX, setRectX] = useState(PRESETS.balanced.rectX);
  const [rectY, setRectY] = useState(PRESETS.balanced.rectY);
  const [activePreset, setActivePreset] = useState<keyof typeof PRESETS>("balanced");
  const ellipseRx = 2.65;
  const ellipseRy = 1.65;

  const points = useMemo(() => {
    const xs = Array.from({ length: 31 }, (_, idx) => -4.2 + idx * 0.28);
    const ys = Array.from({ length: 23 }, (_, idx) => -2.8 + idx * 0.25);
    return xs.flatMap((x) => ys.map((y) => ({ x, y })));
  }, []);

  const classified = useMemo(() => {
    const counts: Record<CountKey, number> = { PV: 0, PF: 0, NV: 0, NF: 0 };

    const rows = points.map((point) => {
      const inEllipse =
        ((point.x / ellipseRx) ** 2 + (point.y / ellipseRy) ** 2) <= 1;
      const inRectangle =
        Math.abs(point.x - rectX) <= rectW / 2 &&
        Math.abs(point.y - rectY) <= rectH / 2;

      const kind: CountKey =
        inEllipse && inRectangle
          ? "PV"
          : !inEllipse && inRectangle
            ? "PF"
            : !inEllipse && !inRectangle
              ? "NV"
              : "NF";

      counts[kind] += 1;
      return { ...point, inEllipse, inRectangle, kind };
    });

    const scope = {
      PV: counts.PV,
      PF: counts.PF,
      NV: counts.NV,
      NF: counts.NF,
      total: points.length,
    };

    return {
      rows,
      counts,
      total: points.length,
      metrics: {
        accuracy: metric("(PV + NV) / total", scope),
        precision: metric("PV / (PV + PF)", scope),
        recall: metric("PV / (PV + NF)", scope),
      },
    };
  }, [ellipseRx, ellipseRy, points, rectH, rectW, rectX, rectY]);

  const rectSvg = {
    left: toSvgX(rectX - rectW / 2),
    right: toSvgX(rectX + rectW / 2),
    top: toSvgY(rectY + rectH / 2),
    bottom: toSvgY(rectY - rectH / 2),
  };
  const ellipseCenter = toSvg({ x: 0, y: 0 });

  const applyPreset = (key: keyof typeof PRESETS) => {
    const preset = PRESETS[key];
    setActivePreset(key);
    setRectW(preset.rectW);
    setRectH(preset.rectH);
    setRectX(preset.rectX);
    setRectY(preset.rectY);
  };

  const reset = () => applyPreset("balanced");

  return (
    <div className="my-6 bg-card border border-border rounded-sm p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex min-w-0 items-start gap-2">
          <BarChart3 size={14} className="text-rubric shrink-0" />
          <span className="min-w-0 font-mono text-[10px] uppercase tracking-widest text-rubric leading-relaxed break-words">
            simulador — elipse real vs retângulo previsto
          </span>
        </div>
        <button
          type="button"
          onClick={reset}
          className="h-9 w-9 rounded-sm border border-border bg-background text-ink-fade hover:text-rubric transition inline-flex items-center justify-center"
          aria-label="Repor simulador"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_270px]">
        <div className="space-y-4">
          <div className="bg-background border border-border rounded-sm p-3 overflow-hidden">
            <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full max-w-[620px] mx-auto block">
              <rect x={PAD} y={PAD} width={PLOT_W} height={PLOT_H} fill="rgba(245,239,227,0.74)" />

              {Array.from({ length: 10 }, (_, idx) => {
                const x = PAD + (idx / 9) * PLOT_W;
                return (
                  <line
                    key={`vx-${idx}`}
                    x1={x}
                    y1={PAD}
                    x2={x}
                    y2={HEIGHT - PAD}
                    stroke="rgba(26,21,18,0.07)"
                  />
                );
              })}
              {Array.from({ length: 8 }, (_, idx) => {
                const y = PAD + (idx / 7) * PLOT_H;
                return (
                  <line
                    key={`hy-${idx}`}
                    x1={PAD}
                    y1={y}
                    x2={WIDTH - PAD}
                    y2={y}
                    stroke="rgba(26,21,18,0.07)"
                  />
                );
              })}

              <motion.ellipse
                cx={ellipseCenter.x}
                cy={ellipseCenter.y}
                rx={(ellipseRx / (EXTENT_X * 2)) * PLOT_W}
                ry={(ellipseRy / (EXTENT_Y * 2)) * PLOT_H}
                fill="rgba(92,140,92,0.08)"
                stroke="#5c8c5c"
                strokeWidth={2}
                initial={false}
                animate={{ opacity: 1 }}
              />

              <rect
                x={rectSvg.left}
                y={rectSvg.top}
                width={rectSvg.right - rectSvg.left}
                height={rectSvg.bottom - rectSvg.top}
                fill="rgba(199,80,46,0.09)"
                stroke="#c7502e"
                strokeWidth={2}
                strokeDasharray="7 5"
              />

              {classified.rows.map((point) => {
                const svg = toSvg(point);
                const meta = LEGEND[point.kind];
                return (
                  <motion.circle
                    key={`${point.x.toFixed(2)}-${point.y.toFixed(2)}`}
                    cx={svg.x}
                    cy={svg.y}
                    r={point.kind === "NV" ? 1.9 : 2.6}
                    fill={meta.color}
                    initial={false}
                    animate={{ fill: meta.color, opacity: point.kind === "NV" ? 0.45 : 0.9, scale: 1 }}
                    transition={{ duration: 0.22 }}
                  />
                );
              })}

              <rect
                x={ellipseCenter.x - 43}
                y={ellipseCenter.y - 83}
                width={86}
                height={18}
                rx={2}
                fill="rgba(245,239,227,0.82)"
              />
              <text
                x={ellipseCenter.x - 35}
                y={ellipseCenter.y - 70}
                className="fill-ink font-mono text-[10px]"
              >
                elipse real
              </text>
              <rect
                x={Math.max(PAD + 3, rectSvg.left)}
                y={Math.max(PAD + 4, rectSvg.top - 20)}
                width={116}
                height={18}
                rx={2}
                fill="rgba(245,239,227,0.86)"
              />
              <text
                x={Math.max(PAD + 8, rectSvg.left + 5)}
                y={Math.max(PAD + 17, rectSvg.top - 7)}
                className="fill-rubric font-mono text-[10px]"
              >
                retângulo previsto
              </text>
            </svg>
          </div>

          <div className="grid gap-2 sm:grid-cols-4">
            {(Object.keys(LEGEND) as CountKey[]).map((key) => (
              <motion.div
                key={key}
                className="rounded-sm border border-border bg-background p-3"
                animate={{ backgroundColor: LEGEND[key].bg }}
                transition={{ duration: 0.25 }}
              >
                <div className="font-mono text-[10px] uppercase tracking-widest" style={{ color: LEGEND[key].color }}>
                  {LEGEND[key].label}
                </div>
                <div className="font-serif text-3xl text-ink mt-1">{classified.counts[key]}</div>
                <p className="font-sans text-[12px] leading-snug text-muted-foreground mt-1">
                  {LEGEND[key].description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(PRESETS) as Array<keyof typeof PRESETS>).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => applyPreset(key)}
                className={`min-h-10 rounded-sm border px-3 py-2 font-mono text-[10px] uppercase tracking-widest transition ${
                  activePreset === key
                    ? "border-rubric bg-rubric/10 text-rubric"
                    : "border-border bg-background text-ink-fade hover:text-ink"
                }`}
              >
                {PRESETS[key].label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activePreset}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="bg-background border border-border rounded-sm p-3"
            >
              <div className="font-mono text-[9px] uppercase tracking-widest text-ink-fade mb-1">
                leitura
              </div>
              <p className="font-serif italic text-[13px] text-muted-foreground leading-relaxed">
                {PRESETS[activePreset].note}
              </p>
            </motion.div>
          </AnimatePresence>

          <MetricBars
            accuracy={classified.metrics.accuracy}
            precision={classified.metrics.precision}
            recall={classified.metrics.recall}
          />

          <div className="space-y-3">
            <Slider label="largura" value={rectW} min={1.6} max={6.4} step={0.1} onChange={setRectW} />
            <Slider label="altura" value={rectH} min={0.9} max={3.4} step={0.1} onChange={setRectH} />
            <Slider label="deslocamento x" value={rectX} min={-1.4} max={1.4} step={0.1} onChange={setRectX} />
            <Slider label="deslocamento y" value={rectY} min={-1} max={1} step={0.1} onChange={setRectY} />
          </div>

          <div className="bg-background border border-border rounded-sm p-3">
            <div className="font-mono text-[9px] uppercase tracking-widest text-ink-fade mb-2">
              fórmulas calculadas com mathjs
            </div>
            <div className="space-y-1.5 font-mono text-[11px] text-muted-foreground">
              <div>accuracy = (PV + NV) / total</div>
              <div>precision = PV / (PV + PF)</div>
              <div>recall = PV / (PV + NF)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricBars({
  accuracy,
  precision,
  recall,
}: {
  accuracy: number;
  precision: number;
  recall: number;
}) {
  const metrics = [
    { label: "accuracy", value: accuracy },
    { label: "precision", value: precision },
    { label: "recall", value: recall },
  ];

  return (
    <div className="bg-background border border-border rounded-sm p-3">
      <div className="font-mono text-[9px] uppercase tracking-widest text-ink-fade mb-3">
        métricas
      </div>
      <div className="space-y-3">
        {metrics.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between gap-3 mb-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-ink">
                {item.label}
              </span>
              <span className="font-serif text-lg text-rubric">{percent(item.value)}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-sm border border-border bg-card">
              <motion.div
                className="h-full bg-rubric"
                initial={false}
                animate={{ width: `${item.value * 100}%` }}
                transition={{ type: "spring", stiffness: 130, damping: 22 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex justify-between font-mono text-[10px] uppercase tracking-widest text-ink-fade mb-1">
        <span>{label}</span>
        <span>{value.toFixed(1)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-rubric"
      />
    </label>
  );
}
