"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, LayoutGrid } from "lucide-react";

const ITEMS = [
  {
    href: "/",
    label: "Cursos",
    icon: LayoutGrid,
    match: (path: string) => path === "/" || path.startsWith("/cursos"),
  },
  {
    href: "/exame",
    label: "Prova",
    icon: GraduationCap,
    match: (path: string) => path.startsWith("/exame"),
  },
];

/** Sentry-style icon rail: brand tile on top, one icon + label per area. */
export default function AppRail() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Principal"
      className="sticky top-0 hidden h-screen w-[72px] shrink-0 flex-col items-center gap-3 border-r border-ledge bg-chrome py-3 lg:flex"
    >
      <Link
        href="/"
        aria-label="Início"
        className="mb-2 flex size-9 items-center justify-center rounded-lg border border-b-3 chonk border-brand-ledge bg-primary text-base font-semibold text-black"
      >
        A
      </Link>
      {ITEMS.map(({ href, label, icon: Icon, match }) => {
        const active = match(pathname);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className="group flex w-full flex-col items-center gap-1 text-[11px] font-medium text-ink-soft transition hover:text-ink"
          >
            <span
              className={`flex size-9 items-center justify-center rounded-lg border transition ${
                active
                  ? "border-[#166534] bg-[#0d2818] text-white"
                  : "border-transparent group-hover:bg-raised"
              }`}
            >
              <Icon size={18} />
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
