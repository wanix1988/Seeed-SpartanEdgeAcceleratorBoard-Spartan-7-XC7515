import { emptyProgress, type Progress } from "../domain/progress";

const KEY = "sea-labs.progress.v1";

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyProgress();
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return emptyProgress();
    const record = parsed as Partial<Progress>;
    return {
      checks: record.checks && typeof record.checks === "object" ? record.checks : {},
      lastLessonId: typeof record.lastLessonId === "string" ? record.lastLessonId : null,
      theme: record.theme === "light" ? "light" : "dark",
    };
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(progress: Progress): void {
  localStorage.setItem(KEY, JSON.stringify(progress));
}
