"use client";

import { useState } from "react";
import { Play } from "lucide-react";

const TOKENS = ["<s>", "the", "cat", "sat", "on", "the"];

// Pre-mask raw scores (toy values, post-softmax over UNMASKED row would yield
// something like a uniform distribution). With causal mask, future positions
// get -∞ before softmax → 0 weight.
const RAW_SCORES: number[][] = [
  [0.4, 0.3, 0.2, 0.1, 0.5, 0.4],
  [0.2, 0.6, 0.4, 0.3, 0.2, 0.4],
  [0.1, 0.5, 0.7, 0.4, 0.3, 0.2],
  [0.2, 0.3, 0.6, 0.5, 0.4, 0.3],
  [0.3, 0.2, 0.4, 0.5, 0.6, 0.4],
  [0.4, 0.5, 0.3, 0.4, 0.5, 0.6],
];

function softmaxRow(scores: number[], maskFromIndex: number): number[] {
  const expVals = scores.map((s, j) => (j > maskFromIndex ? 0 : Math.exp(s)));
  const sum = expVals.reduce((a, b) => a + b, 0);
  return expVals.map((v) => (sum > 0 ? v / sum : 0));
}

export default function MaskedAttention() {
  const [enabled, setEnabled] = useState(true);

  const matrix = RAW_SCORES.map((row, i) =>
    softmaxRow(row, enabled ? i : TOKENS.length - 1)
  );

  return (
    <div className="my-6 bg-card border border-border rounded-sm p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Play size={14} className="text-rubric shrink-0" />
        <span className="kicker text-rubric flex-1">
          Decoder Masking — o futuro fica em -∞
        </span>
        <button
          onClick={() => setEnabled((e) => !e)}
          className={`px-3 py-1.5 rounded-sm kicker transition border ${
            enabled
              ? "border-rubric/60 bg-rubric/15 text-white"
              : "bg-background border-border text-ink"
          }`}
        >
          mask: {enabled ? "ativo" : "desligado"}
        </button>
      </div>

      <p className="font-mono text-[11px] sm:text-[11px] text-ink-fade mb-3">
        compare a matriz com e sem máscara causal
      </p>

      {/* Matrix */}
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block px-4 sm:px-0">
          <div className="flex">
            <div className="w-16 sm:w-20 font-mono text-[11px] text-ink-fade flex items-end pb-1">
              q ↓ / k →
            </div>
            {TOKENS.map((w, j) => (
              <div
                key={j}
                className="w-12 sm:w-14 font-mono text-[11px] sm:text-[11px] text-muted-foreground text-center pb-1 truncate"
              >
                {w}
              </div>
            ))}
          </div>
          {matrix.map((row, i) => (
            <div key={i} className="flex">
              <div className="w-16 sm:w-20 font-mono text-[11px] sm:text-[11px] text-ink pr-2 flex items-center justify-end truncate">
                {TOKENS[i]}
              </div>
              {row.map((v, j) => {
                const isMasked = enabled && j > i;
                return (
                  <div
                    key={j}
                    className={`w-12 h-8 sm:w-14 sm:h-9 border border-border flex items-center justify-center font-mono text-[11px] sm:text-[11px] transition ${
                      isMasked ? "bg-paper-dark/40" : ""
                    }`}
                    style={
                      isMasked
                        ? {
                            background: "#0a0a0b",
                            color: "#8b8b93",
                          }
                        : {
                            background: `rgba(74,222,128,${v * 0.85})`,
                            color: v > 0.6 ? "#000000" : "#ededed",
                          }
                    }
                  >
                    {isMasked ? "—∞" : v > 0.05 ? v.toFixed(2) : ""}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-background border border-border rounded-sm p-3">
          <div className="kicker text-rubric mb-1">
            sem máscara
          </div>
          <p className="font-serif text-[11px] text-muted-foreground">
            Cada query atende a TODA a sequência — incluindo o futuro. No
            treino isso é trapaça: o modelo veria a resposta antes de tê-la
            gerado.
          </p>
        </div>
        <div className="bg-background border border-border rounded-sm p-3">
          <div className="kicker text-rubric mb-1">
            com máscara causal
          </div>
          <p className="font-serif text-[11px] text-muted-foreground">
            Posições j {">"} i recebem -∞ antes do softmax → α=0. Cada
            posição só vê a si mesma e o passado. Treino e inferência se
            comportam igualmente.
          </p>
        </div>
      </div>
    </div>
  );
}
