// Builds the downloadable Python lab from the ```python cells of chapter 08, so the page and the files never drift.
// Run: node scripts/build-world-models-lab.mjs          (writes public/labs/world-models/*.py and *.ipynb)
//      node scripts/build-world-models-lab.mjs --check  (fails if the files are out of date)
import { readFile, writeFile } from "node:fs/promises";

const MDX = new URL("../src/content/cursos/world-models/lab.mdx", import.meta.url);
const OUT = new URL("../public/labs/world-models/world_model_from_scratch", import.meta.url);

const mdx = await readFile(MDX, "utf8");
const cells = [...mdx.matchAll(/<LabCell step="(\d+)" title="([^"]*)">\s*```python\n([\s\S]*?)\n```\s*<\/LabCell>/g)].map(
  ([, step, title, code]) => ({ step, title, code }),
);
const opened = (mdx.match(/<LabCell\b/g) ?? []).length;
if (!cells.length || cells.length !== opened || cells.some((cell, i) => Number(cell.step) !== i)) {
  throw new Error(`expected ${opened} LabCells with steps 0..n in order, parsed ${cells.map((c) => c.step).join(",")}`);
}
const leaked = cells.find(({ code }) => /```|<\/?LabCell/.test(code));
if (leaked) throw new Error(`step ${leaked.step}: a LabCell must hold exactly one \`\`\`python block and nothing else`);

const intro = [
  "A world model from scratch: a tiny JEPA in PyTorch",
  "World Models (vol. x), chapter 08. Each cell is one step of the chapter.",
  "Needs torch, numpy and matplotlib (preinstalled on Colab). About 1-2 minutes on a laptop CPU.",
];

const py = [
  ...intro.slice(0, 2).map((line) => `# ${line}`),
  "# Generated from the chapter (lab.mdx) by scripts/build-world-models-lab.mjs: edit the chapter, not this file.",
  "",
  ...cells.map(({ step, title, code }) => `# %% Step ${step} — ${title}\n${code}\n`),
].join("\n");

const lines = (text) => text.split("\n").map((line, i, all) => (i < all.length - 1 ? `${line}\n` : line));
const notebook = {
  cells: [
    { cell_type: "markdown", id: "intro", metadata: {}, source: lines(`# ${intro[0]}\n\n${intro[1]}\n\n${intro[2]} Runtime → Run all.`) },
    ...cells.flatMap(({ step, title, code }) => [
      { cell_type: "markdown", id: `step-${step}-title`, metadata: {}, source: [`## Step ${step} — ${title}`] },
      { cell_type: "code", execution_count: null, id: `step-${step}-code`, metadata: {}, outputs: [], source: lines(code) },
    ]),
  ],
  metadata: {
    kernelspec: { display_name: "Python 3", language: "python", name: "python3" },
    language_info: { name: "python" },
  },
  nbformat: 4,
  nbformat_minor: 5,
};
const ipynb = `${JSON.stringify(notebook, null, 1)}\n`;

if (process.argv.includes("--check")) {
  const stale = [];
  for (const [ext, text] of [[".py", py], [".ipynb", ipynb]]) {
    const current = await readFile(new URL(OUT.href + ext), "utf8").catch(() => "");
    if (current !== text) stale.push(ext);
  }
  if (stale.length) {
    console.error(`world-models lab files out of date (${stale.join(", ")}): run node scripts/build-world-models-lab.mjs`);
    process.exit(1);
  }
  console.log(`world-models lab files up to date (${cells.length} cells)`);
} else {
  await writeFile(new URL(OUT.href + ".py"), py);
  await writeFile(new URL(OUT.href + ".ipynb"), ipynb);
  console.log(`wrote world_model_from_scratch.py and .ipynb (${cells.length} cells)`);
}
