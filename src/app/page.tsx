import Link from "next/link";
import { ArrowRight, GraduationCap, Timer } from "lucide-react";
import { COURSES } from "@/lib/courses";
import CourseCard, { ContinueCard, Reveal } from "@/components/dashboard/CourseCard";
import AppRail from "@/components/layout/AppRail";
import { EXAM_QUESTIONS } from "@/lib/exam";

export default function Home() {
  return (
    <div className="min-h-screen bg-chrome font-sans text-ink lg:flex">
      <AppRail />

      <main className="paper-texture min-w-0 flex-1">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-ledge bg-chrome px-4 sm:px-6">
          <span className="flex size-8 items-center justify-center rounded-lg border border-b-3 chonk border-brand-ledge bg-primary text-sm font-semibold text-black lg:hidden">
            A
          </span>
          <h1 className="text-[15px] font-semibold text-ink">Cursos</h1>
          <span className="rounded-md bg-ledge px-2 py-0.5 font-mono text-[12px] text-ink-soft">
            {COURSES.length}
          </span>
          <Link
            href="/exame"
            className="ml-auto flex items-center gap-1.5 rounded-lg px-2 py-1 text-[13px] text-ink-soft hover:bg-raised hover:text-ink lg:hidden"
          >
            <GraduationCap size={16} /> Prova
          </Link>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
          <header className="mb-8">
            <p className="kicker text-rubric">
              cadernos de estudo
            </p>
            <h2 className="mt-2 text-3xl font-semibold leading-tight text-white text-balance sm:text-4xl">
              NLP & Deep Learning
            </h2>
            <p className="mt-3 max-w-[60ch] text-[16px] leading-7 text-ink-soft text-pretty">
              Teoria curta, interações para experimentar e checkpoints com feedback imediato.
              Um capítulo de cada vez.
            </p>
          </header>

          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <Reveal index={0} className="flex [&>*]:flex-1">
              <ContinueCard />
            </Reveal>

            {/* Exam module — gamified */}
            <Reveal index={1} className="flex">
            <Link
              href="/exame"
              className="group flex flex-1 flex-col rounded-2xl border border-b-3 chonk border-border bg-card p-5 hover:border-warning/60 hover:bg-raised sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="flex items-center gap-1.5 kicker text-warning">
                  <GraduationCap size={13} /> modo prova
                </span>
                <ArrowRight
                  size={18}
                  className="shrink-0 text-ink-fade transition group-hover:translate-x-0.5 group-hover:text-warning"
                />
              </div>
              <h3 className="mt-1 text-lg font-semibold leading-tight text-white text-balance sm:text-xl">
                Língua Natural e Sistemas Conversacionais
              </h3>
              <p className="mt-2 text-[14px] leading-6 text-ink-soft">
                Rondas de 10 questões aleatórias, cronometradas, com bónus pela rapidez.
              </p>
              <div className="mt-auto flex items-center gap-4 pt-4 font-mono text-[12px] text-ink-soft">
                <span>{EXAM_QUESTIONS.length} questões</span>
                <span className="flex items-center gap-1">
                  <Timer size={13} /> ISEP / MEIA
                </span>
              </div>
            </Link>
            </Reveal>
          </div>

          <section className="mt-10">
            <h2 className="mb-4 kicker text-ink-soft">
              módulos disponíveis
            </h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[...COURSES].reverse().map((course, index) => (
                <CourseCard key={course.slug} course={course} index={index + 2} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
