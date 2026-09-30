"use client";

import { useUiText } from "@/lib/ui-text";

interface Props {
  num: string;
  title: string;
  subtitle: string;
  vol?: string;
}

export default function SectionHeader({ num, title, subtitle }: Props) {
  const t = useUiText();
  return (
    <header className="mb-10 animate-fade-in">
      <p className="kicker text-rubric">
        {t.chapter} {num}
      </p>
      <h1 className="mt-2 text-4xl font-semibold leading-[1.08] tracking-tight text-white text-balance sm:text-5xl">
        {title}
      </h1>
      <p className="mt-3 text-lg text-ink-soft text-pretty first-letter:uppercase sm:text-xl">{subtitle}</p>
    </header>
  );
}
