"use client";

import { useState } from "react";
import { Play } from "lucide-react";

const TOKENS = ["The", "cat", "sat", "on", "mat"];

// Pre-baked toy attention matrix where each row is the softmaxed
// attention distribution from token i over the same sequence.
// Row sums equal 1.
const ATTENTION: number[][] = [
  [0.45, 0.20, 0.10, 0.10, 0.15],
  [0.18, 0.42, 0.12, 0.08, 0.20],
  [0.12, 0.30, 0.40, 0.10, 0.08],
  [0.15, 0.10, 0.10, 0.50, 0.15],
  [0.12, 0.32, 0.10, 0.16, 0.30],
];

export default function SelfAttention() {
  const [selected, setSelected] = useState(1);

  return (
    <div className="my-6 bg-card border border-border rounded-sm p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Play size={14} className="text-rubric shrink-0" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-rubric">
          Self-attention — uma sequência olhando para si mesma
        </span>
      </div>

      <p className="font-mono text-[10px] sm:text-[11px] text-ink-fade mb-3">
        toque uma <span className="text-rubric">query</span> (linha) para ver
        em quais tokens da MESMA sequência ela está prestando atenção
      </p>

      {/* Token row as queries */}
      <div className="bg-background border border-border rounded-sm p-3 mb-4">
        <div className="font-mono text-[9px] uppercase tracking-widest text-ink-fade mb-2">
          query (token i da sequência)
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TOKENS.map((tok, i) => (
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

      {/* Attention bars over the same sequence */}
      <div className="bg-background border border-border rounded-sm p-3 mb-4">
        <div className="font-mono text-[9px] uppercase tracking-widest text-ink-fade mb-2">
          atenção de &ldquo;{TOKENS[selected]}&rdquo; sobre a sequência (Keys)
        </div>
        <div className="space-y-1.5">
          {TOKENS.map((tok, j) => {
            const w = ATTENTION[selected][j];
            const isSelf = j === selected;
            return (
              <div key={j} className="flex items-center gap-2 sm:gap-3">
                <span
                  className={`font-mono text-[11px] sm:text-[12px] w-12 sm:w-16 truncate ${
                    isSelf ? "text-rubric" : "text-ink"
                  }`}
                >
                  {tok}
                  {isSelf && <span className="text-[9px] ml-1">(self)</span>}
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

      {/* Full square matrix */}
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="font-mono text-[9px] uppercase tracking-widest text-ink-fade mb-2 px-4 sm:px-0">
          matriz de auto-atenção (linhas = queries, colunas = keys)
        </div>
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
          {ATTENTION.map((row, i) => (
            <div key={i} className="flex">
              <div className="w-16 sm:w-20 font-mono text-[10px] sm:text-[11px] text-ink pr-2 flex items-center justify-end truncate">
                {TOKENS[i]}
              </div>
              {row.map((v, j) => (
                <div
                  key={j}
                  onClick={() => setSelected(i)}
                  className={`w-12 h-8 sm:w-14 sm:h-9 border border-border flex items-center justify-center font-mono text-[9px] sm:text-[10px] cursor-pointer transition ${
                    i === selected ? "ring-2 ring-rubric ring-inset" : ""
                  } ${i === j ? "outline outline-1 outline-ink/30" : ""}`}
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
        Diferente da encoder-decoder attention, aqui{" "}
        <span className="bg-rubric/15 px-1">Q, K e V vêm da mesma sequência</span>.
        A diagonal mostra o quanto cada token atende a si mesmo. Cada linha soma 1.
      </p>
    </div>
  );
}
