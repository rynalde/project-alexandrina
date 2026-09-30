import { useMemo, useSyncExternalStore } from "react";

/** Where the reader is in each course, so a reload or the home page can resume it. */
export interface CourseNavEntry {
  active: string;
  visited: string[];
  at: number;
}

export type CourseNavStore = Record<string, CourseNavEntry>;

const KEY = "alexandrina:nav";
const listeners = new Set<() => void>();
// ponytail: in-memory fallback so navigation still works when localStorage throws (private mode).
let memory: string | null = null;

function read(): string | null {
  try {
    return window.localStorage.getItem(KEY) ?? memory;
  } catch {
    return memory;
  }
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function parseNav(raw: string | null): CourseNavStore {
  if (!raw) return {};
  try {
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") return {};
    const store: CourseNavStore = {};
    for (const [path, entry] of Object.entries(data as Record<string, Partial<CourseNavEntry>>)) {
      if (typeof entry?.active !== "string" || !Array.isArray(entry.visited)) continue;
      store[path] = {
        active: entry.active,
        visited: entry.visited.filter((id): id is string => typeof id === "string"),
        at: typeof entry.at === "number" ? entry.at : 0,
      };
    }
    return store;
  } catch {
    return {};
  }
}

const noop = () => () => {};

/** false during SSR/hydration, true after — lets UI that depends on local progress avoid a content swap. */
export function useHydrated(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}

export function useCourseNav(): CourseNavStore {
  const raw = useSyncExternalStore(subscribe, read, () => null);
  return useMemo(() => parseNav(raw), [raw]);
}

export function saveCourseNav(path: string, entry: CourseNavEntry) {
  const next = JSON.stringify({ ...parseNav(read()), [path]: entry });
  memory = next;
  try {
    window.localStorage.setItem(KEY, next);
  } catch {
    // memory fallback above keeps this session working
  }
  listeners.forEach((listener) => listener());
}

const PANEL_KEY = "alexandrina:panel";
let panelMemory: string | null = null;

function readPanel(): string | null {
  try {
    return window.localStorage.getItem(PANEL_KEY) ?? panelMemory;
  } catch {
    return panelMemory;
  }
}

function setPanelOpen(open: boolean) {
  panelMemory = open ? "1" : "0";
  try {
    window.localStorage.setItem(PANEL_KEY, panelMemory);
  } catch {
    // memory fallback keeps this session working
  }
  listeners.forEach((listener) => listener());
}

/** Lesson focus mode: the chapter panel starts closed and the choice is remembered. */
export function usePanelOpen(): [boolean, (open: boolean) => void] {
  const raw = useSyncExternalStore(subscribe, readPanel, () => null);
  return [raw === "1", setPanelOpen];
}
