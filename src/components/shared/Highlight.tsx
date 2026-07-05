import { type ReactNode } from "react";

export default function Highlight({ children }: { children: ReactNode }) {
  return (
    <span className="box-decoration-clone rounded-md bg-rubric/15 px-1.5 py-0.5 font-medium text-ink ring-1 ring-rubric/10">
      {children}
    </span>
  );
}
