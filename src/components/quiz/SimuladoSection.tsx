import SectionHeader from "@/components/shared/SectionHeader";
import Simulado from "@/components/quiz/Simulado";

export default function SimuladoSection() {
  return (
    <div>
      <SectionHeader
        num="∞"
        title="Simulado Final"
        subtitle="25 questões no estilo da prova"
      />
      <p className="font-sans text-sm sm:text-[15px] leading-[1.75] text-ink mb-2 max-w-[68ch]">
        Simulado completo do módulo. Responda todas as questões e clique em{" "}
        <em>Submeter</em> para ver o resultado, breakdown por tópico e
        explicação de cada item.
      </p>
      <Simulado />
    </div>
  );
}
