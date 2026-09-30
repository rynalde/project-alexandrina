import { type ReactNode } from "react";

/** Emphasis: white text on a flat accent underline. */
export default function Highlight({ children }: { children: ReactNode }) {
  return (
    <span className="box-decoration-clone border-b-2 border-rubric/60 font-medium text-white">
      {children}
    </span>
  );
}
