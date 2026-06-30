import { type ReactNode } from "react";

interface Props {
  label: string;
  children: ReactNode;
}

export default function Marginalia({ label, children }: Props) {
  return (
    <div className="border-l-2 border-rubric pl-4 py-1 my-4">
      <div className="font-mono text-[10px] uppercase tracking-widest text-rubric mb-1">
        {label}
      </div>
      <div className="text-muted-foreground text-sm leading-relaxed">{children}</div>
    </div>
  );
}
