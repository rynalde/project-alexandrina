"use client";

import {
  Children,
  createContext,
  Fragment,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useState,
  type ReactNode,
} from "react";
import { motion } from "motion/react";
import Body from "@/components/shared/Body";
import { spring } from "@/lib/motion";
import { LessonStepsContext } from "@/components/course/CoursePage";

/**
 * Brilliant/Duolingo-style screens. A lesson is cut into "beats" and only one is on screen;
 * the page's Continue and Back buttons page through them. A beat starts at every `###` inside
 * <Body>, at text that follows an interaction, and at an interaction that follows another one
 * or follows text plus asides. So text may lead into its interaction, but never trails it.
 * Asides (callouts) stay on the screen they follow.
 */

type Kind = "body" | "widget" | "aside" | "screen";
type Block = { kind: Kind; h3: boolean; words: number; node: ReactNode };

/** Plain-text word count of an MDX subtree (for the screen-length budget). */
function wordsOf(node: ReactNode): number {
  if (typeof node === "string") return node.split(/\s+/).filter(Boolean).length;
  if (Array.isArray(node)) return node.reduce((sum: number, child) => sum + wordsOf(child), 0);
  if (isValidElement<{ children?: ReactNode }>(node)) return wordsOf(node.props.children);
  return 0;
}

// ponytail: a word budget stands in for measuring rendered height; a widget after this much
// text moves to the next screen. Measure the DOM instead if screens still overflow.
const SCREEN_WORDS = 110;

/** Components that decorate a screen instead of being one (callouts, trap boxes) set `aside = true`;
 *  ones that always need a screen of their own (quizzes) set `screen = true`, and so does any
 *  element given a `screen` prop (e.g. a chapter's closing recap callout). */
function kindOf(node: ReactNode): Kind {
  if (!isValidElement<{ screen?: boolean }>(node) || typeof node.type !== "function") return "widget";
  const type = node.type as { aside?: boolean; screen?: boolean };
  if (node.props.screen || type.screen) return "screen";
  return type.aside ? "aside" : "widget";
}

const isBlank = (node: ReactNode) => typeof node === "string" && !node.trim();
const isH3 = (node: ReactNode) => isValidElement(node) && node.type === "h3";

/** A component placed directly in <Body> (a check, a figure) is its own block, still inside <Body>. */
const isComponent = (node: ReactNode) => isValidElement(node) && typeof node.type === "function";

function toBlocks(children: ReactNode): Block[] {
  const blocks: Block[] = [];
  Children.toArray(children).forEach((child) => {
    if (isBlank(child)) return;
    if (!isValidElement<{ children?: ReactNode }>(child) || child.type !== Body) {
      blocks.push({ kind: kindOf(child), h3: false, words: 0, node: child });
      return;
    }
    let part: ReactNode[] = [];
    const flush = () => {
      if (!part.length) return;
      blocks.push({
        kind: "body",
        h3: isH3(part[0]),
        words: wordsOf(part),
        node: <Body key={`body-${blocks.length}`}>{part}</Body>,
      });
      part = [];
    };
    Children.toArray(child.props.children).forEach((node) => {
      if (isBlank(node)) return;
      if (isH3(node) || isComponent(node)) flush();
      if (isComponent(node)) {
        blocks.push({ kind: kindOf(node), h3: false, words: 0, node: <Body key={`body-${blocks.length}`}>{node}</Body> });
        return;
      }
      part.push(node);
    });
    flush();
  });
  return blocks;
}

function toBeats(blocks: Block[]): ReactNode[][] {
  const beats: ReactNode[][] = [];
  let current: ReactNode[] = [];
  let hasBody = false;
  let hasWidget = false;
  let words = 0;
  let prev: Kind | null = null;
  for (const block of blocks) {
    const split =
      block.kind === "body"
        ? (hasBody && (block.h3 || prev !== "body")) || prev === "widget"
        : block.kind === "widget"
          ? hasWidget || (hasBody && prev === "aside") || words > SCREEN_WORDS
          : block.kind === "screen" && current.length > 0;
    if (split) {
      beats.push(current);
      current = [];
      hasBody = false;
      hasWidget = false;
      words = 0;
    }
    current.push(block.node);
    words += block.words;
    // nothing joins a screen-of-its-own
    hasBody ||= block.kind === "body" || block.kind === "screen";
    hasWidget ||= block.kind === "widget" || block.kind === "screen";
    prev = block.kind;
  }
  if (current.length) beats.push(current);
  return beats;
}

const GateContext = createContext<{ beat: number; gate: (key: string, open: boolean) => void } | null>(null);

/**
 * A question inside a beat calls this with `answered`. While the screen on view holds an
 * unanswered question, the page's Continue turns into a quiet "Skip" (Duolingo's footer).
 */
export function useBeatGate(answered: boolean) {
  const ctx = useContext(GateContext);
  const id = useId();
  const key = ctx ? `${ctx.beat}:${id}` : null;
  const gate = ctx?.gate;
  useEffect(() => {
    if (key && gate) gate(key, !answered);
  }, [key, gate, answered]);
  useEffect(() => () => {
    if (key && gate) gate(key, false);
  }, [key, gate]);
}

export default function Beats({ children, active = true }: { children: ReactNode; active?: boolean }) {
  const beats = toBeats(toBlocks(children));
  const total = beats.length;
  const register = useContext(LessonStepsContext)?.registerBeats;
  // `seen` = furthest screen reached: visited screens stay mounted (hidden) so answers survive Back.
  const [page, setPage] = useState({ index: 0, seen: 0 });
  const index = Math.min(page.index, total - 1);
  // "beat:id" of every question still waiting for an answer
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const gate = useCallback(
    (key: string, open: boolean) =>
      setOpenKeys((keys) =>
        open ? (keys.includes(key) ? keys : [...keys, key]) : keys.filter((k) => k !== key)
      ),
    []
  );
  const pending = openKeys.some((key) => key.startsWith(`${index}:`));

  useEffect(() => {
    // a single screen has nothing to page; it only reports while it holds an open question
    if (!register || !active || (total < 2 && !pending)) return;
    register({
      shown: index + 1,
      total,
      pending,
      next: () =>
        setPage(({ index, seen }) => ({ index: Math.min(index + 1, total - 1), seen: Math.max(seen, index + 1) })),
      prev: () => setPage(({ index, seen }) => ({ index: Math.max(index - 1, 0), seen })),
    });
    return () => register(null);
  }, [register, active, index, total, pending]);

  // Outside a course page there is no Continue button: show every beat.
  if (!register) {
    return beats.map((beat, i) => (
      <GateContext.Provider key={i} value={{ beat: i, gate }}>
        <section className={i > 0 ? "mt-10" : ""}>{beat}</section>
      </GateContext.Provider>
    ));
  }

  return beats.slice(0, Math.max(page.seen, index) + 1).map((beat, i) => (
    <GateContext.Provider key={i} value={{ beat: i, gate }}>
      <motion.section
        className={i === index ? "space-y-5" : "hidden"}
        // off-screen beats park on their side, so a screen always slides in from where it sits
        initial={i === 0 ? false : { opacity: 0, x: 48 }}
        animate={i === index ? { opacity: 1, x: 0 } : { opacity: 0, x: i < index ? -48 : 48 }}
        transition={spring}
      >
        {beat}
      </motion.section>
    </GateContext.Provider>
  ));
}

/** True inside a chapter's opening screen (title + goals). */
export const IntroContext = createContext(false);

/** MobileStepScreens sets `lessonSteps = true`; everything above it is the chapter's intro screen. */
const isSteps = (node: ReactNode) =>
  isValidElement(node) && typeof node.type === "function" && Boolean((node.type as { lessonSteps?: boolean }).lessonSteps);

function LessonWithIntro({ intro, rest }: { intro: ReactNode[]; rest: ReactNode[] }) {
  const lesson = useContext(LessonStepsContext);
  const register = lesson?.registerIntro;
  const showIntro = Boolean(lesson?.intro);

  useEffect(() => {
    if (!register) return;
    register(true);
    return () => register(false);
  }, [register]);

  return (
    <>
      {showIntro ? (
        <IntroContext.Provider value>
          <section>{intro}</section>
        </IntroContext.Provider>
      ) : null}
      <div hidden={showIntro}>{rest}</div>
    </>
  );
}

/** MDX `wrapper`: MDX hands us <_createMdxContent/>; unwrap it so Beats sees the top-level blocks. */
export function MdxLesson({ children }: { children?: ReactNode }) {
  let content = children;
  // ponytail: calling the compiled content function (it has no hooks) is how a wrapper reaches the
  // blocks; if a future MDX version changes this, Beats just receives one block and shows it all.
  if (isValidElement<object>(content) && typeof content.type === "function") {
    content = (content.type as (props: object) => ReactNode)(content.props);
  }
  if (isValidElement<{ children?: ReactNode }>(content) && content.type === Fragment) {
    content = content.props.children;
  }
  const nodes = Children.toArray(content).filter((node) => !isBlank(node));
  const stepsAt = nodes.findIndex(isSteps);
  if (stepsAt > 0) return <LessonWithIntro intro={nodes.slice(0, stepsAt)} rest={nodes.slice(stepsAt)} />;
  return <Beats>{content}</Beats>;
}
