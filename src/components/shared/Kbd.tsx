import { type ReactNode } from "react";

export default function Kbd({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-[12px] sm:text-[13px] bg-card px-1.5 sm:px-2 py-0.5 rounded-sm border border-border whitespace-nowrap">
      {children}
    </span>
  );
}
