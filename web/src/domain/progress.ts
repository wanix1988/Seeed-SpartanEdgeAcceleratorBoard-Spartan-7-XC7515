export type Progress = {
  checks: Record<string, boolean[]>;
  lastLessonId: string | null;
  theme: "dark" | "light";
};

export function emptyProgress(): Progress {
  return { checks: {}, lastLessonId: null, theme: "dark" };
}

export function toggleStep(progress: Progress, lessonId: string, stepCount: number, index: number): Progress {
  const current = progress.checks[lessonId] ?? [];
  const next = Array.from({ length: stepCount }, (_, step) => current[step] === true);
  next[index] = !next[index];
  return {
    ...progress,
    lastLessonId: lessonId,
    checks: { ...progress.checks, [lessonId]: next },
  };
}

export function visitLesson(progress: Progress, lessonId: string): Progress {
  return { ...progress, lastLessonId: lessonId };
}

export function lessonDone(progress: Progress, lessonId: string, stepCount: number): boolean {
  const checks = progress.checks[lessonId];
  if (!checks || checks.length < stepCount) return false;
  return checks.slice(0, stepCount).every(Boolean);
}
