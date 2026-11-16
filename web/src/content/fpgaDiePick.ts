import type { FpgaDieModuleId } from "./fpgaDie";

/** 与 web/scripts/render-xc7s15-floorplan.py 中 PICK_RGB 一致 */
const PICK_MAP: [FpgaDieModuleId, number, number, number][] = [
  ["iob", 0x2a, 0x6f, 0x8f],
  ["clb", 0x3d, 0x9a, 0x5a],
  ["bram", 0x7a, 0x5e, 0xb0],
  ["dsp", 0xc4, 0x78, 0x2a],
  ["cmt", 0xd4, 0xa8, 0x2c],
  ["config", 0x8a, 0x5a, 0x4a],
  ["xadc", 0x5a, 0x8a, 0x6a],
  ["int", 0x4a, 0x5a, 0x6a],
];

export const fpgaDieFloorplanAssets = {
  color: "/die/xc7s15-floorplan.png",
  pick: "/die/xc7s15-floorplan-pick.png",
} as const;

export const fpgaDieFloorplanNote =
  "底图来自 Vivado 2026.1 导出的 xc7s15ftgb196-1 器件版图（与晶圆上 Slice/BRAM/DSP/IOB 物理排布一致）。公开资料中尚无该料号光学显微照片。";

export function moduleIdFromPickRgb(r: number, g: number, b: number): FpgaDieModuleId | undefined {
  for (const [id, pr, pg, pb] of PICK_MAP) {
    if (Math.abs(r - pr) <= 4 && Math.abs(g - pg) <= 4 && Math.abs(b - pb) <= 4) {
      return id;
    }
  }
  return undefined;
}