import { useState } from "react";

export type ViewMode = "card" | "list";

const KEY = "aqualine.catalogView";

export function useViewMode() {
  const [mode, setMode] = useState<ViewMode>(() => {
    try {
      return localStorage.getItem(KEY) === "list" ? "list" : "card";
    } catch {
      return "card";
    }
  });

  const update = (next: ViewMode) => {
    setMode(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* ignore quota / private mode */
    }
  };

  return [mode, update] as const;
}
