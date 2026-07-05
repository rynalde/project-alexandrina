import { type ReactNode } from "react";

interface Props {
  label: string;
  children: ReactNode;
}

export default function Marginalia({ label, children }: Props) {
  return (
    <div className="my-5 rounded-lg border border-border bg-background p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="size-2 rounded-full bg-rubric" />
        <div className="font-mono text-[10px] uppercase tracking-widest text-rubric">
          {label}
        </div>
      </div>
      <div className="text-sm leading-7 text-muted-foreground">{children}</div>
    </div>
  );
}
