import SectionHeader from "@/components/shared/SectionHeader";
import Simulado from "@/components/quiz/Simulado";
import {
  RANTIA_QUESTIONS,
  RANTIA_TOPIC_LABELS,
} from "@/lib/rantia-data";

export default function RantiaSimuladoSection() {
  return (
    <div>
      <SectionHeader
        num="∞"
        title="Simulado Final"
        subtitle="25 questões estilo prova"
        vol="vol. ix"
      />
      <p className="font-sans text-sm sm:text-[15px] leading-[1.75] text-ink mb-2 max-w-[68ch]">
        Simulado completo de RAINTIA / Ambientes Inteligentes. Responda tudo e
        clique em <em>Submeter</em> para ver o resultado, os tópicos fracos e a
        explicação de cada item.
      </p>
      <Simulado
        questions={RANTIA_QUESTIONS}
        topicLabels={RANTIA_TOPIC_LABELS}
      />
    </div>
  );
}
