"use client";

import ExamGame from "@/components/exam/ExamGame";
import { RANTIA_QUESTIONS } from "@/lib/rantia-data";
import type { ExamQuestion } from "@/lib/exam";

const rantiaQuestions: ExamQuestion[] = RANTIA_QUESTIONS.map((q) => ({
  id: `rantia-${q.id}`,
  year: 2024,
  exam: "Rantia",
  multiple_answers: false,
  select: "correct",
  question: q.q,
  alternatives: q.opts.map((opt, i) => ({ id: i, text: opt })),
  answers: [q.correct],
  answer_confidence: "high",
  notes: q.exp,
}));

const rantiaMetadata = {
  course: "RAINTIA / Ambientes Inteligentes",
  institution: "Avaliação Final",
};

export default function RantiaAssessment() {
  return (
    <div className="absolute inset-0 z-50 bg-background">
      <ExamGame
        customQuestions={rantiaQuestions}
        customMetadata={rantiaMetadata}
      />
    </div>
  );
}
