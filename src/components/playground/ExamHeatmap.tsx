import { EXAM_HISTORY, EXAM_YEARS, TOPIC_LABELS } from "@/lib/data";

export default function ExamHeatmap() {
  const sorted = Object.entries(EXAM_HISTORY).sort(
    (a, b) => b[1].filter(Boolean).length - a[1].filter(Boolean).length
  );

  return (
    <div className="my-8 bg-card border border-border rounded-sm p-4 sm:p-6">
      <div className="mb-5">
        <div className="font-mono text-[10px] uppercase tracking-widest text-rubric">
          frequência no exame
        </div>
        <h3 className="font-serif italic text-lg sm:text-xl text-ink mt-1">
          O que caiu em cada ano
        </h3>
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full mx-4 sm:mx-0">
          <thead>
            <tr>
              <th className="text-left pb-3 pr-3 sm:pr-4 font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-ink-fade">
                tópico
              </th>
              {EXAM_YEARS.map((y) => (
                <th
                  key={y}
                  className="pb-3 px-1 sm:px-2 font-mono text-[9px] sm:text-[10px] text-ink-fade w-10 sm:w-12"
                >
                  {y}
                </th>
              ))}
              <th className="pb-3 pl-2 sm:pl-3 font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-ink-fade">
                ×
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(([topic, years]) => {
              const total = years.filter(Boolean).length;
              return (
                <tr key={topic} className="border-b border-border/30">
                  <td className="py-2 sm:py-2.5 pr-3 sm:pr-4 font-sans text-[12px] sm:text-sm text-ink whitespace-nowrap">
                    {TOPIC_LABELS[topic]}
                  </td>
                  {years.map((hit, i) => (
                    <td key={i} className="py-2 sm:py-2.5 px-1 sm:px-2 text-center">
                      <div
                        className="w-6 h-6 sm:w-8 sm:h-8 mx-auto rounded-sm transition"
                        style={
                          hit
                            ? { background: "#c7502e" }
                            : {
                                background: "#f5efe3",
                                border: "1px solid rgba(26,21,18,0.12)",
                              }
                        }
                      />
                    </td>
                  ))}
                  <td className="py-2 sm:py-2.5 pl-2 sm:pl-3 font-mono text-[12px] sm:text-[13px] text-ink">
                    {total}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-5 font-serif italic text-[12px] sm:text-[13px] text-muted-foreground border-t border-border pt-3">
        Atenção e Seq2Seq lideram em recorrência. Os tópicos sem aparições
        explícitas (context vector, decoder, aplicações) podem ser justamente os
        que vão cair pela primeira vez em 2026.
      </p>
    </div>
  );
}
