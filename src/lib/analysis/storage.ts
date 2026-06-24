import type { AnalysisResult } from "@/types/analysis";

/**
 * Phase 1 is fully anonymous and stateless on the server, so a completed
 * analysis is handed to the result page via sessionStorage (per-tab, cleared
 * when the tab closes). Persistence to Supabase arrives in Phase 3.
 */
const PREFIX = "resumeai:result:";

export function saveResult(result: AnalysisResult): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(PREFIX + result.id, JSON.stringify(result));
  } catch {
    // Storage can fail (private mode / quota) — non-fatal.
  }
}

export function loadResult(id: string): AnalysisResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PREFIX + id);
    return raw ? (JSON.parse(raw) as AnalysisResult) : null;
  } catch {
    return null;
  }
}
