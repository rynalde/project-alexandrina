"use client";

import { useState } from "react";
import { Play } from "lucide-react";

type Stage =
  | "input"
  | "encoder_sa"
  | "encoder_ffn"
  | "encoder_out"
  | "decoder_msa"
  | "decoder_ed"
  | "decoder_ffn"
  | "output";

const STAGES: { id: Stage; label: string; description: string }[] = [
  {
    id: "input",
    label: "1 · entrada + PE",
    description: "Tokens viram embeddings; soma-se positional encoding.",
  },
  {
    id: "encoder_sa",
    label: "2 · self-attention (encoder)",
    description: "Cada token olha para todos os outros da entrada (intra-attention).",
  },
  {
    id: "encoder_ffn",
    label: "3 · FFN + Add&Norm",
    description: "Rede feed-forward por posição. Conexão residual + LayerNorm.",
  },
  {
    id: "encoder_out",
    label: "4 · saída do encoder",
    description: "Stack de N blocos repete o ciclo. A saída final vai para o decoder como K/V.",
  },
  {
    id: "decoder_msa",
    label: "5 · masked self-attention",
    description: "No decoder: cada posição só atende posições ≤ i.",
  },
  {
    id: "decoder_ed",
    label: "6 · encoder-decoder attention",
    description: "Q do decoder; K/V vêm da saída do encoder. Inter-attention.",
  },
  {
    id: "decoder_ffn",
    label: "7 · FFN + Add&Norm",
    description: "FFN por posição, residual, LayerNorm. N blocos.",
  },
  {
    id: "output",
    label: "8 · linear + softmax",
    description: "Projeção para o vocabulário e softmax → próximo token.",
  },
];

export default function TransformerArchitecture() {
  const [active, setActive] = useState<Stage>("input");
  const stage = STAGES.find((s) => s.id === active)!;

  const isHighlighted = (id: Stage) => active === id;

  return (
    <div className="my-6 bg-card border border-border rounded-sm p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Play size={14} className="text-rubric shrink-0" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-rubric flex-1">
          Arquitetura Transformer — fluxo geral
        </span>
      </div>

      {/* Diagram */}
      <div className="bg-background border border-border rounded-sm p-3 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Encoder column */}
          <div className="border border-border rounded-sm p-3 bg-card/40">
            <div className="font-mono text-[9px] uppercase tracking-widest text-rubric mb-3 text-center">
              encoder (× N)
            </div>
            <div className="space-y-2">
              <Block
                label="input embedding + PE"
                active={isHighlighted("input")}
                onClick={() => setActive("input")}
              />
              <Block
                label="multi-head self-attention"
                active={isHighlighted("encoder_sa")}
                onClick={() => setActive("encoder_sa")}
              />
              <SubBlock label="add & norm" />
              <Block
                label="feed-forward"
                active={isHighlighted("encoder_ffn")}
                onClick={() => setActive("encoder_ffn")}
              />
              <SubBlock label="add & norm" />
              <Block
                label="encoder output → K, V"
                active={isHighlighted("encoder_out")}
                onClick={() => setActive("encoder_out")}
                rubric
              />
            </div>
          </div>

          {/* Decoder column */}
          <div className="border border-border rounded-sm p-3 bg-card/40">
            <div className="font-mono text-[9px] uppercase tracking-widest text-rubric mb-3 text-center">
              decoder (× N)
            </div>
            <div className="space-y-2">
              <Block
                label="output embedding + PE (deslocada)"
                active={isHighlighted("input")}
                onClick={() => setActive("input")}
              />
              <Block
                label="masked self-attention"
                active={isHighlighted("decoder_msa")}
                onClick={() => setActive("decoder_msa")}
              />
              <SubBlock label="add & norm" />
              <Block
                label="encoder-decoder attention"
                active={isHighlighted("decoder_ed")}
                onClick={() => setActive("decoder_ed")}
                rubric
              />
              <SubBlock label="add & norm" />
              <Block
                label="feed-forward"
                active={isHighlighted("decoder_ffn")}
                onClick={() => setActive("decoder_ffn")}
              />
              <SubBlock label="add & norm" />
              <Block
                label="linear + softmax → próximo token"
                active={isHighlighted("output")}
                onClick={() => setActive("output")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-4 bg-background border border-border rounded-sm p-3 sm:p-4">
        <div className="font-mono text-[10px] uppercase tracking-widest text-rubric">
          {stage.label}
        </div>
        <div className="font-sans text-[12px] sm:text-[13px] text-ink mt-1 leading-relaxed">
          {stage.description}
        </div>
      </div>

      {/* Stage navigator */}
      <div className="mt-3 flex flex-wrap gap-1">
        {STAGES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={`w-7 h-7 font-mono text-[11px] rounded-sm transition border ${
              active === s.id
                ? "bg-ink text-paper border-transparent"
                : "bg-background border-border text-muted-foreground hover:border-rubric/30"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <p className="mt-5 font-serif italic text-[12px] sm:text-[13px] text-muted-foreground border-t border-border pt-3">
        Note as três caixas de atenção: <span className="bg-rubric/15 px-1">self-attention no encoder</span>,
        <span className="bg-rubric/15 px-1 ml-1">masked self-attention no decoder</span> e
        <span className="bg-rubric/15 px-1 ml-1">encoder-decoder attention</span>. Cada uma com seu papel.
      </p>
    </div>
  );
}

function Block({
  label,
  active,
  onClick,
  rubric,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  rubric?: boolean;
}) {
  let cls =
    "w-full text-left px-3 py-2 rounded-sm font-mono text-[11px] transition border ";
  if (active) {
    cls += "bg-ink text-paper border-transparent";
  } else if (rubric) {
    cls += "bg-rubric/10 border-rubric/30 text-ink hover:bg-rubric/15";
  } else {
    cls += "bg-background border-border text-ink hover:border-rubric/30";
  }
  return (
    <button onClick={onClick} className={cls}>
      {label}
    </button>
  );
}

function SubBlock({ label }: { label: string }) {
  return (
    <div className="text-center font-mono text-[9px] uppercase tracking-widest text-ink-fade py-0.5">
      ↓ {label} ↓
    </div>
  );
}
