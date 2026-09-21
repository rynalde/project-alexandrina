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
    "Considere a seguinte definição de Agente:",
    "Considere que numa comunidade de agentes",
    "indique como poderia “expandir” o SMA desenvolvido",
    "Considere o problema do escalonamento de operações no bloco cirúrgico",
    "Caracterize com detalhe as linguagens KQLM e ACL.",
    "Descreva as arquiteturas por camadas",
    "especifique com detalhe uma arquitetura BDI",
    "Nos grandes mercados de peixe do mediterrâneo",
    "Apresente duas razões para a necessidade de coordenação",
    "Descreva com detalhe as 4 fases principais",
    "Agente “Facilitator” ou “Broker”",
    "A empresa de logística BoasEntregas pretende desenvolver",
    "poderia evoluir para utilizar aprendizagem por reforço multiagente (MARL)?",
    "Questão 4.a)",
    "Questão 4.b)",
    "Questão 4.c)",
    "Questão 4.d)",
    "Questão 5",
  ]) {
    assert.ok(content.includes(marker), `Falta: ${marker}`);
  }
});

test("marca conceitos com tooltips", () => {
  assert.ok((content.match(/<TermTooltip/g) ?? []).length >= 12);
  assert.ok((content.match(/Modelo de resposta/g) ?? []).length >= 23);
});
