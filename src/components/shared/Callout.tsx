import { type ReactNode, type ComponentType } from "react";

interface Props {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  children: ReactNode;
}

export default function Callout({ icon: Icon, title, children }: Props) {
  return (
    <div className="bg-card rounded-sm p-4 sm:p-5 my-5 border border-border animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={15} className="text-rubric" />
        <span className="font-serif italic text-ink">{title}</span>
      </div>
      <div className="text-muted-foreground text-sm leading-relaxed">{children}</div>
    </div>
  );
}
