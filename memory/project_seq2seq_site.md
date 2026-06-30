---
name: Seq2Seq & Transformer Study Site Architecture
description: Architecture of the multi-course interactive NLP study website (Seq2Seq + Transformer) built in this project
type: project
---

Full-stack Next.js 16 (App Router) learning platform for NLP/Deep Learning content. Multi-course: each course (e.g. Seq2Seq, Transformer) is a separate route under `/cursos/<slug>` and reuses the same `CoursePage` shell + `Sidebar` + `MobileHeader`.

**Why:** User requested transformation of a React artifact into an organized Next.js website with MDX content, shadcn/ui, and lucide-react icons. Then later asked for a Transformer module mirroring the Seq2Seq structure.

**How to apply:** When extending this project, follow the established pattern — add new course in `src/lib/courses.ts`, create per-course questions/sections file (e.g. `src/lib/transformer-data.ts`), MDX content in `src/content/cursos/<slug>/`, playgrounds in `src/components/playground/`, route at `src/app/cursos/<slug>/page.tsx`. Quiz and Simulado components accept optional `source`/`questions`/`topicLabels` props for reuse across courses.

## Stack
- Next.js 16.2.4 + React 19 + TypeScript, App Router
- Tailwind CSS v4 with `@theme inline` token system  
- shadcn/ui "base-nova" style (uses @base-ui/react, NOT @radix-ui)
- @next/mdx for section content
- lucide-react icons, bun package manager

## Color tokens (globals.css)
- `--paper: #f5efe3` → `bg-paper`, `bg-background`
- `--paper-dark: #ede4d0` → `bg-card`, `bg-muted`
- `--ink: #1a1512` → `text-ink`, `text-foreground`
- `--rubric: #c7502e` → `text-rubric`, `bg-primary`

## Fonts (layout.tsx)
- `--font-fraunces` → `font-serif` (display headings)
- `--font-manrope` → `font-sans` (body)
- `--font-jetbrains` → `font-mono` (labels/code)

## Key files
- `src/lib/courses.ts` — COURSES catalog rendered on home dashboard
- `src/lib/data.ts` — Seq2Seq QUESTIONS (25), SECTIONS (10), EXAM_HISTORY, TOPIC_LABELS, exported `Question`/`Section` types
- `src/lib/transformer-data.ts` — Transformer TRANSFORMER_QUESTIONS (25), TRANSFORMER_SECTIONS (10), TRANSFORMER_TOPIC_LABELS
- `src/app/page.tsx` — home dashboard listing COURSES
- `src/app/cursos/<slug>/page.tsx` — per-course route, imports MDX sections + simulado section, renders `CoursePage`
- `src/mdx-components.tsx` — global MDX component registry (Marginalia, Callout, Highlight, Kbd, Body, SectionHeader)
- `src/content/cursos/<slug>/*.mdx` — content sections per course
- `src/components/course/CoursePage.tsx` — shared shell for any course
- `src/components/playground/` — interactive "use client" components (shared across courses)
- `src/components/quiz/QuizBlock.tsx` — accepts `topic`, optional `source: Question[]` (defaults to QUESTIONS)
- `src/components/quiz/Simulado.tsx` — accepts optional `questions` and `topicLabels` props
- `src/components/quiz/TransformerQuizBlock.tsx` + `TransformerSimuladoSection.tsx` — thin wrappers binding the transformer data
- `src/components/layout/Sidebar.tsx` + `MobileHeader.tsx` — navigation with Sheet drawer for mobile

## MDX gotcha
JSX attributes in MDX cannot contain nested double-quotes (e.g. `title="o que é "uma posição" no FFN"` fails). Use single-quotes inside or rephrase. Errors surface as `Unexpected character "U+0022" in attribute name` from `@next/mdx/mdx-js-loader`.
