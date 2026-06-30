import QuizBlock from "@/components/quiz/QuizBlock";
import { PERCEPTRON_QUESTIONS } from "@/lib/perceptron-data";

interface Props {
  topic: string;
  title?: string;
}

export default function PerceptronQuizBlock({ topic, title }: Props) {
  return <QuizBlock topic={topic} title={title} source={PERCEPTRON_QUESTIONS} />;
}
