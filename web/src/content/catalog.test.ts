import { describe, expect, it } from "vitest";
import { lessons, tracks } from "./catalog";

describe("catalog", () => {
  it("loads merged lessons without duplicate ids", () => {
    expect(lessons.length).toBeGreaterThan(20);
    expect(tracks.length).toBeGreaterThan(5);
    const ids = new Set(lessons.map((l) => l.id));
    expect(ids.size).toBe(lessons.length);
  });
});