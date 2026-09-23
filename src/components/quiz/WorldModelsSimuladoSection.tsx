import SectionHeader from "@/components/shared/SectionHeader";
import Simulado from "@/components/quiz/Simulado";
import {
  WORLD_MODELS_QUESTIONS,
  WORLD_MODELS_TOPIC_LABELS,
} from "@/lib/world-models-data";

export default function WorldModelsSimuladoSection() {
  return (
    <div>
      <SectionHeader
        num="∞"
        title="Final Simulation"
        subtitle="exam-style questions, growing as chapters land"
        vol="vol. x"
      />
      <p className="font-sans text-sm sm:text-[15px] leading-[1.75] text-ink mb-2 max-w-[68ch]">
        Cumulative simulation for vol. x. Answer everything and click{" "}
        <em>Submeter</em> to see the score, the per-topic breakdown and the
        explanation for each item.
      </p>
      <Simulado
        questions={WORLD_MODELS_QUESTIONS}
        topicLabels={WORLD_MODELS_TOPIC_LABELS}
      />
    </div>
  );
}
