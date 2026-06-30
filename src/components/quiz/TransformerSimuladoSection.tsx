import SectionHeader from "@/components/shared/SectionHeader";
import Simulado from "@/components/quiz/Simulado";
import { TRANSFORMER_QUESTIONS, TRANSFORMER_TOPIC_LABELS } from "@/lib/transformer-data";

export default function TransformerSimuladoSection() {
  return (
    <div>
      <SectionHeader
        num="∞"
        title="Simulado Final"
        subtitle="25 questões no estilo da prova"
      />
      <p className="font-sans text-sm sm:text-[15px] leading-[1.75] text-ink mb-2 max-w-[68ch]">
        Simulado completo do módulo Transformer. Responda todas as questões e
        clique em <em>Submeter</em> para ver o resultado, breakdown por tópico e
        explicação de cada item.
      </p>
      <Simulado
        questions={TRANSFORMER_QUESTIONS}
        topicLabels={TRANSFORMER_TOPIC_LABELS}
      />
    </div>
  );
}
