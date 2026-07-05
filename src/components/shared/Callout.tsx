import { type ReactNode, type ComponentType } from "react";

interface Props {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  children: ReactNode;
}

export default function Callout({ icon: Icon, title, children }: Props) {
  return (
    <div className="my-6 rounded-lg border border-border bg-card p-4 shadow-[0_12px_30px_rgba(26,21,18,0.05)] animate-fade-in sm:p-5">
      <div className="mb-3 flex items-start gap-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-rubric/20 bg-rubric/10 text-rubric">
          <Icon size={15} />
        </span>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-rubric">
            destaque
          </div>
          <div className="font-serif text-lg italic leading-tight text-ink">
            {title}
          </div>
        </div>
      </div>
      <div className="text-sm leading-7 text-muted-foreground">{children}</div>
    </div>
  );
}
