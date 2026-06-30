"use client";

import { type ComponentType } from "react";
import { PERCEPTRON_SECTIONS } from "@/lib/perceptron-data";
import CoursePage from "@/components/course/CoursePage";
import PerceptronSimuladoSection from "@/components/quiz/PerceptronSimuladoSection";

import InicioSection from "@/content/cursos/perceptrons-geometria/inicio.mdx";
import MethodSection from "@/content/cursos/perceptrons-geometria/method.mdx";
import LinePlaneSection from "@/content/cursos/perceptrons-geometria/line-plane.mdx";
import LogicSection from "@/content/cursos/perceptrons-geometria/logic.mdx";
import RegionsSection from "@/content/cursos/perceptrons-geometria/regions.mdx";
import EllipsesSection from "@/content/cursos/perceptrons-geometria/ellipses.mdx";
import PlanesSection from "@/content/cursos/perceptrons-geometria/planes.mdx";
import ReviewSection from "@/content/cursos/perceptrons-geometria/review.mdx";

const SECTION_MAP: Record<string, ComponentType> = {
  inicio: InicioSection,
  method: MethodSection,
  line_plane: LinePlaneSection,
  logic: LogicSection,
  regions: RegionsSection,
  ellipses: EllipsesSection,
  planes: PlanesSection,
  review: ReviewSection,
  simulado: PerceptronSimuladoSection,
};

export default function PerceptronsGeometryPage() {
  return (
    <CoursePage
      sections={PERCEPTRON_SECTIONS}
      sectionComponents={SECTION_MAP}
      vol="vol. vi"
      courseTitle="Perceptrons e Geometria"
    />
  );
}
