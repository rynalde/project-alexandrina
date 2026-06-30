import SectionHeader from "@/components/shared/SectionHeader";
import Simulado from "@/components/quiz/Simulado";
import { METRICS_QUESTIONS, METRICS_TOPIC_LABELS } from "@/lib/metrics-data";

export default function MetricsSimuladoSection() {
  return (
    <div>
      <SectionHeader
        num="∞"
        title="Simulado Final"
        subtitle="20 questões estilo prova"
        vol="vol. vii"
      />
      <p className="font-sans text-sm sm:text-[15px] leading-[1.75] text-ink mb-2 max-w-[68ch]">
        Simulado focado em PV/PF/NV/NF, accuracy, precision, recall e leitura de
        regiões no caso elipse real versus retângulo previsto.
      </p>
      <Simulado questions={METRICS_QUESTIONS} topicLabels={METRICS_TOPIC_LABELS} />
    </div>
  );
}
