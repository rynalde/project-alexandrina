"use client";

import { useState } from "react";
import { GitBranch, ToggleLeft, ToggleRight } from "lucide-react";

function step(value: number) {
  return value >= 0 ? 1 : 0;
}

const rows = [
  { x1: 0, x2: 0 },
  { x1: 0, x2: 1 },
  { x1: 1, x2: 0 },
  { x1: 1, x2: 1 },
];

export default function PerceptronLogicGates() {
  const [x1, setX1] = useState(1);
  const [x2, setX2] = useState(0);

  const andValue = step(x1 + x2 - 1.5);
  const orValue = step(x1 + x2 - 0.5);
  const notX1 = step(-x1 + 0.5);
  const mixedValue = step(andValue + notX1 - 0.5);

  return (
    <div className="my-6 bg-card border border-border rounded-sm p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <GitBranch size={14} className="text-rubric shrink-0" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-rubric">
          simulador — portas lógicas com perceptrons
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="space-y-3">
          {[["x1", x1, setX1], ["x2", x2, setX2]].map(([label, value, setter]) => (
            <button
              key={label as string}
              type="button"
              onClick={() => (setter as (v: number) => void)((value as number) ? 0 : 1)}
              className={`w-full min-h-12 rounded-sm border px-3 py-2 flex items-center justify-between transition ${
                value
                  ? "border-rubric bg-rubric/10 text-rubric"
                  : "border-border bg-background text-ink-fade hover:text-ink"
              }`}
            >
              <span className="font-mono text-[11px] uppercase tracking-widest">{label as string}</span>
              <span className="inline-flex items-center gap-2 font-serif text-xl text-ink">
                {value ? <ToggleRight size={20} className="text-rubric" /> : <ToggleLeft size={20} />}
                {value as number}
              </span>
            </button>
          ))}

          <div className="bg-background border border-border rounded-sm p-3">
            <div className="font-mono text-[9px] uppercase tracking-widest text-ink-fade mb-2">
              expressão composta
            </div>
            <div className="font-mono text-[12px] text-ink leading-relaxed">
              (x1 AND x2) OR (NOT x1)
            </div>
            <div className="font-serif text-3xl text-rubric mt-2">{mixedValue}</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <GateCard
              title="AND"
              formula="step(x1 + x2 - 1.5)"
              value={andValue}
              note="só 1+1 passa"
            />
            <GateCard
              title="OR"
              formula="step(x1 + x2 - 0.5)"
              value={orValue}
              note="uma entrada basta"
            />
            <GateCard
              title="NOT x1"
              formula="step(-x1 + 0.5)"
              value={notX1}
              note="peso negativo inverte"
            />
          </div>

          <div className="overflow-x-auto bg-background border border-border rounded-sm p-3">
            <div className="font-mono text-[9px] uppercase tracking-widest text-ink-fade mb-2">
              tabela verdade
            </div>
            <table className="w-full min-w-[460px] border-collapse font-mono text-[11px] sm:text-[12px]">
              <thead>
                <tr className="text-ink-fade">
                  <th className="text-left py-2 font-normal">x1</th>
                  <th className="text-left py-2 font-normal">x2</th>
                  <th className="text-left py-2 font-normal">AND</th>
                  <th className="text-left py-2 font-normal">OR</th>
                  <th className="text-left py-2 font-normal">NOT x1</th>
                  <th className="text-left py-2 font-normal">(AND) OR (NOT)</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const rowAnd = step(row.x1 + row.x2 - 1.5);
                  const rowOr = step(row.x1 + row.x2 - 0.5);
                  const rowNot = step(-row.x1 + 0.5);
                  const rowMixed = step(rowAnd + rowNot - 0.5);
                  const active = row.x1 === x1 && row.x2 === x2;

                  return (
                    <tr
                      key={`${row.x1}-${row.x2}`}
                      className={`border-t border-border ${active ? "bg-rubric/10 text-ink" : "text-muted-foreground"}`}
                    >
                      <td className="py-2">{row.x1}</td>
                      <td className="py-2">{row.x2}</td>
                      <td className="py-2">{rowAnd}</td>
                      <td className="py-2">{rowOr}</td>
                      <td className="py-2">{rowNot}</td>
                      <td className="py-2 text-rubric">{rowMixed}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 font-mono text-[10px] text-center text-ink-fade">
            <div className="bg-background border border-border rounded-sm p-3">
              p1: AND
              <div className="font-serif text-2xl text-ink mt-1">{andValue}</div>
            </div>
            <span className="text-rubric">+</span>
            <div className="bg-background border border-border rounded-sm p-3">
              p2: NOT
              <div className="font-serif text-2xl text-ink mt-1">{notX1}</div>
            </div>
            <span className="text-rubric">→</span>
            <div className="bg-background border border-rubric/50 rounded-sm p-3">
              OR final
              <div className="font-serif text-2xl text-rubric mt-1">{mixedValue}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GateCard({
  title,
  formula,
  value,
  note,
}: {
  title: string;
  formula: string;
  value: number;
  note: string;
}) {
  return (
    <div className="bg-background border border-border rounded-sm p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="font-mono text-[10px] uppercase tracking-widest text-rubric">{title}</div>
        <div
          className={`h-7 w-7 rounded-sm border inline-flex items-center justify-center font-serif text-lg ${
            value ? "border-rubric bg-rubric/10 text-rubric" : "border-border text-ink-fade"
          }`}
        >
          {value}
        </div>
      </div>
      <div className="font-mono text-[10px] text-muted-foreground mt-3 leading-relaxed">{formula}</div>
      <div className="font-serif italic text-[12px] text-ink-fade mt-2">{note}</div>
    </div>
  );
}
