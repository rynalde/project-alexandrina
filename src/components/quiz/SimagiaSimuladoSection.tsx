import SectionHeader from "@/components/shared/SectionHeader";
import Simulado from "@/components/quiz/Simulado";
import {
  SIMAGIA_QUESTIONS,
  SIMAGIA_TOPIC_LABELS,
} from "@/lib/simagia-data";

export default function SimagiaSimuladoSection() {
  return (
    <div>
      <SectionHeader
        num="∞"
        title="Simulado Final"
        subtitle="25 questões estilo prova"
        vol="vol. viii"
      />
      <p className="font-sans text-sm sm:text-[15px] leading-[1.75] text-ink mb-2 max-w-[68ch]">
        Simulado completo de Sistemas Multi-Agente. Responda tudo e clique em{" "}
        <em>Submeter</em> para ver o resultado, os tópicos fracos e a explicação
        de cada item.
      </p>
      <Simulado
        questions={SIMAGIA_QUESTIONS}
        topicLabels={SIMAGIA_TOPIC_LABELS}
      />
    </div>
  );
}
