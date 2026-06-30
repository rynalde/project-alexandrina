"use client";

import { type ComponentType } from "react";
import { SECTIONS } from "@/lib/data";
import CoursePage from "@/components/course/CoursePage";
import SimuladoSection from "@/components/quiz/SimuladoSection";

import InicioSection from "@/content/cursos/seq2seq/inicio.mdx";
import Seq2SeqSection from "@/content/cursos/seq2seq/seq2seq.mdx";
import EncDecSection from "@/content/cursos/seq2seq/enc-dec.mdx";
import ContextSection from "@/content/cursos/seq2seq/context.mdx";
import AttentionSection from "@/content/cursos/seq2seq/attention.mdx";
import AlignSection from "@/content/cursos/seq2seq/align.mdx";
import SoftmaxSection from "@/content/cursos/seq2seq/softmax.mdx";
import DecoderSection from "@/content/cursos/seq2seq/decoder.mdx";
import AppsSection from "@/content/cursos/seq2seq/apps.mdx";

const SECTION_MAP: Record<string, ComponentType> = {
  inicio: InicioSection,
  seq2seq: Seq2SeqSection,
  enc_dec: EncDecSection,
  context: ContextSection,
  attention: AttentionSection,
  align: AlignSection,
  softmax: SoftmaxSection,
  decoder: DecoderSection,
  apps: AppsSection,
  simulado: SimuladoSection,
};

export default function Seq2SeqPage() {
  return (
    <CoursePage
      sections={SECTIONS}
      sectionComponents={SECTION_MAP}
      vol="vol. iv"
      courseTitle="Seq2Seq & Atenção"
    />
  );
}
