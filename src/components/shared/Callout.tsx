import { type ReactNode, type ComponentType } from "react";

interface Props {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  children: ReactNode;
  /** in a paged lesson, give this callout a screen of its own (e.g. the closing recap) */
  screen?: boolean;
}

export default function Callout({ icon: Icon, title, children }: Props) {
  return (
    <aside className="my-8 rounded-r-xl border-l-4 border-info bg-info/[0.07] py-4 pl-5 pr-5">
      <div className="mb-1.5 flex items-center gap-2 text-[16px] font-semibold text-white">
        <Icon size={17} className="shrink-0 text-info" />
        <span className="first-letter:uppercase">{title}</span>
      </div>
      <div className="text-[16px] leading-7 text-ink-soft">{children}</div>
    </aside>
  );
}

/** Decorates the screen it follows instead of getting a screen of its own (see Beats). */
Callout.aside = true;
