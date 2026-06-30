"use client";

import { useState } from "react";
import { ArrowRight, Eye, RotateCcw } from "lucide-react";

const DRILLS = [
  {
    title: "Reta com lado acima",
    prompt: "Reta: x2 = -2*x1 + 3. A saída 1 deve estar acima da reta.",
    answer:
      "Passe para 2*x1 + x2 - 3 = 0. Um ponto acima, como (0,4), dá 1 > 0. Logo use w=(2,1), b=-3.",
  },
  {
    title: "Reta com lado abaixo",
    prompt: "Reta: x2 = 0.5*x1 - 1. A saída 1 deve estar abaixo da reta.",
    answer:
      "A forma direta é -0.5*x1 + x2 + 1 = 0. Para ficar abaixo, inverta: 0.5*x1 - x2 - 1 >= 0.",
  },
  {
    title: "Faixa paralela",
    prompt: "Região entre x2 = x1 - 1 e x2 = x1 + 2.",
    answer:
      "Acima da inferior: -x1 + x2 + 1 >= 0. Abaixo da superior: x1 - x2 + 2 >= 0. Combine com AND.",
  },
  {
    title: "Triângulo",
    prompt: "Interior delimitado por três retas.",
    answer:
      "Cada lado vira um perceptron orientado para dentro. A saída final é AND(p1,p2,p3). Teste um ponto interior para validar sinais.",
  },
  {
    title: "Duas elipses",
    prompt: "Região desejada é dentro da elipse A ou dentro da elipse B.",
    answer:
      "A = AND das tangentes de A. B = AND das tangentes de B. Saída final = OR(A,B). Não use AND global de todas as tangentes.",
  },
  {
    title: "Entre planos 3D",
    prompt: "Planos paralelos n·x = -1 e n·x = 2. Queremos os pontos entre eles.",
    answer:
      "Condições: n·x + 1 >= 0 e -n·x + 2 >= 0. Combine as duas saídas com AND.",
  },
];

export default function PerceptronDrillDeck() {
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const drill = DRILLS[idx];

  const next = () => {
    setIdx((value) => (value + 1) % DRILLS.length);
    setRevealed(false);
  };

  const reset = () => {
    setIdx(0);
    setRevealed(false);
  };

  return (
    <div className="my-6 bg-card border border-border rounded-sm p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-rubric">
            treino diário — carta {idx + 1}/{DRILLS.length}
          </div>
          <h3 className="font-serif text-xl sm:text-2xl italic text-ink mt-1">{drill.title}</h3>
        </div>
        <button
          type="button"
          onClick={reset}
          className="h-9 w-9 rounded-sm border border-border bg-background text-ink-fade hover:text-rubric transition inline-flex items-center justify-center"
          aria-label="Recomeçar cartas"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      <div className="bg-background border border-border rounded-sm p-4 sm:p-5">
        <div className="font-mono text-[9px] uppercase tracking-widest text-ink-fade mb-2">
          enunciado
        </div>
        <p className="font-sans text-sm sm:text-[15px] leading-relaxed text-ink">
          {drill.prompt}
        </p>
      </div>

      {revealed && (
        <div className="mt-3 border-l-2 border-rubric pl-4 animate-slide-in">
          <div className="font-mono text-[9px] uppercase tracking-widest text-rubric mb-1">
            resolução
          </div>
          <p className="font-serif italic text-[13px] sm:text-[14px] leading-relaxed text-muted-foreground">
            {drill.answer}
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={() => setRevealed(true)}
          disabled={revealed}
          className="min-h-11 flex-1 rounded-sm border border-rubric/40 bg-background px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-rubric hover:bg-rubric/10 transition disabled:opacity-50"
        >
          <Eye size={14} className="inline mr-2" />
          mostrar resolução
        </button>
        <button
          type="button"
          onClick={next}
          className="min-h-11 flex-1 rounded-sm border border-border bg-background px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-ink-fade hover:text-ink transition"
        >
          próxima carta
          <ArrowRight size={14} className="inline ml-2" />
        </button>
      </div>
    </div>
  );
}
