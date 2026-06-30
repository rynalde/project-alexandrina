"use client";

import { type ComponentType } from "react";
import { TRANSFORMER_SECTIONS } from "@/lib/transformer-data";
import CoursePage from "@/components/course/CoursePage";
import TransformerSimuladoSection from "@/components/quiz/TransformerSimuladoSection";

import InicioSection from "@/content/cursos/transformer/inicio.mdx";
import SelfAttentionSection from "@/content/cursos/transformer/self-attention.mdx";
import EncDecAttentionSection from "@/content/cursos/transformer/enc-dec-attention.mdx";
import MultiHeadSection from "@/content/cursos/transformer/multi-head.mdx";
import PositionalSection from "@/content/cursos/transformer/positional.mdx";
import LayerNormSection from "@/content/cursos/transformer/layer-norm.mdx";
import ArchitectureSection from "@/content/cursos/transformer/architecture.mdx";
import MaskedSection from "@/content/cursos/transformer/masked.mdx";
import OutputSection from "@/content/cursos/transformer/output.mdx";

const SECTION_MAP: Record<string, ComponentType> = {
  inicio: InicioSection,
  self_attention: SelfAttentionSection,
  enc_dec_attention: EncDecAttentionSection,
  multi_head: MultiHeadSection,
  positional: PositionalSection,
  layer_norm: LayerNormSection,
  architecture: ArchitectureSection,
  masked: MaskedSection,
  output: OutputSection,
  simulado: TransformerSimuladoSection,
};

export default function TransformerPage() {
  return (
    <CoursePage
      sections={TRANSFORMER_SECTIONS}
      sectionComponents={SECTION_MAP}
      vol="vol. v"
      courseTitle="Transformer"
    />
  );
}
