import QuizBlock from "@/components/quiz/QuizBlock";
import { METRICS_QUESTIONS } from "@/lib/metrics-data";

interface Props {
  topic: string;
  title?: string;
}

export default function MetricsQuizBlock({ topic, title }: Props) {
  return <QuizBlock topic={topic} title={title} source={METRICS_QUESTIONS} />;
}
