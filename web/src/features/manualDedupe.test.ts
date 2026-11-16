import { describe, expect, it } from "vitest";
import { dedupeTextList } from "./manualDedupe";

describe("dedupeTextList", () => {
  it("removes items contained in anchor", () => {
    const anchor = "安装 Vivado 2018.2、License 与 IDE 主流程。";
    const out = dedupeTextList([anchor, "其他要点"], anchor);
    expect(out).toEqual(["其他要点"]);
  });
});