# SIMAGIA — Exames Resolvidos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Incluir os três exames SIMAGIA recebidos com respostas-modelo e tooltips acessíveis na chave de respostas existente.

**Architecture:** O conteúdo fica no MDX da secção `answer_key`, já renderizado pela página de SIMAGIA. Um único componente reutilizável de tooltip fornece explicações breves sem adicionar dependências ou estado de cliente.

**Tech Stack:** Next.js 16.2.4, React 19.2.4, MDX, Tailwind CSS v4, Node test runner.

## Global Constraints

- Preservar a navegação `answer_key` e não alterar o simulado de escolha múltipla.
- Manter os enunciados em português tal como fornecidos; a imagem 2022 duplicada não conta como exame adicional.
- Colocar cada resposta imediatamente abaixo da pergunta ou alínea correspondente.
- Não adicionar dependências.
- Tornar os tooltips utilizáveis com rato, teclado e toque.

---

### Task 1: Criar a verificação de cobertura dos exames

**Files:**
- Create: `tests/simagia-exames.test.mjs`
- Test: `tests/simagia-exames.test.mjs`

**Interfaces:**
- Consumes: `src/content/cursos/simagia/answer-key.mdx`.
- Produces: um teste Node que prova que a secção contém 2021, 2022, 2024, as alíneas e tooltips.

- [ ] **Step 1: Write the failing test**

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const content = await readFile(
  new URL("../src/content/cursos/simagia/answer-key.mdx", import.meta.url),
  "utf8"
);

test("inclui todos os exames e alíneas SIMAGIA recebidos", () => {
  for (const marker of [
    "Exame de Época Normal — 9 de julho de 2021",
    "Exame de Época Normal — 8 de julho de 2022",
    "Exame de Época Normal — 2 de julho de 2024",
    "Questão 4.a)",
    "Questão 4.b)",
    "Questão 4.c)",
    "Questão 4.d)",
    "Questão 5",
  ]) assert.ok(content.includes(marker), `Falta: ${marker}`);
});

test("marca conceitos com tooltips", () => {
  assert.ok((content.match(/<TermTooltip/g) ?? []).length >= 12);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/simagia-exames.test.mjs`

Expected: FAIL porque a chave atual ainda não contém os três exames nem o componente `TermTooltip`.

### Task 2: Adicionar tooltip sem estado e acessível

**Files:**
- Create: `src/components/shared/TermTooltip.tsx`
- Modify: `src/content/cursos/simagia/answer-key.mdx:1`

**Interfaces:**
- Consumes: `term: string`, `definition: string` e `children?: ReactNode`.
- Produces: `TermTooltip`, um botão de texto focável com uma caixa `role="tooltip"` mostrada por hover ou foco.

- [ ] **Step 1: Write minimal implementation**

```tsx
import type { ReactNode } from "react";

interface TermTooltipProps {
  term: string;
  definition: string;
  children?: ReactNode;
}

export default function TermTooltip({ term, definition, children }: TermTooltipProps) {
  return (
    <span className="group relative inline-flex align-baseline">
      <button type="button" aria-label={`${term}: ${definition}`} className="border-b border-dotted border-rubric/70 font-medium text-rubric underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rubric/60">
        {children ?? term}
      </button>
      <span role="tooltip" className="pointer-events-none invisible absolute bottom-full left-0 z-20 mb-2 w-64 rounded-md border border-border bg-card p-3 text-left font-sans text-sm font-normal leading-relaxed text-ink opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        {definition}
      </span>
    </span>
  );
}
```

- [ ] **Step 2: Use the component in the MDX content**

Import `TermTooltip` alongside the existing shared components and use it for
the recurring concepts listed in the design document.

### Task 3: Substituir a chave genérica pelos exames resolvidos

**Files:**
- Modify: `src/content/cursos/simagia/answer-key.mdx:1`

**Interfaces:**
- Consumes: `SectionHeader`, `Body`, `Callout`, `Marginalia`, `Kbd`, `Highlight` e `TermTooltip`.
- Produces: três secções de exame, com cada resposta imediatamente depois do respetivo enunciado.

- [ ] **Step 1: Add 2021 content**

Incluir as quatro perguntas e as alíneas 4.a–4.c: propriedades de agentes,
adequação multi-critério do Contract Net, expansão do Challenge 4 e
escalonamento do bloco cirúrgico com diagrama de sequência e exemplo.

- [ ] **Step 2: Add 2022 content**

Incluir KQML/ACL, arquiteturas horizontal/vertical por camadas, BDI do
Challenge 4 e o mercado de peixe com 4.a–4.d, incluindo o leilão holandês
multiunidade e diagrama de sequência.

- [ ] **Step 3: Add 2024 content**

Incluir coordenação, as quatro fases de negociação, Facilitator/Broker,
BoasEntregas com 4.a–4.c e MARL/RL, incluindo o fluxo de mensagens do
armazém.

### Task 4: Verificar a alteração

**Files:**
- Test: `tests/simagia-exames.test.mjs`

- [ ] **Step 1: Run coverage test**

Run: `node --test tests/simagia-exames.test.mjs`

Expected: PASS com dois testes.

- [ ] **Step 2: Run static checks**

Run: `npm run lint && npm run build`

Expected: comandos terminam com código 0 e o build compila os ficheiros MDX.

- [ ] **Step 3: Check visual behaviour**

Run the local application, open `/cursos/simagia`, navigate to “Chave de
Respostas”, and confirm a tooltip opens on hover and keyboard focus without
obscuring the term or clipping the text.
