import SectionHeader from "@/components/shared/SectionHeader";
import Simulado from "@/components/quiz/Simulado";
import {
  WORLD_MODELS_QUESTIONS,
  WORLD_MODELS_TOPIC_LABELS,
} from "@/lib/world-models-data";

export default function WorldModelsSimuladoSection() {
  return (
    <Simulado questions={WORLD_MODELS_QUESTIONS} topicLabels={WORLD_MODELS_TOPIC_LABELS}>
      <SectionHeader
        num="∞"
        title="Final Simulation"
        subtitle="exam-style questions, growing as chapters land"
        vol="vol. x"
      />
      <p className="font-sans text-sm sm:text-[15px] leading-[1.75] text-ink max-w-[68ch]">
        Cumulative simulation for vol. x, one question per screen. Nothing is
        marked until you <em>Submit</em> at the end; then you get the score, the
        per-topic breakdown, and a review of every answer with its explanation.
      </p>
    </Simulado>
  );
}
