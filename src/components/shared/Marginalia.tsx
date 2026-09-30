import { type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  label: string;
  children: ReactNode;
}

export default function Marginalia({ label, children }: Props) {
  return (
    <aside className="my-8 rounded-r-xl border-l-4 border-warning/80 bg-warning/[0.06] py-4 pl-5 pr-5">
      <div className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider text-warning">
        <AlertTriangle size={14} className="shrink-0" />
        {label}
      </div>
      <div className="text-[16px] leading-7 text-ink-soft">{children}</div>
    </aside>
  );
}

/** Decorates the screen it follows instead of getting a screen of its own (see Beats). */
Marginalia.aside = true;
