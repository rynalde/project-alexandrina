"use client";

import { type ComponentType } from "react";
import { WORLD_MODELS_SECTIONS } from "@/lib/world-models-data";
import { WORLD_MODELS_LEARNING_CONFIG } from "@/lib/world-models-learning";
import CoursePage from "@/components/course/CoursePage";
import WorldModelsSimuladoSection from "@/components/quiz/WorldModelsSimuladoSection";

import InicioSection from "@/content/cursos/world-models/inicio.mdx";
import IngredientsSection from "@/content/cursos/world-models/ingredients.mdx";
import RoadmapSection from "@/content/cursos/world-models/roadmap.mdx";

const SECTION_MAP: Record<string, ComponentType> = {
  inicio: InicioSection,
  ingredients: IngredientsSection,
  roadmap: RoadmapSection,
  simulado: WorldModelsSimuladoSection,
};

export default function WorldModelsPage() {
  return (
    <CoursePage
      sections={WORLD_MODELS_SECTIONS}
      sectionComponents={SECTION_MAP}
      vol="vol. x"
      courseTitle="World Models"
      learningConfig={WORLD_MODELS_LEARNING_CONFIG}
    />
  );
}
