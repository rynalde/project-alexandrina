"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";
import { spring } from "@/lib/motion";

/** One place for motion defaults; "user" swaps transforms for fades under prefers-reduced-motion. */
export default function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={spring}>
      {children}
    </MotionConfig>
  );
}
