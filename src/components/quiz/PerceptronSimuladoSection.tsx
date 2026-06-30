import SectionHeader from "@/components/shared/SectionHeader";
import Simulado from "@/components/quiz/Simulado";
import {
  PERCEPTRON_QUESTIONS,
  PERCEPTRON_TOPIC_LABELS,
} from "@/lib/perceptron-data";

export default function PerceptronSimuladoSection() {
  return (
    <div>
      <SectionHeader
        num="∞"
        title="Simulado Final"
        subtitle="25 questões estilo prova"
        vol="vol. vi"
      />
      <p className="font-sans text-sm sm:text-[15px] leading-[1.75] text-ink mb-2 max-w-[68ch]">
        Simulado completo de perceptrons geométricos. Responda tudo e clique em{" "}
        <em>Submeter</em> para ver o resultado, os tópicos fracos e a explicação
        de cada item.
      </p>
      <Simulado
        questions={PERCEPTRON_QUESTIONS}
        topicLabels={PERCEPTRON_TOPIC_LABELS}
      />
    </div>
  );
}
