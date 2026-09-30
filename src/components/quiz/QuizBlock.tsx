"use client";

import { QUESTIONS, type Question } from "@/lib/data";
import { QuestionStepper } from "@/components/learning/Choice";

interface Props {
  topic: string;
  title?: string;
  source?: Question[];
}

export default function QuizBlock({ topic, title = "Mini-quiz", source = QUESTIONS }: Props) {
  return (
    <QuestionStepper
      questions={source.filter((q) => q.topic === topic)}
      title={title}
    />
  );
}

/** A quiz always gets a screen of its own (see Beats). */
QuizBlock.screen = true;
