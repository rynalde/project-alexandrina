"use client";

import { type ComponentType } from "react";
import { WORLD_MODELS_SECTIONS } from "@/lib/world-models-data";
import { WORLD_MODELS_LEARNING_CONFIG } from "@/lib/world-models-learning";
import CoursePage from "@/components/course/CoursePage";
import WorldModelsSimuladoSection from "@/components/quiz/WorldModelsSimuladoSection";

import InicioSection from "@/content/cursos/world-models/inicio.mdx";
import IngredientsSection from "@/content/cursos/world-models/ingredients.mdx";
import PixelLatentSection from "@/content/cursos/world-models/pixel-latent.mdx";
import CollapseSection from "@/content/cursos/world-models/collapse.mdx";
import FamilySection from "@/content/cursos/world-models/family.mdx";
import IJepaSection from "@/content/cursos/world-models/ijepa.mdx";
import VJepaSection from "@/content/cursos/world-models/vjepa.mdx";
import UsageSection from "@/content/cursos/world-models/usage.mdx";
import RoadmapSection from "@/content/cursos/world-models/roadmap.mdx";

const SECTION_MAP: Record<string, ComponentType> = {
  inicio: InicioSection,
  ingredients: IngredientsSection,
  pixel_latent: PixelLatentSection,
  collapse: CollapseSection,
  family: FamilySection,
  ijepa: IJepaSection,
  vjepa: VJepaSection,
  usage: UsageSection,
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
