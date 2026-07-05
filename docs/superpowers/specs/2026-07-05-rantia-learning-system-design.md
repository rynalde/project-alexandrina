# RANTIA Learning System Design

Date: 2026-07-05

## Goal

Upgrade the RAINTIA / Ambientes Inteligentes course into a clearer, more interactive learning experience while creating reusable course-learning components that other courses can adopt later.

RANTIA is the first complete rollout. Existing courses remain working as they are and serve as compatibility checks and pattern references.

Naming note: the visible course title currently uses `RAINTIA`, while route and data identifiers use `rantia`/`RANTIA`. Keep the existing visible title and existing identifiers unless a separate rename is requested.

## Current Context

The app is a Next.js course site with MDX-based course sections. Courses share `CoursePage`, `Sidebar`, `MobileHeader`, `SectionHeader`, `Body`, `Callout`, `Highlight`, `QuizBlock`, and `Simulado`.

Seq2Seq, Transformer, Perceptrons, and Metricas already use embedded quizzes and playground components. SIMAGIA and RANTIA are closer to static study guides with final assessment material and final simulados. RANTIA currently has:

- 11 main learning sections.
- A written final assessment.
- An answer key.
- A 25-question final simulado in `RANTIA_QUESTIONS`.
- Existing MDX content for all RANTIA chapters.

## Design Direction

Use the recommended layered course upgrade:

1. Keep the existing course shell and MDX model.
2. Add a reusable learning metadata and component layer.
3. Apply the layer fully to RANTIA first.
4. Use existing app content only for quizzes and exam practice.
5. Save learner progress locally in `localStorage`.

## Ponytail Constraint

Ponytail mode is part of the implementation constraints:

- Reuse existing components and patterns before adding new ones.
- Add no new dependencies unless an existing or native option cannot reasonably cover the need.
- Prefer CSS and browser APIs over custom runtime machinery.
- Keep the reusable system minimal: reusable because RANTIA needs the same patterns repeatedly, not because future courses might someday need every option.
- Mark deliberate shortcuts with `ponytail:` comments only when the ceiling is not obvious.

The first implementation should skip a generalized CMS, server-side persistence, analytics, accounts, generated question banks, and a full migration of other courses.

## Scope

Each RANTIA learning section gets a consistent structure:

1. Learn: clearer headings, flow diagrams, important emphasis blocks, and exam traps.
2. Interact: one relevant simulation, diagram explorer, matching task, flashcard drill, or decision exercise.
3. Check: a per-section quiz based on existing RANTIA app content.
4. Reflect: local progress state records section completion, quiz score, and weak-topic signals.

Out of scope for this phase:

- Importing external past-exam files.
- User accounts or remote sync.
- AI-generated quizzes.
- Migrating every existing course into the new system.
- Replacing the current `CoursePage` navigation model.

## Architecture

### Shared Types

Add `src/lib/course-learning.ts` with small reusable types:

- `LearningCourseConfig`
- `LearningSectionMeta`
- `LearningQuizItem`
- `LearningInteraction`
- `LearningProgressState`

These types describe course metadata, section learning aids, quiz mappings, interaction IDs, and progress records.

### RANTIA Config

Add `src/lib/rantia-learning.ts` to define RANTIA's learning config:

- Section learning goals.
- Key concepts.
- Exam traps.
- Interaction type per section.
- Quiz mappings to existing RANTIA topics.
- `localStorage` key: `study:rantia:progress:v1`.

### Reusable Components

Add reusable components under `src/components/learning/` only where the existing shared components are not enough:

- `LearningSection`
- `LearningObjectives`
- `ConceptFlow`
- `ImportantBlock`
- `ExamTrap`
- `SectionQuiz`
- `FlashcardDrill`
- `MatchingDrill`
- `ProgressSummary`

Where possible, these should compose existing `Body`, `Callout`, `Highlight`, `QuizBlock`, and `Simulado` instead of duplicating behavior.

### RANTIA Interactions

Add RANTIA-specific interactive components under `src/components/playground/rantia/`:

- ROS2 node-topic graph.
- ROS2 project/tooling flow.
- URDF vs SDF / Gazebo / Webots / RViz2 decision simulator.
- Computer vision pipeline explorer.
- ROS2-DDS to MQTT bridge simulator with latency, QoS, and bandwidth warnings.
- Edge AI vs cloud vs TinyML decision exercise.
- ADC, PWM, interrupt, and pull-up electronics interactions.
- MQTT QoS, wildcard, and Mosquitto drill.
- IoT cloud pipeline and digital twin loop.

Use simple local state, SVG/HTML/CSS, and the already-installed `motion` package only where animation helps explain state changes.

### CoursePage Integration

`CoursePage` receives optional learning props. Existing courses can omit them and render exactly as they do today.

RANTIA passes the learning config and progress helpers. MDX sections render learning components directly where needed.

## RANTIA Section Rollout

### 00. Visao Geral

Add a course map, estimated progress, and a "what to master" checklist.

### 01. Mapa do Curso

Add an Industry 4.0, RAMI, and cyber-physical flow diagram plus a matching drill for RAMI layers.

### 02. Fundamentos de Robotica

Add an interactive comparison for resolution, repeatability, accuracy, DoF, cobot, MoveL, and locomotion.

### 03. ROS2 Arquitetura e CLI

Add a node-topic-publisher-subscriber simulator, ROS1 vs ROS2 contrast, and command recall.

### 04. ROS2 Projeto e Ferramentas

Add a package, workspace, launch, RViz2, rqt_graph, and TF flow explorer.

### 05. Simulacao

Add a URDF vs SDF, Gazebo, Webots, and RViz2 decision simulator.

### 06. Visao Computacional

Add a camera to ROS Image to cv_bridge to OpenCV/YOLO/HSV to action pipeline explorer.

### 07. Robotica Distribuida

Add a ROS2-DDS to MQTT bridge simulator with warnings for latency, stale data, bandwidth, and QoS mismatch.

### 08. Fundamentos IoT

Add an edge AI vs cloud vs TinyML decision exercise.

### 09. Sensores e Eletronica

Add ADC, PWM, interrupt, pull-up, and Ohm's law calculator-style interactions.

### 10. Protocolos IoT e MQTT

Add MQTT QoS, wildcard, Mosquitto, and wireless protocol matching/scenario drills.

### 11. IoT Cloud e Digital Twins

Add a device to edge to cloud to analytics to dashboard/action flow and a digital twin feedback loop.

### 12/13/Infinity. Assessment, Answer Key, Simulado

Keep the existing assessment, answer key, and final simulado. Add weak-topic review links and a progress-aware recap based on completed section quizzes.

## Quiz Source Rules

Use existing app content only:

- `RANTIA_QUESTIONS`
- RANTIA assessment MDX
- RANTIA answer-key MDX
- Existing RANTIA section prose

Multiple-choice items can come from `RANTIA_QUESTIONS`. Written assessment material can become flashcards, prompts, matching tasks, or short-answer reveal cards. The UI must not claim a question came from a specific past exam unless that source exists in the app.

## Progress Model

Progress is local-only and stored in `localStorage`.

The first version tracks:

- Visited/completed sections.
- Per-section quiz answers and score.
- Completed interactions.
- Weak-topic signals from missed quiz answers.

If `localStorage` is unavailable or corrupted, the UI falls back to in-memory state for the current session.

## Error Handling

- Missing learning metadata: render the existing MDX section normally.
- Missing quiz questions for a topic: show a compact empty state and keep the section usable.
- Invalid progress JSON: ignore it and start a fresh local progress object.
- Browser without `localStorage`: continue with session-only progress.

No learning interaction should block navigation or hide the core content if it fails.

## Testing And Verification

Run the smallest useful checks:

- TypeScript build.
- Lint.
- RANTIA route renders.
- Existing course routes still render without learning config.
- Progress read/write survives reload.
- Quiz scoring and reset behavior work.
- One representative simulation interaction works.

The implementation should add focused tests only where there is non-trivial logic. Trivial presentational components do not need dedicated tests.

## Acceptance Criteria

- RANTIA has a visibly clearer learning structure across all main sections.
- Each main RANTIA section has an interaction or drill.
- Each main RANTIA section has a check activity based on existing app content.
- Progress persists locally between visits.
- Final RANTIA review can point the learner to weak topics.
- Existing courses still render.
- The reusable layer is small enough that a later course can adopt it without copying RANTIA-specific code.
