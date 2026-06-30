"use client";

import { useState, useEffect } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const SEQUENCE = ["<s>", "o", "gato", "subiu", "no", "telhado", "</s>"];

const MOCK_CANDIDATES = [
  [
    { word: "o", prob: 0.62 },
    { word: "um", prob: 0.18 },
    { word: "a", prob: 0.08 },
  ],
  [
    { word: "gato", prob: 0.62 },
    { word: "cachorro", prob: 0.18 },
    { word: "rato", prob: 0.08 },
  ],
  [
    { word: "subiu", prob: 0.62 },
    { word: "pulou", prob: 0.18 },
    { word: "caiu", prob: 0.08 },
  ],
  [
    { word: "no", prob: 0.62 },
    { word: "do", prob: 0.18 },
    { word: "pelo", prob: 0.08 },
  ],
  [
    { word: "telhado", prob: 0.62 },
    { word: "quintal", prob: 0.18 },
    { word: "jardim", prob: 0.08 },
  ],
  [
    { word: "</s>", prob: 0.62 },
    { word: ".", prob: 0.18 },
    { word: "ontem", prob: 0.08 },
  ],
];

export default function AutoregressiveDemo() {
  const [step, setStep] = useState(1);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const iv = setInterval(() => {
      setStep((s) => (s >= SEQUENCE.length - 1 ? 1 : s + 1));
    }, 1400);
    return () => clearInterval(iv);
  }, [playing]);

  const candidates = step < SEQUENCE.length ? MOCK_CANDIDATES[step - 1] : [];

  return (
    <div className="my-6 bg-card border border-border rounded-sm p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Play size={14} className="text-rubric shrink-0" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-rubric flex-1">
          Animação — geração autoregressiva
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPlaying((p) => !p)}
          className="font-mono text-[11px]"
        >
          {playing ? "⏸" : "▶"}
        </Button>
      </div>

      <div className="bg-background border border-border rounded-sm p-4 sm:p-5">
        <div className="font-mono text-[9px] uppercase tracking-widest text-ink-fade mb-2">
          tokens gerados até agora:
        </div>
        <div className="flex flex-wrap gap-1.5 mb-5 min-h-[42px]">
          {SEQUENCE.slice(0, step).map((tok, i) => (
            <div
              key={i}
              className="px-2.5 py-1.5 rounded-sm font-mono text-[12px] sm:text-[13px] bg-card border border-border text-ink animate-fade-in"
            >
              {tok}
            </div>
          ))}
        </div>

        <div className="flex justify-center mb-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12l7 7 7-7"
              stroke="#c7502e"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="font-mono text-[9px] uppercase tracking-widest text-rubric mb-2">
          modelo prediz próximo token:
        </div>
        <div className="flex justify-center">
          {step < SEQUENCE.length && (
            <div
              className="px-3 py-2 rounded-sm font-mono text-[14px] sm:text-[16px] border-2 text-paper font-semibold animate-pulse-slow"
              style={{ background: "#c7502e", borderColor: "#c7502e" }}
            >
              {SEQUENCE[step]}
            </div>
          )}
        </div>

        <div className="mt-5 pt-4 border-t border-border">
          <div className="font-mono text-[9px] uppercase tracking-widest text-ink-fade mb-2">
            top-3 candidatos:
          </div>
          {candidates.map((c, i) => (
            <div key={i} className="flex items-center gap-2 mb-1.5">
              <span
                className="font-mono text-[11px] w-20 sm:w-24 truncate"
                style={{
                  color: i === 0 ? "#c7502e" : "rgba(26,21,18,0.7)",
                  fontWeight: i === 0 ? 600 : 400,
                }}
              >
                {c.word}
              </span>
              <div className="flex-1 bg-card border border-border rounded-sm h-3.5 overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${c.prob * 100}%`,
                    background: i === 0 ? "#c7502e" : "rgba(26,21,18,0.4)",
                  }}
                />
              </div>
              <span className="font-mono text-[11px] text-muted-foreground w-10 text-right">
                {(c.prob * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 font-mono text-[10px] sm:text-[11px] text-ink-fade text-center">
        passo {step}/{SEQUENCE.length - 1} — geração para até &lt;/s&gt;
      </div>

      <p className="mt-5 font-serif italic text-[12px] sm:text-[13px] text-muted-foreground border-t border-border pt-3">
        <span className="bg-rubric/15 px-1">Autoregressivo</span> = cada token
        gerado é alimentado de volta na entrada do próximo passo. O modelo nunca
        vê o futuro.
      </p>
    </div>
  );
}
