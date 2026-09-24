"use client";

import Image from "next/image";
import { useRef, useState, type ReactNode } from "react";
import { Check, Copy, Download, FlaskConical, Terminal } from "lucide-react";
import { CompleteButton, LabShell } from "./ui";

/**
 * Building blocks for chapter 08's Python lab. The code lives in lab.mdx as ```python blocks;
 * scripts/build-world-models-lab.mjs turns those same blocks into the downloadable .py and .ipynb.
 */

const LAB_DIR = "/labs/world-models";

export function LabCell({ step, title, children }: { step: string; title: string; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(box.current?.querySelector("code")?.textContent ?? "");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked (e.g. insecure context): the code can still be selected by hand
    }
  };

  return (
    <div className="my-5 overflow-hidden rounded-lg border border-border bg-card shadow-[0_12px_30px_rgba(26,21,18,0.05)]">
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex shrink-0 items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-rubric">
            <Terminal size={12} /> step {step}
          </span>
          <span className="truncate font-serif text-[15px] italic text-ink">{title}</span>
        </div>
        <button
          type="button"
          onClick={copy}
          aria-label={`Copy the code of step ${step}`}
          className="flex min-h-8 shrink-0 items-center gap-1 rounded-md border border-border bg-background px-2 font-mono text-[10px] uppercase tracking-widest text-ink transition hover:border-rubric/40"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? "copied" : "copy"}
        </button>
      </div>
      <div
        ref={box}
        className="max-h-[560px] overflow-auto bg-ink text-paper [&_code]:font-mono [&_code]:text-[12px] [&_code]:leading-relaxed [&_pre]:m-0 [&_pre]:w-max [&_pre]:min-w-full [&_pre]:p-3.5"
      >
        {children}
      </div>
    </div>
  );
}

export function LabOutput({ children, label = "what our run printed" }: { children: ReactNode; label?: string }) {
  return (
    <div className="my-4 rounded-lg border border-dashed border-rubric/40 bg-rubric/[0.04] p-3">
      <div className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-rubric">{label}</div>
      <div className="overflow-x-auto [&_code]:font-mono [&_code]:text-[11.5px] [&_code]:leading-relaxed [&_code]:text-ink [&_pre]:m-0">{children}</div>
    </div>
  );
}

export function LabFigure({ src, alt, width, height, caption }: { src: string; alt: string; width: number; height: number; caption: string }) {
  return (
    <figure className="my-5 rounded-lg border border-border bg-white p-3">
      <Image src={`${LAB_DIR}/${src}`} alt={alt} width={width} height={height} unoptimized className="mx-auto h-auto w-full max-w-[640px]" />
      <figcaption className="mt-2 text-center text-xs leading-relaxed text-muted-foreground">{caption}</figcaption>
    </figure>
  );
}

export function LabDownloads() {
  const files = [
    { href: `${LAB_DIR}/world_model_from_scratch.ipynb`, label: "notebook (.ipynb)", note: "for Colab or Jupyter" },
    { href: `${LAB_DIR}/world_model_from_scratch.py`, label: "script (.py)", note: "for a terminal" },
  ];
  return (
    <LabShell icon={<FlaskConical size={15} />} title="Get the lab" kicker="python lab">
      <div className="grid gap-2 sm:grid-cols-2">
        {files.map((file) => (
          <a
            key={file.href}
            href={file.href}
            download
            className="flex min-h-12 items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm text-ink transition hover:border-rubric/40"
          >
            <Download size={15} className="shrink-0 text-rubric" />
            <span>
              <span className="font-medium">{file.label}</span>
              <span className="block text-xs text-muted-foreground">{file.note}</span>
            </span>
          </a>
        ))}
      </div>
      <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
        <li>
          <b className="text-ink">Colab:</b> File → Upload notebook → pick the .ipynb → Runtime → Run all. Nothing to install.
        </li>
        <li>
          <b className="text-ink">Your machine:</b> <code className="font-mono text-[12px] text-ink">pip install torch numpy matplotlib</code>, then{" "}
          <code className="font-mono text-[12px] text-ink">python world_model_from_scratch.py</code>.
        </li>
        <li>Or copy the cells below one by one — they are the same code, in the same order.</li>
      </ol>
    </LabShell>
  );
}

export function LabFinish({ items }: { items: string[] }) {
  return (
    <LabShell icon={<Check size={15} />} title="Did your run match?" kicker="python lab">
      <ul className="space-y-1.5 text-sm leading-relaxed text-ink">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-rubric" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <CompleteButton interactionId="wm-python-lab" />
    </LabShell>
  );
}
