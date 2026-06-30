"use client";

import { useState } from "react";
import { Play } from "lucide-react";

const SOURCE = ["the", "cat", "sat"];
const ENCODER_H = [
  [0.8, 0.2, 0.4],
  [0.3, 0.9, 0.5],
  [0.5, 0.4, 0.7],
];
const QUERY = [0.4, 0.85, 0.55];

const SCORES = ENCODER_H.map((h) =>
  h.reduce((s, hi, i) => s + hi * QUERY[i], 0)
);
const EXP_SCORES = SCORES.map(Math.exp);
const SUM_EXP = EXP_SCORES.reduce((a, b) => a + b, 0);
const ALPHAS = EXP_SCORES.map((e) => e / SUM_EXP);
const CONTEXT = [0, 1, 2].map((i) =>
  ALPHAS.reduce((s, a, j) => s + a * ENCODER_H[j][i], 0)
);

const STEP_INFO = [
  {
    title: "1. scores",
    desc: "produto escalar entre query do decoder e cada h_j do encoder",
  },
  { title: "2. softmax", desc: "normaliza scores em pesos α que somam 1" },
  { title: "3. context", desc: "soma ponderada dos h_j com pesos α" },
];

export default function AttentionComputation() {
  const [step, setStep] = useState(0);

  return (
    <div className="my-6 bg-card border border-border rounded-sm p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Play size={14} className="text-rubric shrink-0" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-rubric flex-1">
          Cálculo passo a passo
        </span>
        <div className="flex gap-1">
          {[0, 1, 2].map((s) => (
            <button
              key={s}
              onClick={() => setStep(s)}
              className={`w-7 h-7 font-mono text-[11px] rounded-sm transition border ${
                step === s
                  ? "bg-ink text-paper border-transparent"
                  : "bg-background border-border text-muted-foreground"
              }`}
            >
              {s + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-background border border-border rounded-sm p-3 sm:p-4 mb-4">
        <div className="font-mono text-[10px] uppercase tracking-widest text-rubric">
          {STEP_INFO[step].title}
        </div>
        <div className="font-sans text-[12px] sm:text-[13px] text-muted-foreground mt-1">
          {STEP_INFO[step].desc}
        </div>
      </div>

      {step === 0 && (
        <div className="space-y-3 animate-fade-in">
          <div className="bg-background border border-border rounded-sm p-3 sm:p-4">
            <div className="font-mono text-[10px] text-ink-fade mb-2">
              decoder query (s_t)
            </div>
            <div className="flex gap-1 mb-3">
              {QUERY.map((v, i) => (
                <div
                  key={i}
                  className="w-10 h-10 border border-border rounded-sm flex items-center justify-center font-mono text-[10px]"
                  style={{
                    background: `rgba(199, 80, 46, ${v})`,
                    color: v > 0.5 ? "#f5efe3" : "#1a1512",
                  }}
                >
                  {v.toFixed(2)}
                </div>
              ))}
            </div>
            <div className="font-mono text-[10px] text-ink-fade mb-2">
              encoder hidden states (h_j) e scores
            </div>
            {ENCODER_H.map((h, j) => (
              <div key={j} className="flex items-center gap-2 sm:gap-3 mb-2">
                <span className="font-mono text-[11px] text-ink w-14 sm:w-16">
                  {SOURCE[j]}
                </span>
                <div className="flex gap-1">
                  {h.map((v, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 border border-border rounded-sm flex items-center justify-center font-mono text-[9px]"
                      style={{
                        background: `rgba(60, 105, 124, ${v})`,
                        color: v > 0.5 ? "#f5efe3" : "#1a1512",
                      }}
                    >
                      {v.toFixed(1)}
                    </div>
                  ))}
                </div>
                <div className="font-mono text-[11px] text-rubric font-semibold ml-auto">
                  {SCORES[j].toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          <div className="font-mono text-[11px] text-muted-foreground text-center bg-background border border-border rounded-sm p-2">
            score_j = h_j · s_t (produto escalar)
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3 animate-fade-in">
          <div className="bg-background border border-border rounded-sm p-3 sm:p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="font-mono text-[10px] text-ink-fade mb-2">
                  scores brutos
                </div>
                {SCORES.map((s, j) => (
                  <div key={j} className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-[11px] text-ink w-12">
                      {SOURCE[j]}
                    </span>
                    <div className="font-mono text-[12px] text-ink">
                      {s.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <div className="font-mono text-[10px] text-rubric mb-2">
                  α (após softmax)
                </div>
                {ALPHAS.map((a, j) => (
                  <div key={j} className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-[11px] text-ink w-12">
                      {SOURCE[j]}
                    </span>
                    <div className="flex-1 bg-card border border-border rounded-sm h-4 overflow-hidden">
                      <div
                        className="h-full"
                        style={{ width: `${a * 100}%`, background: "#c7502e" }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-rubric w-10 text-right">
                      {a.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border font-mono text-[11px] text-center text-muted-foreground">
              soma das α = {ALPHAS.reduce((a, b) => a + b, 0).toFixed(2)}
            </div>
          </div>
          <div className="font-mono text-[11px] text-muted-foreground text-center bg-background border border-border rounded-sm p-2">
            α_j = exp(score_j) / Σ exp(score_k)
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3 animate-fade-in">
          <div className="bg-background border border-border rounded-sm p-3 sm:p-4">
            {ENCODER_H.map((h, j) => (
              <div key={j} className="flex items-center gap-2 sm:gap-3 mb-2">
                <span className="font-mono text-[11px] text-ink w-12">
                  {SOURCE[j]}
                </span>
                <span className="font-mono text-[11px] text-rubric">
                  α={ALPHAS[j].toFixed(2)}
                </span>
                <span className="font-mono text-[10px] text-ink-fade">×</span>
                <div className="flex gap-1">
                  {h.map((v, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 border border-border rounded-sm flex items-center justify-center font-mono text-[8px]"
                      style={{
                        background: `rgba(60, 105, 124, ${v})`,
                        color: v > 0.5 ? "#f5efe3" : "#1a1512",
                      }}
                    >
                      {v.toFixed(1)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="mt-3 pt-3 border-t border-border">
              <div className="font-mono text-[10px] uppercase text-rubric mb-2">
                context vector c_t
              </div>
              <div className="flex gap-1">
                {CONTEXT.map((v, i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-sm flex items-center justify-center font-mono text-[11px] font-semibold border-2 border-rubric"
                    style={{
                      background: `rgba(199, 80, 46, ${v})`,
                      color: v > 0.5 ? "#f5efe3" : "#1a1512",
                    }}
                  >
                    {v.toFixed(2)}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="font-mono text-[11px] text-muted-foreground text-center bg-background border border-border rounded-sm p-2">
            c_t = Σ α_j · h_j
          </div>
        </div>
      )}

      <p className="mt-5 font-serif italic text-[12px] sm:text-[13px] text-muted-foreground border-t border-border pt-3">
        Esses três passos acontecem <em>a cada token gerado</em> pelo decoder. A
        query muda, os pesos mudam, o context vector muda.
      </p>
    </div>
  );
}
