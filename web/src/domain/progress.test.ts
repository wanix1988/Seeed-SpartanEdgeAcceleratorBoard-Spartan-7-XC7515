import { describe, expect, it } from "vitest";
import { emptyProgress, lessonDone, toggleStep } from "./progress";

describe("progress", () => {
  it("marks a lesson done only after every step is ticked", () => {
    let progress = emptyProgress();
    progress = toggleStep(progress, "00", 2, 0);
    expect(lessonDone(progress, "00", 2)).toBe(false);
    progress = toggleStep(progress, "00", 2, 1);
    expect(lessonDone(progress, "00", 2)).toBe(true);
    progress = toggleStep(progress, "00", 2, 0);
    expect(lessonDone(progress, "00", 2)).toBe(false);
  });
});
