"use client";

import { useState } from "react";
import { ArrowDown, ArrowRight, Play } from "lucide-react";

const SOURCE = ["Le", "chat", "noir", "dort"];
const TARGET_PARTIAL = ["The", "black", "cat"];
const NEXT_SUGGESTION = "sleeps";

const ATTENTION_OVER_SOURCE = [0.05, 0.12, 0.18, 0.65];

export default function EncDecAttention() {
  const [stage, setStage] = useState<0 | 1 | 2>(0);

  return (
    <div className="my-6 bg-card border border-border rounded-sm p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Play size={14} className="text-rubric shrink-0" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-rubric flex-1">
          Encoder-Decoder Attention — Q do decoder, K/V do encoder
        </span>
        <div className="flex gap-1">
          {[0, 1, 2].map((s) => (
            <button
              key={s}
              onClick={() => setStage(s as 0 | 1 | 2)}
              className={`w-7 h-7 font-mono text-[11px] rounded-sm transition border ${
                stage === s
                  ? "bg-ink text-paper border-transparent"
                  : "bg-background border-border text-muted-foreground"
              }`}
            >
              {s + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Encoder side */}
        <div className="bg-background border border-border rounded-sm p-3 sm:p-4">
          <div className="font-mono text-[9px] uppercase tracking-widest text-rubric mb-2">
            encoder · saída (K, V)
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {SOURCE.map((tok, i) => (
              <span
                key={i}
                className="px-2.5 py-1.5 rounded-sm font-mono text-[12px] bg-card border border-border text-ink"
              >
                {tok}
              </span>
            ))}
          </div>
          <p className="font-serif italic text-[11px] text-muted-foreground">
            O encoder leu a frase em francês e produziu uma representação para
            cada posição. Esses vetores serão as Keys e Values consultadas
            pelo decoder.
          </p>
        </div>

        {/* Decoder side */}
        <div className="bg-background border border-border rounded-sm p-3 sm:p-4">
          <div className="font-mono text-[9px] uppercase tracking-widest text-rubric mb-2">
            decoder · estado atual (Q)
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {TARGET_PARTIAL.map((tok, i) => (
              <span
                key={i}
                className="px-2.5 py-1.5 rounded-sm font-mono text-[12px] bg-card border border-border text-ink"
              >
                {tok}
              </span>
            ))}
            <span className="px-2.5 py-1.5 rounded-sm font-mono text-[12px] bg-rubric/20 border border-rubric/40 text-ink">
              ?
            </span>
          </div>
          <p className="font-serif italic text-[11px] text-muted-foreground">
            O decoder já gerou &ldquo;{TARGET_PARTIAL.join(" ")}&rdquo;. Para
            decidir o próximo token, formula uma <em>query</em> a partir do
            seu estado interno.
          </p>
        </div>
      </div>

      {/* Stage explanations + arrow flow */}
      <div className="mt-4 bg-background border border-border rounded-sm p-3 sm:p-4">
        {stage === 0 && (
          <div className="animate-fade-in">
            <div className="font-mono text-[10px] uppercase tracking-widest text-rubric mb-2">
              passo 1 · query do decoder
            </div>
            <div className="font-sans text-[12px] sm:text-[13px] text-ink leading-relaxed">
              O decoder produz Q a partir do contexto já gerado{" "}
              <code className="font-mono text-[11px] bg-card px-1 py-0.5 rounded">
                Q ← W_q · estado_decoder
              </code>
              . Q será usado para perguntar &ldquo;quais posições do encoder
              importam agora?&rdquo;
            </div>
          </div>
        )}
        {stage === 1 && (
          <div className="animate-fade-in">
            <div className="font-mono text-[10px] uppercase tracking-widest text-rubric mb-2">
              passo 2 · scores e softmax sobre o encoder
            </div>
            <div className="space-y-1.5">
              {SOURCE.map((tok, j) => {
                const w = ATTENTION_OVER_SOURCE[j];
                return (
                  <div key={j} className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-ink w-14 truncate">
                      {tok}
                    </span>
                    <div className="flex-1 bg-card border border-border rounded-sm h-5 overflow-hidden">
                      <div
                        className="h-full"
                        style={{
                          width: `${w * 100}%`,
                          background: "#c7502e",
                          opacity: 0.4 + w * 0.6,
                        }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-rubric w-12 text-right">
                      α={w.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="font-serif italic text-[11px] text-muted-foreground mt-3">
              Maior peso em &ldquo;<span className="text-rubric">dort</span>&rdquo; — o
              decoder identifica a palavra-fonte para gerar o verbo.
            </p>
          </div>
        )}
        {stage === 2 && (
          <div className="animate-fade-in">
            <div className="font-mono text-[10px] uppercase tracking-widest text-rubric mb-2">
              passo 3 · context vector → próximo token
            </div>
            <div className="font-sans text-[12px] sm:text-[13px] text-ink leading-relaxed mb-3">
              <code className="font-mono text-[11px] bg-card px-1 py-0.5 rounded">
                c = Σ α_j · V_j
              </code>{" "}
              é alimentado de volta no decoder, que então projeta para o
              vocabulário e amostra:
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {TARGET_PARTIAL.map((tok, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1.5 rounded-sm font-mono text-[12px] bg-card border border-border text-ink"
                >
                  {tok}
                </span>
              ))}
              <ArrowRight size={14} className="text-rubric" />
              <span className="px-2.5 py-1.5 rounded-sm font-mono text-[12px] bg-rubric text-paper border border-rubric">
                {NEXT_SUGGESTION}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Q/K/V provenance reminder */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="bg-background border border-border rounded-sm p-2">
          <div className="font-mono text-[9px] uppercase tracking-widest text-rubric mb-1">
            Q
          </div>
          <div className="font-sans text-[11px] text-ink">decoder</div>
          <ArrowDown size={10} className="text-ink-fade mx-auto mt-1" />
        </div>
        <div className="bg-background border border-border rounded-sm p-2">
          <div className="font-mono text-[9px] uppercase tracking-widest text-rubric mb-1">
            K
          </div>
          <div className="font-sans text-[11px] text-ink">encoder</div>
          <ArrowDown size={10} className="text-ink-fade mx-auto mt-1" />
        </div>
        <div className="bg-background border border-border rounded-sm p-2">
          <div className="font-mono text-[9px] uppercase tracking-widest text-rubric mb-1">
            V
          </div>
          <div className="font-sans text-[11px] text-ink">encoder</div>
          <ArrowDown size={10} className="text-ink-fade mx-auto mt-1" />
        </div>
      </div>

      <p className="mt-5 font-serif italic text-[12px] sm:text-[13px] text-muted-foreground border-t border-border pt-3">
        Esta é a única camada onde Q vem de uma fonte e K/V vêm de outra. Em
        self-attention (no encoder ou no decoder), todos os três vêm da mesma
        sequência.
      </p>
    </div>
  );
}
