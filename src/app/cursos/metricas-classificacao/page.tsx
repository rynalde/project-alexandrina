"use client";

import { type ComponentType } from "react";
import CoursePage from "@/components/course/CoursePage";
import MetricsSimuladoSection from "@/components/quiz/MetricsSimuladoSection";
import { METRICS_SECTIONS } from "@/lib/metrics-data";

import InicioSection from "@/content/cursos/metricas-classificacao/inicio.mdx";
import CountsSection from "@/content/cursos/metricas-classificacao/counts.mdx";
import FormulasSection from "@/content/cursos/metricas-classificacao/formulas.mdx";
import EllipseRectangleSection from "@/content/cursos/metricas-classificacao/ellipse-rectangle.mdx";
import TradeoffSection from "@/content/cursos/metricas-classificacao/tradeoff.mdx";
import Exam2024Section from "@/content/cursos/metricas-classificacao/exam2024.mdx";
import ReviewSection from "@/content/cursos/metricas-classificacao/review.mdx";

const SECTION_MAP: Record<string, ComponentType> = {
  inicio: InicioSection,
  counts: CountsSection,
  formulas: FormulasSection,
  ellipse_rectangle: EllipseRectangleSection,
  tradeoff: TradeoffSection,
  exam2024: Exam2024Section,
  review: ReviewSection,
  simulado: MetricsSimuladoSection,
};

export default function MetricsClassificationPage() {
  return (
    <CoursePage
      sections={METRICS_SECTIONS}
      sectionComponents={SECTION_MAP}
      vol="vol. vii"
      courseTitle="Métricas de Classificação"
    />
  );
}
