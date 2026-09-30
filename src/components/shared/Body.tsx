import { type ReactNode } from "react";

export default function Body({ children }: { children: ReactNode }) {
  return (
    <div className="lesson-body max-w-[66ch] space-y-5 font-sans text-[17px] leading-[1.75] text-ink sm:text-[18px] [&_h3]:mb-3 [&_h3]:mt-2 [&_h3]:text-[23px] [&_h3]:font-semibold [&_h3]:leading-tight [&_h3]:text-white sm:[&_h3]:text-[26px] [&_li]:leading-[1.75] [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_li]:pl-1 [&_li::marker]:text-rubric [&_p]:text-pretty [&_strong]:font-semibold [&_strong]:text-white [&_code]:rounded [&_code]:bg-chrome [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_a]:text-rubric [&_a]:underline [&_a]:decoration-rubric/50 [&_a]:underline-offset-2 [&_a:hover]:decoration-rubric">
      {children}
    </div>
  );
}
