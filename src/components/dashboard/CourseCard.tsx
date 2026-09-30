"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, CircleCheck, Play } from "lucide-react";
import { COURSES, type Course } from "@/lib/courses";
import { useCourseNav, useHydrated } from "@/lib/course-nav";
import { buttonVariants } from "@/components/ui/button";
import type { ReactNode } from "react";

const pathOf = (course: Course) => `/cursos/${course.slug}`;

/**
 * Staggered entrance for dashboard blocks (order = index). Plain CSS so it runs on first
 * paint of the server HTML instead of waiting for hydration.
 */
export function Reveal({
  index = 0,
  className = "",
  children,
}: {
  index?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`animate-rise ${className}`} style={{ animationDelay: `${Math.min(index, 10) * 50}ms` }}>
      {children}
    </div>
  );
}

function ProgressBar({ value, total }: { value: number; total: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-ledge">
      <div
        className="h-full rounded-full bg-success transition-[width] duration-500"
        style={{ width: `${Math.min(1, value / total) * 100}%` }}
      />
    </div>
  );
}

/** Brilliant-style "pick up where you left off" — the most recently opened course. */
export function ContinueCard() {
  const nav = useCourseNav();
  const hydrated = useHydrated();
  const recent = COURSES.map((course) => ({ course, entry: nav[pathOf(course)] }))
    .filter((item) => item.entry)
    .sort((a, b) => b.entry.at - a.entry.at)[0];

  // Progress lives in localStorage: hold the slot until we know which card to show.
  if (!hydrated) {
    return <div aria-hidden="true" className="min-h-[216px] rounded-2xl border border-border bg-card" />;
  }

  if (!recent) {
    const first = COURSES[COURSES.length - 1];
    return (
      <div className="animate-fade-in rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="kicker text-rubric">começar</div>
        <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl">Escolhe um caderno e começa</h2>
        <p className="mt-2 max-w-[55ch] text-[15px] leading-7 text-ink-soft">
          Cada capítulo mistura teoria curta, interações e um checkpoint. O progresso fica guardado neste browser.
        </p>
        <Link
          href={pathOf(first)}
          className={buttonVariants({ className: "mt-5 h-12 px-6 text-base" })}
        >
          <Play size={16} />
          Começar {first.title}
        </Link>
      </div>
    );
  }

  const { course, entry } = recent;
  const done = entry.visited.length;

  return (
    <div className="animate-fade-in rounded-2xl border border-[#166534] bg-card p-5 sm:p-6">
      <div className="kicker text-[#bbf7d0]">
        continuar · {course.vol}
      </div>
      <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl">{course.title}</h2>
      <p className="mt-1 text-[15px] text-ink-soft">{course.subtitle}</p>
      <div className="mt-5 flex items-center gap-3">
        <div className="flex-1">
          <ProgressBar value={done} total={course.sectionCount} />
        </div>
        <span className="font-mono text-[12px] text-ink-soft">
          {Math.min(done, course.sectionCount)}/{course.sectionCount}
        </span>
      </div>
      <Link
        href={pathOf(course)}
        className={buttonVariants({ className: "mt-5 h-12 w-full px-6 text-base sm:w-auto" })}
      >
        Continuar
        <ArrowRight size={17} />
      </Link>
    </div>
  );
}

export default function CourseCard({ course, index = 0 }: { course: Course; index?: number }) {
  const entry = useCourseNav()[pathOf(course)];
  const done = entry?.visited.length ?? 0;

  return (
    <Reveal index={index} className="flex">
    <Link
      href={pathOf(course)}
      className="group flex flex-1 flex-col rounded-2xl border border-b-3 chonk border-border bg-card p-5 hover:border-rubric/60 hover:bg-raised sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="kicker text-rubric">
            {course.vol}
          </span>
          <h2 className="mt-1 text-lg font-semibold leading-tight text-white text-balance sm:text-xl">
            {course.title}
          </h2>
          <p className="mt-1 text-[14px] text-ink-soft">{course.subtitle}</p>
        </div>
        <ArrowRight
          size={18}
          className="mt-1 shrink-0 text-ink-fade transition group-hover:translate-x-0.5 group-hover:text-rubric"
        />
      </div>

      <p className="mt-4 line-clamp-3 text-[14px] leading-6 text-ink-soft text-pretty">
        {course.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {course.topics.slice(0, 4).map((t) => (
          <span
            key={t}
            className="rounded-md border border-ledge bg-chrome px-2 py-0.5 font-mono text-[11px] text-ink-soft"
          >
            {t}
          </span>
        ))}
        {course.topics.length > 4 ? (
          <span className="px-1 py-0.5 font-mono text-[11px] text-ink-fade">
            +{course.topics.length - 4}
          </span>
        ) : null}
      </div>

      <div className="mt-auto pt-5">
        <div className="mb-3 flex items-center gap-4 text-ink-soft">
          <span className="flex items-center gap-1.5 font-mono text-[12px]">
            <BookOpen size={13} /> {course.sectionCount} capítulos
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[12px]">
            <CircleCheck size={13} /> {course.questionCount} questões
          </span>
          {done ? (
            <span className="ml-auto font-mono text-[12px] text-success">
              {Math.min(done, course.sectionCount)}/{course.sectionCount}
            </span>
          ) : null}
        </div>
        <ProgressBar value={done} total={course.sectionCount} />
      </div>
    </Link>
    </Reveal>
  );
}
