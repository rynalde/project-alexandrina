"use client";

import { useState } from "react";
import { Play } from "lucide-react";

interface Example {
  label: string;
  source: string[];
  target: string[];
  alignments: [number, number][];
}

const EXAMPLES: Example[] = [
  {
    label: "1-para-1",
    source: ["I", "love", "NLP"],
    target: ["Eu", "amo", "PLN"],
    alignments: [
      [0, 0],
      [1, 1],
      [2, 2],
    ],
  },
  {
    label: "muitos-para-1",
    source: ["I", "am", "happy"],
    target: ["Estou", "feliz"],
    alignments: [
      [0, 0],
      [1, 0],
      [2, 1],
    ],
  },
  {
    label: "1-para-muitos",
    source: ["casa"],
    target: ["the", "house"],
    alignments: [
      [0, 0],
      [0, 1],
    ],
  },
  {
    label: "reordenação",
    source: ["the", "red", "car"],
    target: ["o", "carro", "vermelho"],
    alignments: [
      [0, 0],
      [1, 2],
      [2, 1],
    ],
  },
];

const TOKEN_W = 70;
const SOURCE_Y = 30;
const TARGET_Y = 130;

export default function WordAlignmentDemo() {
  const [idx, setIdx] = useState(0);
  const ex = EXAMPLES[idx];

  return (
    <div className="my-6 bg-card border border-border rounded-sm p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Play size={14} className="text-rubric shrink-0" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-rubric flex-1">
          Visualização — word alignment
        </span>
        <div className="flex gap-1 flex-wrap">
          {EXAMPLES.map((e, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`px-2.5 py-1 font-mono text-[10px] rounded-sm transition border ${
                idx === i
                  ? "bg-ink text-paper border-transparent"
                  : "bg-background border-border text-muted-foreground"
              }`}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-background border border-border rounded-sm p-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${
            Math.max(ex.source.length, ex.target.length) * TOKEN_W + 40
          } 180`}
          className="w-full min-w-[300px]"
          preserveAspectRatio="xMidYMid meet"
        >
          {ex.alignments.map(([sIdx, tIdx], i) => (
            <line
              key={i}
              x1={20 + sIdx * TOKEN_W + TOKEN_W / 2}
              y1={SOURCE_Y + 28}
              x2={20 + tIdx * TOKEN_W + TOKEN_W / 2}
              y2={TARGET_Y}
              stroke="#c7502e"
              strokeWidth="1.5"
              strokeOpacity="0.5"
              className="animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}

          {ex.source.map((tok, i) => (
            <g
              key={`s-${i}`}
              className="animate-fade-in"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <rect
                x={20 + i * TOKEN_W}
                y={SOURCE_Y}
                width={TOKEN_W - 8}
                height="28"
                rx="4"
                fill="#ede4d0"
                stroke="rgba(26,21,18,0.3)"
                strokeWidth="1"
              />
              <text
                x={20 + i * TOKEN_W + (TOKEN_W - 8) / 2}
                y={SOURCE_Y + 18}
                textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
                fontSize="11"
                fill="#1a1512"
              >
                {tok}
              </text>
            </g>
          ))}

          {ex.target.map((tok, i) => (
            <g
              key={`t-${i}`}
              className="animate-fade-in"
              style={{
                animationDelay: `${(i + ex.source.length) * 80}ms`,
              }}
            >
              <rect
                x={20 + i * TOKEN_W}
                y={TARGET_Y}
                width={TOKEN_W - 8}
                height="28"
                rx="4"
                fill="rgba(199,80,46,0.15)"
                stroke="#c7502e"
                strokeWidth="1"
              />
              <text
                x={20 + i * TOKEN_W + (TOKEN_W - 8) / 2}
                y={TARGET_Y + 18}
                textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
                fontSize="11"
                fill="#1a1512"
              >
                {tok}
              </text>
            </g>
          ))}

          <text
            x="10"
            y={SOURCE_Y + 18}
            fontFamily="JetBrains Mono, monospace"
            fontSize="9"
            fill="rgba(26,21,18,0.4)"
            textAnchor="end"
          >
            EN
          </text>
          <text
            x="10"
            y={TARGET_Y + 18}
            fontFamily="JetBrains Mono, monospace"
            fontSize="9"
            fill="rgba(26,21,18,0.4)"
            textAnchor="end"
          >
            PT
          </text>
        </svg>
      </div>

      <p className="mt-5 font-serif italic text-[12px] sm:text-[13px] text-muted-foreground border-t border-border pt-3">
        Alinhamento{" "}
        <span className="bg-rubric/15 px-1">raramente é 1-para-1</span>.
        Tradução automática neural com atenção{" "}
        <span className="text-rubric">aprende algo muito parecido</span> sem
        supervisão explícita.
      </p>
    </div>
  );
}
