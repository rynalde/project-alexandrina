"use client";

import { useState } from "react";
import { Play } from "lucide-react";

const SEQ_LEN = 24;
const D_MODEL = 16;

// Sinusoidal positional encoding from Vaswani et al. (2017):
//   PE(pos, 2i)   = sin(pos / 10000^(2i/d_model))
//   PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))
function pe(pos: number, dim: number): number {
  const i = Math.floor(dim / 2);
  const denom = Math.pow(10000, (2 * i) / D_MODEL);
  return dim % 2 === 0 ? Math.sin(pos / denom) : Math.cos(pos / denom);
}

const MATRIX: number[][] = Array.from({ length: SEQ_LEN }, (_, pos) =>
  Array.from({ length: D_MODEL }, (_, dim) => pe(pos, dim))
);

export default function PositionalEncoding() {
  const [pos, setPos] = useState(5);

  const row = MATRIX[pos];

  return (
    <div className="my-6 bg-card border border-border rounded-sm p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Play size={14} className="text-rubric shrink-0" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-rubric flex-1">
          Positional Encoding — sinusoidal (Vaswani 2017)
        </span>
      </div>

      {/* Position slider */}
      <div className="bg-background border border-border rounded-sm p-3 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-fade">
            posição na sequência
          </span>
          <span className="font-mono text-[12px] text-rubric">pos = {pos}</span>
        </div>
        <input
          type="range"
          min={0}
          max={SEQ_LEN - 1}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          className="w-full accent-rubric"
        />
      </div>

      {/* PE vector for selected position */}
      <div className="bg-background border border-border rounded-sm p-3 mb-4 overflow-x-auto">
        <div className="font-mono text-[10px] uppercase tracking-widest text-ink-fade mb-2">
          PE(pos={pos}) ∈ R^{D_MODEL}
        </div>
        <div className="flex gap-1">
          {row.map((v, dim) => {
            const norm = (v + 1) / 2; // map [-1,1] → [0,1]
            return (
              <div
                key={dim}
                className="w-7 h-10 border border-border rounded-sm flex flex-col items-center justify-center font-mono text-[9px] shrink-0"
                style={{
                  background: `rgba(199, 80, 46, ${norm})`,
                  color: norm > 0.55 ? "#f5efe3" : "#1a1512",
                }}
                title={`dim=${dim} v=${v.toFixed(2)}`}
              >
                <div className="text-[8px] opacity-60">{dim}</div>
                <div>{v.toFixed(1)}</div>
              </div>
            );
          })}
        </div>
        <p className="font-serif italic text-[11px] text-muted-foreground mt-3">
          Cada dimensão usa uma frequência diferente. As primeiras dimensões
          oscilam rápido (alta frequência), as últimas oscilam devagar — isso
          permite ao modelo distinguir posições próximas E posições muito
          distantes.
        </p>
      </div>

      {/* Full PE matrix as heatmap */}
      <div className="bg-background border border-border rounded-sm p-3 overflow-x-auto">
        <div className="font-mono text-[10px] uppercase tracking-widest text-ink-fade mb-2">
          matriz PE inteira (linhas = posições, colunas = dimensões)
        </div>
        <div className="inline-block">
          <div className="flex">
            <div className="w-10" />
            {Array.from({ length: D_MODEL }).map((_, dim) => (
              <div
                key={dim}
                className="w-5 font-mono text-[8px] text-muted-foreground text-center"
              >
                {dim}
              </div>
            ))}
          </div>
          {MATRIX.map((r, p) => (
            <div key={p} className="flex">
              <div
                className={`w-10 font-mono text-[9px] pr-2 flex items-center justify-end ${
                  p === pos ? "text-rubric font-semibold" : "text-ink-fade"
                }`}
              >
                {p}
              </div>
              {r.map((v, dim) => {
                const norm = (v + 1) / 2;
                return (
                  <div
                    key={dim}
                    className="w-5 h-4 border border-border/50"
                    style={{
                      background: `rgba(199, 80, 46, ${norm})`,
                      outline:
                        p === pos ? "1px solid rgba(199,80,46,0.6)" : undefined,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Embedding + PE addition diagram */}
      <div className="mt-5 bg-background border border-border rounded-sm p-3 sm:p-4">
        <div className="font-mono text-[10px] uppercase tracking-widest text-rubric mb-2">
          como entra no modelo
        </div>
        <div className="flex items-center gap-2 flex-wrap font-mono text-[11px]">
          <div className="bg-card border border-border rounded-sm px-2 py-1 text-ink">
            embedding(token)
          </div>
          <span className="text-rubric font-bold">+</span>
          <div className="bg-card border border-border rounded-sm px-2 py-1 text-ink">
            PE(posição)
          </div>
          <span className="text-ink-fade">=</span>
          <div className="bg-rubric text-paper rounded-sm px-2 py-1">
            entrada do bloco
          </div>
        </div>
        <p className="font-serif italic text-[11px] text-muted-foreground mt-3">
          PE não substitui o embedding. É somado a ele, dimensão por dimensão.
          Sem isso, o Transformer veria &ldquo;o gato comeu&rdquo; e &ldquo;comeu
          gato o&rdquo; como conjuntos idênticos.
        </p>
      </div>
    </div>
  );
}
