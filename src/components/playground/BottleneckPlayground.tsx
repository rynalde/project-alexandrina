"use client";

import { useState } from "react";
import { Play } from "lucide-react";

const VECTOR_DIM = 6;

export default function BottleneckPlayground() {
  const [seqLen, setSeqLen] = useState(8);

  const status =
    seqLen <= 5
      ? "tranquilo"
      : seqLen <= 10
      ? "razoável"
      : seqLen <= 15
      ? "apertado"
      : "crítico";

  const statusColor =
    seqLen > 10 ? "text-rubric" : "text-[#5c8c5c]";
  const barColor = seqLen > 10 ? "#c7502e" : "#5c8c5c";

  return (
    <div className="my-6 bg-card border border-border rounded-sm p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Play size={14} className="text-rubric shrink-0" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-rubric">
          Visualização — gargalo do vetor único
        </span>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 mb-5 flex-wrap">
        <span className="font-mono text-[11px] text-muted-foreground">
          tamanho da sequência =
        </span>
        <input
          type="range"
          min={2}
          max={20}
          value={seqLen}
          onChange={(e) => setSeqLen(Number(e.target.value))}
          className="flex-1 accent-rubric min-w-[120px]"
        />
        <span className="font-serif text-2xl text-ink w-8 text-center">
          {seqLen}
        </span>
      </div>

      <div className="bg-background border border-border rounded-sm p-4">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 items-center">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-ink-fade mb-2">
              entrada — {seqLen} tokens
            </div>
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: seqLen }).map((_, i) => (
                <div
                  key={i}
                  className="w-6 h-6 border border-border rounded-sm"
                  style={{
                    background: `rgba(199, 80, 46, ${0.3 + (i / seqLen) * 0.5})`,
                  }}
                />
              ))}
            </div>
            <div className="font-mono text-[10px] text-ink-fade mt-2">
              {seqLen} × dim_embedding
            </div>
          </div>

          <div className="flex items-center justify-center py-2">
            <svg
              viewBox="0 0 80 60"
              className="w-full sm:w-20 max-w-[80px]"
              preserveAspectRatio="xMidYMid meet"
            >
              <path
                d="M 5 5 L 75 5 L 50 30 L 50 55 L 30 55 L 30 30 Z"
                fill="rgba(199,80,46,0.15)"
                stroke="#c7502e"
                strokeWidth="1.5"
              />
              <text
                x="40"
                y="20"
                textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
                fontSize="8"
                fill="#c7502e"
              >
                comprime
              </text>
            </svg>
          </div>

          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-ink-fade mb-2">
              context — {VECTOR_DIM} dim fixas
            </div>
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: VECTOR_DIM }).map((_, i) => (
                <div
                  key={i}
                  className="w-6 h-6 border border-border rounded-sm"
                  style={{
                    background: `rgba(199, 80, 46, ${0.4 + ((i * 0.1) % 0.4)})`,
                  }}
                />
              ))}
            </div>
            <div className="font-mono text-[10px] text-ink-fade mt-2">
              {VECTOR_DIM} × 1 (sempre)
            </div>
          </div>
        </div>

        <div className="mt-5 bg-card rounded-sm p-3 border border-border">
          <div className="font-mono text-[10px] uppercase tracking-widest text-rubric mb-1">
            taxa de compressão
          </div>
          <div className="flex items-center gap-3">
            <div className="font-serif text-2xl sm:text-3xl text-ink">
              {seqLen} → {VECTOR_DIM}
            </div>
            <div className="flex-1 h-3 bg-background border border-border rounded-sm overflow-hidden">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (seqLen / VECTOR_DIM) * 50)}%`,
                  background: barColor,
                }}
              />
            </div>
            <div className={`font-mono text-[12px] ${statusColor}`}>
              {status}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-5 font-serif italic text-[12px] sm:text-[13px] text-muted-foreground border-t border-border pt-3">
        A capacidade do context vector{" "}
        <span className="text-rubric">não cresce</span> com a entrada. Quanto
        maior a sequência, mais informação é forçada a caber no mesmo número de
        dimensões. Daí o gargalo.
      </p>
    </div>
  );
}
