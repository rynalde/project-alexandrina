"use client";

import { useState } from "react";
import { Play } from "lucide-react";

const TOKENS = ["The", "cat", "that", "I", "saw", "ran"];

// Each head focuses on a different relation pattern.
const HEADS: { label: string; description: string; matrix: number[][] }[] = [
  {
    label: "head 1 · adjacência",
    description: "Foco em vizinhos imediatos — relações locais.",
    matrix: [
      [0.50, 0.40, 0.04, 0.02, 0.02, 0.02],
      [0.32, 0.40, 0.20, 0.04, 0.02, 0.02],
      [0.04, 0.30, 0.40, 0.20, 0.04, 0.02],
      [0.02, 0.04, 0.20, 0.40, 0.30, 0.04],
      [0.02, 0.02, 0.04, 0.30, 0.40, 0.22],
      [0.02, 0.02, 0.04, 0.10, 0.32, 0.50],
    ],
  },
  {
    label: "head 2 · sujeito-verbo",
    description: '"ran" alinha com "cat"; "saw" com "I" — dependências de longa distância.',
    matrix: [
      [0.60, 0.30, 0.02, 0.02, 0.02, 0.04],
      [0.20, 0.55, 0.05, 0.05, 0.05, 0.10],
      [0.10, 0.50, 0.20, 0.05, 0.05, 0.10],
      [0.05, 0.05, 0.05, 0.50, 0.30, 0.05],
      [0.05, 0.05, 0.05, 0.65, 0.15, 0.05],
      [0.05, 0.65, 0.05, 0.05, 0.10, 0.10],
    ],
  },
  {
    label: "head 3 · co-referência",
    description: '"that" como pronome relativo aponta para "cat".',
    matrix: [
      [0.40, 0.40, 0.05, 0.05, 0.05, 0.05],
      [0.30, 0.40, 0.20, 0.05, 0.03, 0.02],
      [0.05, 0.65, 0.20, 0.05, 0.03, 0.02],
      [0.05, 0.10, 0.05, 0.50, 0.20, 0.10],
      [0.05, 0.10, 0.05, 0.30, 0.40, 0.10],
      [0.05, 0.55, 0.05, 0.05, 0.20, 0.10],
    ],
  },
  {
    label: "head 4 · posicional",
    description: "Distribuição relativamente uniforme — captura contexto geral.",
    matrix: [
      [0.20, 0.18, 0.16, 0.16, 0.16, 0.14],
      [0.18, 0.20, 0.18, 0.16, 0.14, 0.14],
      [0.16, 0.18, 0.20, 0.18, 0.14, 0.14],
      [0.14, 0.16, 0.18, 0.20, 0.18, 0.14],
      [0.14, 0.14, 0.16, 0.18, 0.20, 0.18],
      [0.14, 0.14, 0.14, 0.16, 0.18, 0.24],
    ],
  },
];

export default function MultiHeadAttention() {
  const [active, setActive] = useState(0);
  const head = HEADS[active];

  return (
    <div className="my-6 bg-card border border-border rounded-sm p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Play size={14} className="text-rubric shrink-0" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-rubric flex-1">
          Multi-Head Attention — cada cabeça, um foco
        </span>
      </div>

      {/* Head selector */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {HEADS.map((h, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`px-3 py-1.5 rounded-sm font-mono text-[11px] transition border ${
              active === i
                ? "bg-ink text-paper border-transparent"
                : "bg-background border-border text-ink hover:border-rubric/30"
            }`}
          >
            head {i + 1}
          </button>
        ))}
      </div>

      <div className="bg-background border border-border rounded-sm p-3 mb-4">
        <div className="font-mono text-[10px] uppercase tracking-widest text-rubric">
          {head.label}
        </div>
        <div className="font-serif italic text-[12px] sm:text-[13px] text-muted-foreground mt-1">
          {head.description}
        </div>
      </div>

      {/* Heatmap of selected head */}
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block px-4 sm:px-0">
          <div className="flex">
            <div className="w-16 sm:w-20" />
            {TOKENS.map((w, j) => (
              <div
                key={j}
                className="w-12 sm:w-14 font-mono text-[9px] sm:text-[10px] text-muted-foreground text-center pb-1 truncate"
              >
                {w}
              </div>
            ))}
          </div>
          {head.matrix.map((row, i) => (
            <div key={i} className="flex">
              <div className="w-16 sm:w-20 font-mono text-[10px] sm:text-[11px] text-ink pr-2 flex items-center justify-end truncate">
                {TOKENS[i]}
              </div>
              {row.map((v, j) => (
                <div
                  key={j}
                  className="w-12 h-8 sm:w-14 sm:h-9 border border-border flex items-center justify-center font-mono text-[9px] sm:text-[10px] transition"
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

      {/* Concat + projection illustration */}
      <div className="mt-5 bg-background border border-border rounded-sm p-3 sm:p-4">
        <div className="font-mono text-[10px] uppercase tracking-widest text-rubric mb-2">
          após h cabeças
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {HEADS.map((_, i) => (
            <div
              key={i}
              className="font-mono text-[10px] bg-card border border-border rounded-sm px-2 py-1 text-ink"
            >
              head_{i + 1}
            </div>
          ))}
          <span className="font-mono text-[10px] text-ink-fade">→</span>
          <div className="font-mono text-[10px] bg-card border border-border rounded-sm px-2 py-1 text-ink">
            Concat
          </div>
          <span className="font-mono text-[10px] text-ink-fade">×</span>
          <div className="font-mono text-[10px] bg-card border border-border rounded-sm px-2 py-1 text-ink">
            W_O
          </div>
          <span className="font-mono text-[10px] text-ink-fade">→</span>
          <div className="font-mono text-[10px] bg-rubric text-paper rounded-sm px-2 py-1">
            output
          </div>
        </div>
        <p className="font-serif italic text-[11px] text-muted-foreground mt-3">
          MultiHead(Q,K,V) = Concat(head_1,...,head_h) · W_O. A projeção W_O
          devolve a saída para a dimensão d_model.
        </p>
      </div>
    </div>
  );
}
