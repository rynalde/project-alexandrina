import { type ReactNode } from "react";

export default function Body({ children }: { children: ReactNode }) {
  return (
    <div className="font-sans text-sm sm:text-[15px] leading-[1.75] text-ink space-y-4 max-w-[68ch]">
      {children}
    </div>
  );
}
