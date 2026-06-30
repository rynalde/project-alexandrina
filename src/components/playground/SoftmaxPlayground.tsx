"use client";

import { useState, useMemo } from "react";
import { Play, ArrowRight } from "lucide-react";

const LABELS = [
  "gato",
  "cachorro",
  "casa",
  "mesa",
  "janela",
  "porta",
  "parede",
  "teto",
];

export default function SoftmaxPlayground() {
  const [logitsStr, setLogitsStr] = useState("2.5, 1.8, 0.5, -0.3, 1.2");
  const [temperature, setTemperature] = useState(1.0);

  const logits = useMemo(
    () =>
      logitsStr
        .split(/[,\s]+/)
        .map((s) => parseFloat(s))
        .filter((p) => !isNaN(p)),
    [logitsStr]
  );

  const probs = useMemo(() => {
    if (!logits.length) return [];
    const scaled = logits.map((l) => l / temperature);
    const maxL = Math.max(...scaled);
    const exps = scaled.map((l) => Math.exp(l - maxL));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map((e) => e / sum);
  }, [logits, temperature]);

  const sum = probs.reduce((a, b) => a + b, 0);
  const argmax = probs.indexOf(Math.max(...probs, 0));
  const entropy = -probs.reduce(
    (s, p) => s + (p > 0 ? p * Math.log2(p) : 0),
    0
  );

  return (
    <div className="my-6 bg-card border border-border rounded-sm p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Play size={14} className="text-rubric shrink-0" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-rubric">
          Calculadora — softmax
        </span>
      </div>

      <p className="font-sans text-[13px] sm:text-[14px] text-muted-foreground mb-3">
        Insira os logits (scores brutos) que a rede produziu para cada palavra:
      </p>

      <textarea
        value={logitsStr}
        onChange={(e) => setLogitsStr(e.target.value)}
        className="w-full bg-background border border-border rounded-sm p-3 font-mono text-[13px] text-ink focus:outline-none focus:border-rubric resize-none text-base"
        rows={2}
        placeholder="2.5, 1.8, 0.5, ..."
      />

      <div className="flex items-center gap-3 sm:gap-4 mt-4 flex-wrap">
        <span className="font-mono text-[11px] text-muted-foreground">
          temperatura =
        </span>
        <input
          type="range"
          min={0.1}
          max={3}
          step={0.1}
          value={temperature}
          onChange={(e) => setTemperature(Number(e.target.value))}
          className="flex-1 accent-rubric min-w-[100px]"
        />
        <span className="font-serif text-xl text-ink w-12 text-center">
          {temperature.toFixed(1)}
        </span>
      </div>

      <div className="mt-5">
        <div className="font-mono text-[10px] uppercase tracking-widest text-ink-fade mb-3">
          logits → probabilidades · soma = {sum.toFixed(4)}
        </div>
        <div className="space-y-1.5">
          {logits.map((logit, i) => (
            <div key={i} className="flex items-center gap-2 sm:gap-3">
              <span className="font-mono text-[11px] text-muted-foreground w-14 sm:w-16 truncate">
                {LABELS[i] || `w${i + 1}`}
              </span>
              <span className="font-mono text-[11px] text-ink w-10 sm:w-12 text-right">
                {logit.toFixed(2)}
              </span>
              <ArrowRight size={12} className="text-ink-fade shrink-0" />
              <div className="flex-1 bg-background border border-border rounded-sm h-5 sm:h-6 overflow-hidden min-w-[40px]">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${(probs[i] ?? 0) * 100}%`,
                    background: "#c7502e",
                    opacity: 0.4 + (probs[i] ?? 0) * 0.6,
                  }}
                />
              </div>
              <span className="font-mono text-[11px] text-rubric w-12 sm:w-14 text-right font-semibold">
                {((probs[i] ?? 0) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-background border border-border rounded-sm p-3 text-center">
          <div className="font-mono text-[9px] uppercase tracking-widest text-ink-fade">
            soma
          </div>
          <div className="font-serif text-xl text-ink mt-1">
            {sum.toFixed(3)}
          </div>
          <div className="font-mono text-[10px] text-muted-foreground">
            sempre = 1
          </div>
        </div>
        <div className="bg-background border border-rubric rounded-sm p-3 text-center">
          <div className="font-mono text-[9px] uppercase tracking-widest text-rubric">
            argmax
          </div>
          <div className="font-serif text-xl text-rubric mt-1 truncate">
            {LABELS[argmax] || "?"}
          </div>
          <div className="font-mono text-[10px] text-muted-foreground">
            predição greedy
          </div>
        </div>
        <div className="bg-background border border-border rounded-sm p-3 text-center">
          <div className="font-mono text-[9px] uppercase tracking-widest text-ink-fade">
            entropia
          </div>
          <div className="font-serif text-xl text-ink mt-1">
            {entropy.toFixed(2)}
          </div>
          <div className="font-mono text-[10px] text-muted-foreground">
            incerteza
          </div>
        </div>
      </div>

      <p className="mt-5 font-serif italic text-[12px] sm:text-[13px] text-muted-foreground border-t border-border pt-3">
        Diminua a temperatura → distribuição fica <em>mais picuda</em>.
        Aumente → distribuição fica <em>mais uniforme</em>.{" "}
        <span className="text-rubric">Soma sempre 1</span>.
      </p>
    </div>
  );
}
