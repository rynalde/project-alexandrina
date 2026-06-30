"use client";

import { useState } from "react";
import { Play } from "lucide-react";

const SOURCE = ["the", "black", "cat", "sat", "on", "the", "mat"];
const TARGET = ["o", "gato", "preto", "sentou", "no", "tapete"];

const ATTENTION: number[][] = [
  [0.78, 0.05, 0.05, 0.02, 0.02, 0.06, 0.02],
  [0.05, 0.1, 0.75, 0.04, 0.02, 0.02, 0.02],
  [0.04, 0.78, 0.1, 0.02, 0.02, 0.02, 0.02],
  [0.02, 0.02, 0.05, 0.82, 0.04, 0.02, 0.03],
  [0.02, 0.02, 0.02, 0.1, 0.7, 0.06, 0.08],
  [0.02, 0.02, 0.02, 0.02, 0.05, 0.08, 0.79],
];

export default function AttentionHeatmap() {
  const [selected, setSelected] = useState(0);

  return (
    <div className="my-6 bg-card border border-border rounded-sm p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Play size={14} className="text-rubric shrink-0" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-rubric">
          Mapa de calor — pesos de atenção
        </span>
      </div>

      <p className="font-mono text-[10px] sm:text-[11px] text-ink-fade mb-3 text-center">
        toque um token de saída para ver onde a atenção foca na entrada
      </p>

      {/* Target token selector */}
      <div className="bg-background border border-border rounded-sm p-3 mb-4">
        <div className="font-mono text-[9px] uppercase tracking-widest text-ink-fade mb-2">
          target (português)
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TARGET.map((tok, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`px-2.5 py-1.5 rounded-sm font-mono text-[12px] sm:text-[13px] transition border ${
                i === selected
                  ? "bg-ink text-paper border-transparent"
                  : "bg-background border-border text-ink hover:border-rubric/30"
              }`}
            >
              {tok}
            </button>
          ))}
        </div>
      </div>

      {/* Weight bars */}
      <div className="bg-background border border-border rounded-sm p-3 mb-4">
        <div className="font-mono text-[9px] uppercase tracking-widest text-ink-fade mb-2">
          source (inglês) — atenção ao gerar &ldquo;{TARGET[selected]}&rdquo;
        </div>
        <div className="space-y-1.5">
          {SOURCE.map((tok, j) => {
            const w = ATTENTION[selected][j];
            return (
              <div key={j} className="flex items-center gap-2 sm:gap-3">
                <span className="font-mono text-[11px] sm:text-[12px] text-ink w-12 sm:w-16 truncate">
                  {tok}
                </span>
                <div className="flex-1 bg-card border border-border rounded-sm h-5 sm:h-6 overflow-hidden">
                  <div
                    className="h-full flex items-center justify-end pr-2 transition-all duration-500"
                    style={{
                      width: `${w * 100}%`,
                      background: "#c7502e",
                      opacity: 0.4 + w * 0.6,
                    }}
                  >
                    {w > 0.15 && (
                      <span className="font-mono text-[10px] text-paper">
                        α={w.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
                {w <= 0.15 && (
                  <span className="font-mono text-[10px] text-ink-fade w-12 text-right">
                    {w.toFixed(2)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Full matrix */}
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="font-mono text-[9px] uppercase tracking-widest text-ink-fade mb-2 px-4 sm:px-0">
          matriz completa
        </div>
        <div className="inline-block px-4 sm:px-0">
          <div className="flex">
            <div className="w-16 sm:w-20" />
            {SOURCE.map((w, j) => (
              <div
                key={j}
                className="w-12 sm:w-14 font-mono text-[9px] sm:text-[10px] text-muted-foreground text-center pb-1 truncate"
              >
                {w}
              </div>
            ))}
          </div>
          {ATTENTION.map((row, i) => (
            <div key={i} className="flex">
              <div className="w-16 sm:w-20 font-mono text-[10px] sm:text-[11px] text-ink pr-2 flex items-center justify-end truncate">
                {TARGET[i]}
              </div>
              {row.map((v, j) => (
                <div
                  key={j}
                  onClick={() => setSelected(i)}
                  className={`w-12 h-8 sm:w-14 sm:h-9 border border-border flex items-center justify-center font-mono text-[9px] sm:text-[10px] cursor-pointer transition ${
                    i === selected ? "ring-2 ring-rubric ring-inset" : ""
                  }`}
                  style={{
                    background: `rgba(199, 80, 46, ${v * 0.85})`,
                    color: v > 0.4 ? "#f5efe3" : "rgba(26,21,18,0.6)",
                  }}
                >
                  {v > 0.05 ? v.toFixed(2) : ""}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <p className="mt-5 font-serif italic text-[12px] sm:text-[13px] text-muted-foreground border-t border-border pt-3">
        Note como, ao gerar &ldquo;<span className="text-rubric">preto</span>&rdquo;, o
        modelo presta atenção em &ldquo;<span className="text-rubric">black</span>&rdquo;.{" "}
        <span className="bg-rubric/15 px-1">Cada linha soma 1</span> — são distribuições de
        atenção.
      </p>
    </div>
  );
}
