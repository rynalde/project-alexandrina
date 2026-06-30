import Link from "next/link";
import { ArrowRight, BookOpen, CircleCheck } from "lucide-react";
import type { Course } from "@/lib/courses";

interface Props {
  course: Course;
}

export default function CourseCard({ course }: Props) {
  return (
    <Link
      href={`/cursos/${course.slug}`}
      className="group block rounded-xl border border-border bg-card p-6 sm:p-8 transition hover:border-rubric/40 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-rubric">
            {course.vol}
          </span>
          <h2 className="font-serif text-xl sm:text-2xl italic text-ink mt-1 leading-tight text-balance">
            {course.title}
          </h2>
          <p className="font-sans text-sm text-ink-fade mt-1">{course.subtitle}</p>
        </div>
        <ArrowRight
          size={18}
          className="text-ink-fade group-hover:text-rubric group-hover:translate-x-0.5 transition shrink-0 mt-1"
        />
      </div>

      <p className="font-sans text-sm leading-relaxed text-ink/80 mb-5 text-pretty">
        {course.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {course.topics.map((t) => (
          <span
            key={t}
            className="font-mono text-[10px] px-2 py-0.5 rounded-full border border-border text-ink-fade"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-5 pt-4 border-t border-border">
        <div className="flex items-center gap-1.5 text-ink-fade">
          <BookOpen size={13} />
          <span className="font-mono text-[11px]">
            {course.sectionCount} seções
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-ink-fade">
          <CircleCheck size={13} />
          <span className="font-mono text-[11px]">
            {course.questionCount} questões
          </span>
        </div>
      </div>
    </Link>
  );
}
