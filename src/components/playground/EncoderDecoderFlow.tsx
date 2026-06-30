"use client";

import { useState, useEffect } from "react";
import { Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const SOURCE = ["the", "cat", "sat"];
const TARGET = ["o", "gato", "sentou"];
const TOTAL = SOURCE.length + TARGET.length + 1;

export default function EncoderDecoderFlow() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const iv = setInterval(() => setStep((s) => (s + 1) % TOTAL), 1500);
    return () => clearInterval(iv);
  }, [playing]);

  const inEncoder = step < SOURCE.length;
  const atContext = step === SOURCE.length;
  const inDecoder = step > SOURCE.length;
  const decStep = inDecoder ? step - SOURCE.length - 1 : -1;

  return (
    <div className="my-6 bg-card border border-border rounded-sm p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Play size={14} className="text-rubric shrink-0" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-rubric flex-1">
          Animação — fluxo encoder-decoder
        </span>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPlaying((p) => !p)}
            className="font-mono text-[11px]"
          >
            {playing ? "⏸" : "▶"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStep(0)}
            className="font-mono text-[11px]"
          >
            <RotateCcw size={11} />
          </Button>
        </div>
      </div>

      <div className="bg-background border border-border rounded-sm p-4 overflow-x-auto">
        <svg
          viewBox="0 0 520 280"
          className="w-full min-w-[440px]"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <marker
              id="arrowED"
              markerWidth="6"
              markerHeight="6"
              refX="5"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 6 3, 0 6" fill="#c7502e" />
            </marker>
            <marker
              id="arrowEDfade"
              markerWidth="6"
              markerHeight="6"
              refX="5"
              refY="3"
              orient="auto"
            >
              <polygon
                points="0 0, 6 3, 0 6"
                fill="rgba(26,21,18,0.25)"
              />
            </marker>
          </defs>

          {["ENCODER", "CONTEXT", "DECODER"].map((label, i) => (
            <text
              key={label}
              x={[80, 260, 430][i]}
              y="20"
              fontFamily="JetBrains Mono, monospace"
              fontSize="10"
              textAnchor="middle"
              fill="rgba(26,21,18,0.5)"
            >
              {label}
            </text>
          ))}

          {/* Source tokens */}
          {SOURCE.map((tok, i) => {
            const x = 30 + i * 50;
            const active = inEncoder && step >= i;
            return (
              <g key={`src-${i}`}>
                <rect
                  x={x - 20}
                  y="220"
                  width="40"
                  height="28"
                  rx="4"
                  fill={active ? "#ede4d0" : "#f5efe3"}
                  stroke={
                    active ? "rgba(26,21,18,0.4)" : "rgba(26,21,18,0.2)"
                  }
                  strokeWidth="1"
                  style={{ transition: "all 0.4s" }}
                />
                <text
                  x={x}
                  y="239"
                  textAnchor="middle"
                  fontFamily="JetBrains Mono, monospace"
                  fontSize="11"
                  fill={active ? "#1a1512" : "rgba(26,21,18,0.4)"}
                >
                  {tok}
                </text>
              </g>
            );
          })}

          {/* Encoder cells */}
          {SOURCE.map((_, i) => {
            const x = 30 + i * 50;
            const processed = step > i;
            const active = inEncoder && step === i;
            return (
              <g key={`enc-${i}`}>
                <rect
                  x={x - 20}
                  y="100"
                  width="40"
                  height="50"
                  rx="4"
                  fill={
                    active
                      ? "#c7502e"
                      : processed
                      ? "rgba(199,80,46,0.25)"
                      : "#ede4d0"
                  }
                  stroke={
                    active
                      ? "#c7502e"
                      : processed
                      ? "rgba(199,80,46,0.5)"
                      : "rgba(26,21,18,0.2)"
                  }
                  strokeWidth={active ? 1.5 : 1}
                  style={{ transition: "all 0.4s" }}
                />
                <text
                  x={x}
                  y="125"
                  textAnchor="middle"
                  fontFamily="JetBrains Mono, monospace"
                  fontSize="9"
                  fill={active ? "#f5efe3" : "rgba(26,21,18,0.5)"}
                >
                  RNN
                </text>
                <text
                  x={x}
                  y="138"
                  textAnchor="middle"
                  fontFamily="JetBrains Mono, monospace"
                  fontSize="9"
                  fill={active ? "#f5efe3" : "rgba(26,21,18,0.5)"}
                >
                  h{i + 1}
                </text>
                <line
                  x1={x}
                  y1="218"
                  x2={x}
                  y2="152"
                  stroke={active ? "#c7502e" : "rgba(26,21,18,0.25)"}
                  strokeWidth={active ? 1.5 : 1}
                  markerEnd={
                    active ? "url(#arrowED)" : "url(#arrowEDfade)"
                  }
                  style={{ transition: "all 0.4s" }}
                />
              </g>
            );
          })}

          {/* Encoder links */}
          {[0, 1].map((i) => {
            const active = step > i;
            return (
              <line
                key={`link-${i}`}
                x1={30 + i * 50 + 20}
                y1="125"
                x2={30 + (i + 1) * 50 - 20}
                y2="125"
                stroke={active ? "#c7502e" : "rgba(26,21,18,0.2)"}
                strokeWidth={active ? 1.5 : 1}
                markerEnd={active ? "url(#arrowED)" : "url(#arrowEDfade)"}
                style={{ transition: "all 0.4s" }}
              />
            );
          })}

          {/* Context vector */}
          {(() => {
            const active = atContext || inDecoder;
            return (
              <g>
                <rect
                  x="220"
                  y="100"
                  width="80"
                  height="50"
                  rx="4"
                  fill={active ? "rgba(199,80,46,0.25)" : "#ede4d0"}
                  stroke={active ? "#c7502e" : "rgba(26,21,18,0.25)"}
                  strokeWidth={active ? 2 : 1}
                  className={atContext ? "animate-pulse-slow" : ""}
                  style={{ transition: "all 0.4s" }}
                />
                <text
                  x="260"
                  y="123"
                  textAnchor="middle"
                  fontFamily="JetBrains Mono, monospace"
                  fontSize="10"
                  fill={active ? "#c7502e" : "rgba(26,21,18,0.5)"}
                  fontWeight={active ? 600 : 400}
                >
                  context
                </text>
                <text
                  x="260"
                  y="138"
                  textAnchor="middle"
                  fontFamily="JetBrains Mono, monospace"
                  fontSize="10"
                  fill={active ? "#c7502e" : "rgba(26,21,18,0.5)"}
                >
                  vector
                </text>
                <line
                  x1="150"
                  y1="125"
                  x2="218"
                  y2="125"
                  stroke={active ? "#c7502e" : "rgba(26,21,18,0.2)"}
                  strokeWidth={active ? 1.5 : 1}
                  markerEnd={active ? "url(#arrowED)" : "url(#arrowEDfade)"}
                  style={{ transition: "all 0.4s" }}
                />
              </g>
            );
          })()}

          {/* Decoder cells */}
          {TARGET.map((tok, i) => {
            const x = 350 + i * 50;
            const active = inDecoder && decStep === i;
            const done = inDecoder && decStep > i;
            return (
              <g key={`dec-${i}`}>
                <rect
                  x={x - 20}
                  y="100"
                  width="40"
                  height="50"
                  rx="4"
                  fill={
                    active
                      ? "#c7502e"
                      : done
                      ? "rgba(199,80,46,0.25)"
                      : "#ede4d0"
                  }
                  stroke={
                    active
                      ? "#c7502e"
                      : done
                      ? "rgba(199,80,46,0.5)"
                      : "rgba(26,21,18,0.2)"
                  }
                  strokeWidth={active ? 1.5 : 1}
                  style={{ transition: "all 0.4s" }}
                />
                <text
                  x={x}
                  y="125"
                  textAnchor="middle"
                  fontFamily="JetBrains Mono, monospace"
                  fontSize="9"
                  fill={active ? "#f5efe3" : "rgba(26,21,18,0.5)"}
                >
                  RNN
                </text>
                <text
                  x={x}
                  y="138"
                  textAnchor="middle"
                  fontFamily="JetBrains Mono, monospace"
                  fontSize="9"
                  fill={active ? "#f5efe3" : "rgba(26,21,18,0.5)"}
                >
                  s{i + 1}
                </text>
                <rect
                  x={x - 20}
                  y="40"
                  width="40"
                  height="28"
                  rx="4"
                  fill={
                    active
                      ? "#c7502e"
                      : done
                      ? "rgba(199,80,46,0.15)"
                      : "#f5efe3"
                  }
                  stroke={
                    active || done
                      ? "rgba(199,80,46,0.5)"
                      : "rgba(26,21,18,0.2)"
                  }
                  strokeWidth="1"
                  style={{ transition: "all 0.4s" }}
                />
                <text
                  x={x}
                  y="59"
                  textAnchor="middle"
                  fontFamily="JetBrains Mono, monospace"
                  fontSize="11"
                  fill={
                    active ? "#f5efe3" : done ? "#1a1512" : "rgba(26,21,18,0.4)"
                  }
                >
                  {active || done ? tok : "?"}
                </text>
                <line
                  x1={x}
                  y1="98"
                  x2={x}
                  y2="70"
                  stroke={
                    active
                      ? "#c7502e"
                      : done
                      ? "rgba(199,80,46,0.4)"
                      : "rgba(26,21,18,0.2)"
                  }
                  strokeWidth={active ? 1.5 : 1}
                  markerEnd={active ? "url(#arrowED)" : "url(#arrowEDfade)"}
                  style={{ transition: "all 0.4s" }}
                />
              </g>
            );
          })}

          {/* Context → decoder link */}
          <line
            x1="300"
            y1="125"
            x2="328"
            y2="125"
            stroke={inDecoder ? "#c7502e" : "rgba(26,21,18,0.2)"}
            strokeWidth={inDecoder ? 1.5 : 1}
            markerEnd={inDecoder ? "url(#arrowED)" : "url(#arrowEDfade)"}
            style={{ transition: "all 0.4s" }}
          />

          {/* Decoder links */}
          {[0, 1].map((i) => {
            const active = inDecoder && decStep > i;
            return (
              <line
                key={`dlink-${i}`}
                x1={350 + i * 50 + 20}
                y1="125"
                x2={350 + (i + 1) * 50 - 20}
                y2="125"
                stroke={active ? "#c7502e" : "rgba(26,21,18,0.2)"}
                strokeWidth={active ? 1.5 : 1}
                markerEnd={active ? "url(#arrowED)" : "url(#arrowEDfade)"}
                style={{ transition: "all 0.4s" }}
              />
            );
          })}

          <line
            x1="180"
            y1="190"
            x2="180"
            y2="80"
            stroke="rgba(26,21,18,0.1)"
            strokeDasharray="2,3"
          />
          <line
            x1="320"
            y1="190"
            x2="320"
            y2="80"
            stroke="rgba(26,21,18,0.1)"
            strokeDasharray="2,3"
          />
          <text
            x="260"
            y="265"
            fontFamily="JetBrains Mono, monospace"
            fontSize="9"
            textAnchor="middle"
            fill="rgba(26,21,18,0.4)"
          >
            input → hidden states → context → outputs
          </text>
        </svg>
      </div>

      <div className="mt-3 font-mono text-[10px] sm:text-[11px] text-ink-fade text-center">
        {inEncoder
          ? `encoder lê "${SOURCE[step]}"`
          : atContext
          ? "context vector consolidado"
          : inDecoder && decStep < TARGET.length
          ? `decoder gera "${TARGET[decStep]}"`
          : "sequência traduzida"}
      </div>

      <p className="mt-5 font-serif italic text-[12px] sm:text-[13px] text-muted-foreground border-t border-border pt-3">
        Encoder consome o source da esquerda para a direita; o último estado vira o{" "}
        <span className="text-rubric">context vector</span>; decoder o consome e
        gera o target token a token.
      </p>
    </div>
  );
}
