import { type ReactNode } from "react";

export default function Body({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-[68ch] space-y-5 font-sans text-[15px] leading-7 text-ink sm:text-[15px] sm:leading-[1.8] [&_h3]:mb-2 [&_h3]:mt-8 [&_h3]:font-serif [&_h3]:text-[22px] [&_h3]:font-normal [&_h3]:italic [&_h3]:leading-tight [&_h3]:text-ink [&_li]:leading-7 [&_p]:text-pretty">
      {children}
    </div>
  );
}
