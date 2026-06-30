import { TRANSFORMER_QUESTIONS } from "@/lib/transformer-data";
import QuizBlock from "@/components/quiz/QuizBlock";

interface Props {
  topic: string;
  title?: string;
}

export default function TransformerQuizBlock({ topic, title }: Props) {
  return <QuizBlock topic={topic} title={title} source={TRANSFORMER_QUESTIONS} />;
}
