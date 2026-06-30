interface Props {
  num: string;
  title: string;
  subtitle: string;
  vol?: string;
}

export default function SectionHeader({ num, title, subtitle, vol = "vol. iv" }: Props) {
  return (
    <div className="mb-8 sm:mb-10 animate-fade-in">
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-rubric mb-2">
        capítulo {num} — caderno · {vol}
      </div>
      <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-ink leading-[1.05] tracking-tight text-balance">
        {title}
      </h1>
      <p className="font-serif italic text-lg sm:text-xl text-ink-soft mt-2 text-pretty">
        {subtitle}
      </p>
      <div className="mt-5 sm:mt-6 w-16 h-px bg-ink opacity-40" />
    </div>
  );
}
