"use client";

import { type ComponentType } from "react";
import { SIMAGIA_SECTIONS } from "@/lib/simagia-data";
import CoursePage from "@/components/course/CoursePage";
import SimagiaSimuladoSection from "@/components/quiz/SimagiaSimuladoSection";

import InicioSection from "@/content/cursos/simagia/inicio.mdx";
import AgentesAmbientesSection from "@/content/cursos/simagia/agentes-ambientes.mdx";
import ArquiteturasSection from "@/content/cursos/simagia/arquiteturas.mdx";
import SistemasMultiAgenteSection from "@/content/cursos/simagia/sistemas-multi-agente.mdx";
import CoordenacaoSection from "@/content/cursos/simagia/coordenacao.mdx";
import NegociacaoSection from "@/content/cursos/simagia/negociacao.mdx";
import StandardsPlataformasSection from "@/content/cursos/simagia/standards-plataformas.mdx";
import LlmMarlSection from "@/content/cursos/simagia/llm-marl.mdx";
import AssessmentSection from "@/content/cursos/simagia/assessment.mdx";
import AnswerKeySection from "@/content/cursos/simagia/answer-key.mdx";

const SECTION_MAP: Record<string, ComponentType> = {
  inicio: InicioSection,
  agentes_ambientes: AgentesAmbientesSection,
  arquiteturas: ArquiteturasSection,
  sistemas_multi_agente: SistemasMultiAgenteSection,
  coordenacao: CoordenacaoSection,
  negociacao: NegociacaoSection,
  standards_plataformas: StandardsPlataformasSection,
  llm_marl: LlmMarlSection,
  assessment: AssessmentSection,
  answer_key: AnswerKeySection,
  simulado: SimagiaSimuladoSection,
};

export default function SimagiaPage() {
  return (
    <CoursePage
      sections={SIMAGIA_SECTIONS}
      sectionComponents={SECTION_MAP}
      vol="vol. viii"
      courseTitle="Sistemas Multi-Agente"
    />
  );
}
