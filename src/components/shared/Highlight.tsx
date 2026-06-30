import { type ReactNode } from "react";

export default function Highlight({ children }: { children: ReactNode }) {
  return (
    <span className="bg-rubric/15 text-ink px-1 rounded-sm">{children}</span>
  );
}
