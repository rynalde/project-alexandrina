import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
import { COURSES } from "@/lib/courses";
import CourseCard from "@/components/dashboard/CourseCard";
import { EXAM_QUESTIONS } from "@/lib/exam";

export default function Home() {
  return (
    <div className="paper-texture min-h-screen font-sans text-ink">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12 sm:py-20">
        {/* Hero */}
        <header className="mb-12 sm:mb-16">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-rubric mb-3">
            cadernos de estudo
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl italic text-ink leading-tight text-balance">
            NLP & Deep Learning
          </h1>
          <p className="font-sans text-sm sm:text-base text-ink-fade mt-4 max-w-[55ch] text-pretty leading-relaxed">
            Material interativo para revisão de tópicos de processamento de linguagem natural.
            Cada módulo combina teoria, playgrounds e simulados no estilo da prova.
          </p>
        </header>

        {/* Exam module — gamified */}
        <section className="mb-12">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-fade mb-6">
            modo prova
          </h2>
          <Link
            href="/exame"
            className="group block rounded-xl border border-rubric/40 bg-card p-6 sm:p-8 transition hover:border-rubric/70 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-rubric flex items-center gap-1.5">
                  <GraduationCap size={12} /> simulado · gamificado
                </span>
                <h3 className="font-serif text-xl sm:text-2xl italic text-ink mt-1 leading-tight text-balance">
                  Língua Natural e Sistemas Conversacionais
                </h3>
                <p className="font-sans text-sm text-ink-fade mt-1">
                  Banco com {EXAM_QUESTIONS.length} questões de exames anteriores · ISEP / MEIA
                </p>
              </div>
              <ArrowRight
                size={18}
                className="text-ink-fade group-hover:text-rubric group-hover:translate-x-0.5 transition shrink-0 mt-1"
              />
            </div>
            <p className="font-sans text-sm leading-relaxed text-ink/80">
              Rondas de 10 questões aleatórias, com tempo cronometrado por questão e
              bónus pela rapidez. Sem repetições até esgotar o banco.
            </p>
          </Link>
        </section>

        {/* Course grid */}
        <section>
          <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-fade mb-6">
            módulos disponíveis — {COURSES.length}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {COURSES.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
