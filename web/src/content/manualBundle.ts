import type { Lesson } from "./catalog-types";
import raw from "./manualContent.json";

export type ManualExperiment = {
  id: string;
  number: number;
  purpose_zh: string;
  content_zh: string;
  requirement_zh: string;
  purpose_zh_body?: string;
  content_zh_body?: string;
  requirement_zh_body?: string;
  purpose_en?: string;
  content_en?: string;
  requirement_en?: string;
  result_en?: string;
  result_zh?: string;
  procedure: string;
  procedure_zh?: string;
  guide_zh?: string;
  zh_reviewed?: boolean;
  steps: string[];
  steps_zh?: string[];
};

export type ManualChapter = {
  id: string;
  title: string;
  goal_zh: string;
  goal_en?: string;
  procedure: string;
  procedure_zh?: string;
  guide_zh?: string;
  zh_reviewed?: boolean;
  steps: string[];
  steps_zh?: string[];
};

const data = raw as {
  experiments: ManualExperiment[];
  fpga: ManualChapter[];
  esp32: ManualChapter[];
};

export function manualExperiment(id: string): ManualExperiment | undefined {
  return data.experiments.find((row) => row.id === id);
}

export function manualChapter(id: string): ManualChapter | undefined {
  return data.fpga.find((row) => row.id === id) ?? data.esp32.find((row) => row.id === id);
}

export function manualStepCount(lessonId: string, fallback: number): number {
  const exp = manualExperiment(lessonId);
  if (exp) {
    return Math.max(exp.steps.length, exp.steps_zh?.length ?? 0) || fallback;
  }
  const ch = manualChapter(lessonId);
  if (ch) {
    return Math.max(ch.steps.length, ch.steps_zh?.length ?? 0) || fallback;
  }
  return fallback;
}

export function stepCountForLesson(lesson: Lesson): number {
  const manual = manualStepCount(lesson.id, 0);
  return manual > 0 ? manual : lesson.steps.length;
}